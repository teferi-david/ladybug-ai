import { supabaseAdmin } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { isExpired } from './utils'

type User = Database['public']['Tables']['users']['Row']

export async function getUserFromToken(authHeader: string | null): Promise<User | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return null
    }

    return userData
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}

export function checkSubscriptionAccess(user: User): {
  hasAccess: boolean
  reason?: string
} {
  // Check if user has an active plan
  if (user.current_plan === 'none') {
    return { hasAccess: false, reason: 'no_plan' }
  }

  // Check if plan is expired
  if (user.plan_expiry && isExpired(user.plan_expiry)) {
    return { hasAccess: false, reason: 'expired' }
  }

  // Check single-use credits
  if (user.current_plan === 'single-use' && user.uses_left <= 0) {
    return { hasAccess: false, reason: 'no_credits' }
  }

  return { hasAccess: true }
}

export async function checkDailyUsage(
  userId: string | null,
  ipAddress: string,
  toolName: 'humanizer' | 'paraphraser' | 'citation'
): Promise<{ allowed: boolean; usesRemaining: number }> {
  const today = new Date().toISOString().split('T')[0]

  // Try to find existing usage record
  let query = supabaseAdmin
    .from('daily_usage')
    .select('*')
    .eq('tool_name', toolName)
    .eq('last_reset', today)

  if (userId) {
    query = query.eq('user_id', userId)
  } else {
    query = query.eq('ip_address', ipAddress)
  }

  const { data: usage, error } = await query.single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows returned", which is fine
    console.error('Error checking daily usage:', error)
    return { allowed: false, usesRemaining: 0 }
  }

  const currentUses = usage?.uses_today || 0
  const allowed = currentUses < 2

  return {
    allowed,
    usesRemaining: Math.max(0, 2 - currentUses),
  }
}

export async function incrementDailyUsage(
  userId: string | null,
  ipAddress: string,
  toolName: 'humanizer' | 'paraphraser' | 'citation'
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  // First, try to get existing record
  let query = supabaseAdmin
    .from('daily_usage')
    .select('*')
    .eq('tool_name', toolName)
    .eq('last_reset', today)

  if (userId) {
    query = query.eq('user_id', userId)
  } else {
    query = query.eq('ip_address', ipAddress)
  }

  const { data: existing } = await query.single()

  if (existing) {
    // Update existing record
    let updateQuery = supabaseAdmin
      .from('daily_usage')
      .update({ uses_today: existing.uses_today + 1 })
      .eq('id', existing.id)

    await updateQuery
  } else {
    // Insert new record
    await supabaseAdmin
      .from('daily_usage')
      .insert({
        user_id: userId,
        ip_address: ipAddress,
        tool_name: toolName,
        uses_today: 1,
        last_reset: today,
      })
  }
}

export async function decrementSingleUseCredits(userId: string, newCreditsRemaining: number): Promise<void> {
  await supabaseAdmin
    .from('users')
    .update({ uses_left: Math.max(0, newCreditsRemaining) })
    .eq('id', userId)
}

