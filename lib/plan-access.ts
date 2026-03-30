import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

/** Pro / paid access for premium humanize levels (college, graduate). */
export function hasProHumanizeAccess(user: UserRow | null | undefined): boolean {
  if (!user?.current_plan || !user.plan_expiry) return false
  const inactivePlans = ['none', 'free']
  if (inactivePlans.includes(user.current_plan)) return false
  return new Date(user.plan_expiry) > new Date()
}
