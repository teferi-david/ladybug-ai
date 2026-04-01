import type { Database } from '@/types/database.types'
import { isBasicPlanKey, isUnlimitedPlanKey } from '@/lib/stripe-plans'

type UserRow = Database['public']['Tables']['users']['Row']

/** Only known paid / credit plans — everything else (e.g. free, none, typos) is not Pro. */
function isPaidPlanKey(plan: string): boolean {
  const p = plan.trim().toLowerCase()
  return isBasicPlanKey(p) || isUnlimitedPlanKey(p) || p === 'single-use'
}

/** Stripe / app statuses that must not grant Pro (even if plan_expiry is still in the future). */
function subscriptionStatusDeniesPro(status: string | null | undefined): boolean {
  if (status == null || status === '') return false
  const s = status.toLowerCase()
  return (
    s === 'cancelled' ||
    s === 'canceled' ||
    s === 'unpaid' ||
    s === 'past_due' ||
    s === 'incomplete' ||
    s === 'incomplete_expired'
  )
}

/**
 * Active paid plan — unlocks premium tools.
 * Requires a known paid plan slug, future plan_expiry, and Stripe-style active subscription (not loose null).
 */
export function hasProHumanizeAccess(user: UserRow | null | undefined): boolean {
  if (!user?.current_plan || !user.plan_expiry) return false
  const plan = String(user.current_plan).trim().toLowerCase()
  if (!isPaidPlanKey(plan)) return false
  if (subscriptionStatusDeniesPro(user.subscription_status)) return false
  const st = user.subscription_status?.toLowerCase() ?? ''
  if (st === 'inactive') return false
  // Webhook/updateUserPlan sets "active" (including post-checkout); Stripe trialing may appear as trialing.
  if (st !== 'active' && st !== 'trialing') return false
  if (plan === 'single-use' && (user.uses_left ?? 0) <= 0) return false
  return new Date(user.plan_expiry) > new Date()
}

export const hasPremiumPlan = hasProHumanizeAccess
