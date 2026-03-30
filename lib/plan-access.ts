import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

/** Active paid plan (annual, trial, etc.) — unlocks all premium tools. */
export function hasProHumanizeAccess(user: UserRow | null | undefined): boolean {
  if (!user?.current_plan || !user.plan_expiry) return false
  const inactivePlans = ['none', 'free']
  if (inactivePlans.includes(user.current_plan)) return false
  return new Date(user.plan_expiry) > new Date()
}

export const hasPremiumPlan = hasProHumanizeAccess
