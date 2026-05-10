import type Stripe from 'stripe'
import { getSubscriptionPeriodEndIso, getPeriodEndIsoFromSubscriptionObject } from '@/lib/stripe-subscription-period'
import { planKeyFromStripePriceId } from '@/lib/stripe-plans'
import { updateUserPlan, supabaseServer, getUserById } from '@/lib/supabaseServer'

export type ReconcileStripeOptions = {
  /** Always merge these subscription ids (e.g. fresh checkout) so search index lag cannot briefly clear access. */
  includeSubscriptionIds?: string[]
}

function planKeyFromSubscription(sub: Stripe.Subscription): string {
  const priceId = sub.items.data[0]?.price?.id
  return planKeyFromStripePriceId(priceId) ?? 'unlimited_annual'
}

function escapeSearchMetadataValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

/**
 * All subscriptions that carry this Supabase user id in metadata (may span multiple Stripe customers).
 */
export async function listStripeSubscriptionsForSupabaseUser(
  stripe: Stripe,
  userId: string
): Promise<Stripe.Subscription[]> {
  const collected: Stripe.Subscription[] = []
  const query = `metadata['supabase_user_id']:'${escapeSearchMetadataValue(userId)}'`

  try {
    let page: string | undefined
    for (;;) {
      const res = await stripe.subscriptions.search({
        query,
        limit: 100,
        ...(page ? { page } : {}),
      })
      collected.push(...res.data)
      page = (res as { next_page?: string }).next_page
      if (!page) break
    }
  } catch (e) {
    console.warn('stripe-reconcile: subscriptions.search failed; using customer fallback if possible', e)
  }

  if (collected.length > 0) {
    return collected
  }

  const row = await getUserById(userId)
  if (!row) {
    return []
  }
  const cid = row.stripe_customer_id
  if (typeof cid !== 'string' || !cid.startsWith('cus_')) {
    return []
  }

  let startingAfter: string | undefined
  for (;;) {
    const list = await stripe.subscriptions.list({
      customer: cid,
      status: 'all',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    for (const s of list.data) {
      if (s.metadata?.supabase_user_id === userId) {
        collected.push(s)
      }
    }
    if (!list.has_more) break
    startingAfter = list.data[list.data.length - 1]?.id
    if (!startingAfter) break
  }

  return collected
}

async function mergeIncludedSubscriptions(
  stripe: Stripe,
  userId: string,
  subs: Stripe.Subscription[],
  includeIds: string[] | undefined
): Promise<Stripe.Subscription[]> {
  const byId = new Map(subs.map((s) => [s.id, s] as const))
  for (const id of includeIds ?? []) {
    if (!id || byId.has(id)) continue
    try {
      const s = await stripe.subscriptions.retrieve(id)
      if (s.metadata?.supabase_user_id === userId) {
        byId.set(s.id, s)
      }
    } catch {
      /* deleted or missing */
    }
  }
  return [...byId.values()]
}

function pickBestPayingSubscription(subs: Stripe.Subscription[]): Stripe.Subscription | null {
  const usable = subs.filter((s) => s.status === 'active' || s.status === 'trialing')
  if (usable.length === 0) return null

  const scored = usable.map((s) => ({
    s,
    end: new Date(getPeriodEndIsoFromSubscriptionObject(s)).getTime(),
  }))
  scored.sort((a, b) => b.end - a.end)
  return scored[0].s
}

function subscriptionCustomerId(subscription: Stripe.Subscription): string | null {
  const c = subscription.customer
  if (typeof c === 'string') return c.startsWith('cus_') ? c : null
  if (c && typeof c === 'object' && 'deleted' in c && (c as Stripe.DeletedCustomer).deleted) {
    return null
  }
  if (c && typeof c === 'object' && 'id' in c) {
    const id = (c as Stripe.Customer).id
    return id?.startsWith('cus_') ? id : null
  }
  return null
}

export async function resolveSupabaseUserIdForStripeSubscription(
  subscription: Stripe.Subscription
): Promise<string | null> {
  const meta = subscription.metadata?.supabase_user_id
  if (typeof meta === 'string' && meta.length > 0) return meta

  const cid = subscriptionCustomerId(subscription)
  if (!cid) return null

  const { data, error } = await supabaseServer
    .from('users')
    .select('id')
    .eq('stripe_customer_id', cid)
    .maybeSingle()

  if (error || data == null) return null
  const uid = (data as { id: string }).id
  return typeof uid === 'string' ? uid : null
}

/**
 * Sets users row from Stripe: best active/trialing subscription for this user, or free if none.
 * Call after subscription lifecycle events so deleting one sub does not wipe access when another remains.
 */
export async function reconcileStripeSubscriptionForUser(
  stripe: Stripe,
  userId: string,
  options?: ReconcileStripeOptions
): Promise<void> {
  const listed = await listStripeSubscriptionsForSupabaseUser(stripe, userId)
  const subs = await mergeIncludedSubscriptions(stripe, userId, listed, options?.includeSubscriptionIds)
  const best = pickBestPayingSubscription(subs)

  if (best) {
    const periodEnd = await getSubscriptionPeriodEndIso(stripe, best)
    const planKey = planKeyFromSubscription(best)
    await updateUserPlan(userId, planKey, periodEnd, undefined, {
      cancelAtPeriodEnd: best.cancel_at_period_end === true,
    })

    const cid = typeof best.customer === 'string' ? best.customer : best.customer?.id
    if (cid?.startsWith('cus_')) {
      await supabaseServer
        .from('users')
        .update({
          stripe_customer_id: cid,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', userId)
    }
    return
  }

  await supabaseServer
    .from('users')
    .update({
      subscription_status: 'cancelled',
      current_plan: 'free',
      plan_expiry: null,
      subscription_cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', userId)
}
