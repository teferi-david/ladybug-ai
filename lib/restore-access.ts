import type Stripe from 'stripe'
import {
  getSubscriptionPeriodEndIso,
  getPeriodEndIsoFromSubscriptionObject,
} from '@/lib/stripe-subscription-period'
import { planKeyFromStripePriceId } from '@/lib/stripe-plans'
import { updateUserPlan, supabaseServer, getUserById } from '@/lib/supabaseServer'
import { listStripeSubscriptionsForSupabaseUser } from '@/lib/stripe-reconcile-user-plan'
import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

export type ConsideredSubscription = {
  id: string
  status: string
  periodEnd: string
  customer: string | null
  planKey: string
  hadUserMetadata: boolean
}

export type RestoreResult = {
  ok: boolean
  changed: boolean
  message: string
  userId: string
  email: string | null
  /** Plan written (or current, when dry run / nothing found). */
  plan: string | null
  planExpiry: string | null
  subscriptionStatus: string | null
  matchedSubscriptionId: string | null
  consideredSubscriptions: ConsideredSubscription[]
}

function planKeyFromSubscription(sub: Stripe.Subscription): string {
  const priceId = sub.items.data[0]?.price?.id
  return planKeyFromStripePriceId(priceId) ?? 'unlimited_annual'
}

function subscriptionCustomerId(sub: Stripe.Subscription): string | null {
  const c = sub.customer
  if (typeof c === 'string') return c.startsWith('cus_') ? c : null
  if (c && typeof c === 'object' && 'id' in c) {
    const id = (c as Stripe.Customer).id
    return typeof id === 'string' && id.startsWith('cus_') ? id : null
  }
  return null
}

function isUsable(sub: Stripe.Subscription): boolean {
  return sub.status === 'active' || sub.status === 'trialing'
}

/** All Stripe customer ids that plausibly belong to this user: stored id + any matched by email. */
async function gatherCustomerIds(stripe: Stripe, user: UserRow): Promise<string[]> {
  const ids = new Set<string>()

  const stored = user.stripe_customer_id
  if (typeof stored === 'string' && stored.startsWith('cus_')) {
    ids.add(stored)
  }

  const emails = new Set<string>()
  if (user.email) {
    emails.add(user.email)
    emails.add(user.email.toLowerCase())
  }
  for (const email of emails) {
    try {
      const list = await stripe.customers.list({ email, limit: 100 })
      for (const c of list.data) {
        if (typeof c.id === 'string' && c.id.startsWith('cus_')) ids.add(c.id)
      }
    } catch (e) {
      console.warn('restore-access: customers.list by email failed', e)
    }
  }

  return [...ids]
}

/**
 * Pull every subscription that belongs to this user from Stripe, no matter how it was tagged.
 *
 * Combines three sources and de-dupes:
 *  - subscriptions tagged with supabase_user_id metadata (existing reconcile path)
 *  - every subscription on each customer matched by the user's stored id or email
 */
async function gatherSubscriptions(
  stripe: Stripe,
  user: UserRow
): Promise<Stripe.Subscription[]> {
  const byId = new Map<string, Stripe.Subscription>()

  try {
    const metaSubs = await listStripeSubscriptionsForSupabaseUser(stripe, user.id)
    for (const s of metaSubs) byId.set(s.id, s)
  } catch (e) {
    console.warn('restore-access: metadata subscription lookup failed', e)
  }

  const customerIds = await gatherCustomerIds(stripe, user)
  for (const customer of customerIds) {
    try {
      let startingAfter: string | undefined
      for (;;) {
        const list = await stripe.subscriptions.list({
          customer,
          status: 'all',
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        })
        for (const s of list.data) byId.set(s.id, s)
        if (!list.has_more) break
        startingAfter = list.data[list.data.length - 1]?.id
        if (!startingAfter) break
      }
    } catch (e) {
      console.warn(`restore-access: subscriptions.list for ${customer} failed`, e)
    }
  }

  return [...byId.values()]
}

function pickBest(subs: Stripe.Subscription[]): Stripe.Subscription | null {
  const usable = subs.filter(isUsable)
  if (usable.length === 0) return null
  return usable
    .map((s) => ({ s, end: new Date(getPeriodEndIsoFromSubscriptionObject(s)).getTime() }))
    .sort((a, b) => b.end - a.end)[0].s
}

/**
 * Re-reads the truth from Stripe and (unless dryRun) rewrites the user's plan so anyone with a
 * genuinely active/trialing subscription regains access. Non-destructive: never downgrades — if no
 * usable subscription is found, the existing row is left untouched and the result explains why.
 */
