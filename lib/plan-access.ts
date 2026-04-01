import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

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

/** Active paid plan (annual, trial, etc.) — unlocks all premium tools. */
export function hasProHumanizeAccess(user: UserRow | null | undefined): boolean {
  if (!user?.current_plan || !user.plan_expiry) return false
  const inactivePlans = ['none', 'free']
  if (inactivePlans.includes(user.current_plan)) return false
  // Paid rows should be active/trialing; 'inactive' on a non-free plan means no Pro (avoids stale plan_expiry).
  if (user.subscription_status?.toLowerCase() === 'inactive') return false
  if (subscriptionStatusDeniesPro(user.subscription_status)) return false
  return new Date(user.plan_expiry) > new Date()
}

export const hasPremiumPlan = hasProHumanizeAccess