export async function restoreAccessForUser(
  stripe: Stripe,
  userId: string,
  options?: { dryRun?: boolean }
): Promise<RestoreResult> {
  const dryRun = options?.dryRun === true
  const user = await getUserById(userId)
  if (!user) {
    return {
      ok: false,
      changed: false,
      message: 'No account found for that user.',
      userId,
      email: null,
      plan: null,
      planExpiry: null,
      subscriptionStatus: null,
      matchedSubscriptionId: null,
      consideredSubscriptions: [],
    }
  }

  const subs = await gatherSubscriptions(stripe, user)
  const considered: ConsideredSubscription[] = subs.map((s) => ({
    id: s.id,
    status: s.status,
    periodEnd: getPeriodEndIsoFromSubscriptionObject(s),
    customer: subscriptionCustomerId(s),
    planKey: planKeyFromSubscription(s),
    hadUserMetadata: s.metadata?.supabase_user_id === userId,
  }))

  const best = pickBest(subs)

  if (!best) {
    const usableNote =
      subs.length === 0
        ? 'No Stripe subscriptions found for this customer (by stored id or email).'
        : 'Found subscriptions in Stripe, but none are active or trialing (e.g. canceled, past_due, or unpaid).'
    return {
      ok: true,
      changed: false,
      message: `${usableNote} Account left unchanged.`,
      userId,
      email: user.email,
      plan: user.current_plan,
      planExpiry: user.plan_expiry,
      subscriptionStatus: user.subscription_status,
      matchedSubscriptionId: null,
      consideredSubscriptions: considered,
    }
  }

  const periodEnd = await getSubscriptionPeriodEndIso(stripe, best)
  const planKey = planKeyFromSubscription(best)
  const customerId = subscriptionCustomerId(best)

  if (dryRun) {
    return {
      ok: true,
      changed: false,
      message: `Dry run: would set plan "${planKey}" active until ${periodEnd} (from subscription ${best.id}).`,
      userId,
      email: user.email,
      plan: planKey,
      planExpiry: periodEnd,
      subscriptionStatus: 'active',
      matchedSubscriptionId: best.id,
      consideredSubscriptions: considered,
    }
  }

  await updateUserPlan(userId, planKey, periodEnd, undefined, {
    cancelAtPeriodEnd: best.cancel_at_period_end === true,
  })

  if (customerId && customerId !== user.stripe_customer_id) {
    await supabaseServer
      .from('users')
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() } as never)
      .eq('id', userId)
  }

  return {
    ok: true,
    changed: true,
    message: `Access restored: plan "${planKey}" active until ${periodEnd}.`,
    userId,
    email: user.email,
    plan: planKey,
    planExpiry: periodEnd,
    subscriptionStatus: 'active',
    matchedSubscriptionId: best.id,
    consideredSubscriptions: considered,
  }
}

const ALLOWED_GRANT_PLANS = new Set([
  'basic_monthly',
  'basic_annual',
  'unlimited_monthly',
  'unlimited_annual',
])

/**
 * Manual override for the rare case where Stripe lookup can't confirm a subscription but you know
 * the user paid (e.g. Square legacy, off-Stripe refund credit). Grants `days` of `planKey`.
 */
export async function grantPlanManually(
  userId: string,
  planKey: string,
  days: number
): Promise<RestoreResult> {
  const user = await getUserById(userId)
  if (!user) {
    return {
      ok: false,
      changed: false,
      message: 'No account found for that user.',
      userId,
      email: null,
      plan: null,
      planExpiry: null,
      subscriptionStatus: null,
      matchedSubscriptionId: null,
      consideredSubscriptions: [],
    }
  }

  if (!ALLOWED_GRANT_PLANS.has(planKey)) {
    return {
      ok: false,
      changed: false,
      message: `Invalid plan "${planKey}". Allowed: ${[...ALLOWED_GRANT_PLANS].join(', ')}.`,
      userId,
      email: user.email,
      plan: user.current_plan,
      planExpiry: user.plan_expiry,
      subscriptionStatus: user.subscription_status,
      matchedSubscriptionId: null,
      consideredSubscriptions: [],
    }
  }

  const safeDays = Math.min(3650, Math.max(1, Math.floor(days)))
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + safeDays)
  const expiryIso = expiry.toISOString()

  await updateUserPlan(userId, planKey, expiryIso)

  return {
    ok: true,
    changed: true,
    message: `Manually granted "${planKey}" for ${safeDays} day(s), active until ${expiryIso}.`,
    userId,
    email: user.email,
    plan: planKey,
    planExpiry: expiryIso,
    subscriptionStatus: 'active',
    matchedSubscriptionId: null,
    consideredSubscriptions: [],
  }
}

/** Look up a user row by email (case-insensitive). */
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const trimmed = email.trim()
  if (!trimmed) return null
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
    .ilike('email', trimmed)
    .limit(1)
  if (error || !data || data.length === 0) return null
  return data[0] as UserRow
}
