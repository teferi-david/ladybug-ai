import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { FREE_TIER_DAILY_HUMANIZER_LIMIT } from '@/lib/premium-config'
import { isExpired } from './utils'

type User = Database['public']['Tables']['users']['Row']

/**
 * Supabase Auth user id from the JWT — does not require a `public.users` row.
 * Use for free-tier daily limits so signed-in users are always capped per account, not only by IP.
 */
export async function getAuthUserIdFromToken(authHeader: string | null): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return null
    }

    return user.id
  } catch {
    return null
  }
}

/** Auth user id from Supabase cookies (browser session) — use when Authorization header is missing. */
export async function getAuthUserIdFromCookies(): Promise<string | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server-route')
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) return null
    return user.id
  } catch {
    return null
  }
}

/**
 * Read session from the incoming API request cookies (most reliable in Route Handlers).
 */
export async function getAuthUserIdFromNextRequest(request: NextRequest): Promise<string | null> {
  try {
    const { createServerClient } = await import('@supabase/ssr')
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            /* Read-only here; session refresh runs in middleware + browser client */
          },
        },
      }
    )
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) return null
    return user.id
  } catch {
    return null
  }
}

/**
 * Prefer Bearer JWT, then cookies on this request, then next/headers cookies.
 */
export async function getAuthUserIdFromRequest(
  authHeader: string | null,
  request?: NextRequest
): Promise<string | null> {
  const fromBearer = await getAuthUserIdFromToken(authHeader)
  if (fromBearer) return fromBearer
  if (request) {
    const fromReq = await getAuthUserIdFromNextRequest(request)
    if (fromReq) return fromReq
  }
  return getAuthUserIdFromCookies()
}

/** Profile row by auth id (for plan checks). */
export async function getUserRowById(userId: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', userId).maybeSingle()
  if (error || !data) return null
  return data
}

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

  const { data: usage, error } = await query.maybeSingle()

  if (error) {
    console.error('Error checking daily usage:', error)
    return {
      allowed: false,
      usesRemaining: 0,
      usedToday: 0,
      limit: FREE_TIER_DAILY_HUMANIZER_LIMIT,
    }
  }

  const currentUses = usage?.uses_today || 0
  const allowed = currentUses < FREE_TIER_DAILY_HUMANIZER_LIMIT

  return {
    allowed,
    usesRemaining: Math.max(0, FREE_TIER_DAILY_HUMANIZER_LIMIT - currentUses),
    usedToday: currentUses,
    limit: FREE_TIER_DAILY_HUMANIZER_LIMIT,
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

  const { data: existing, error: fetchError } = await query.maybeSingle()

  if (fetchError) {
    console.error('incrementDailyUsage lookup error:', fetchError)
    return
  }

  if (existing) {
    const { error: updateError } = await supabaseAdmin
      .from('daily_usage')
      .update({ uses_today: existing.uses_today + 1 })
      .eq('id', existing.id)

    if (updateError) {
      console.error('incrementDailyUsage update error:', updateError)
    }
  } else {
    const { error: insertError } = await supabaseAdmin.from('daily_usage').insert({
      user_id: userId,
      ip_address: ipAddress,
      tool_name: toolName,
      uses_today: 1,
      last_reset: today,
    })

    if (insertError) {
      console.error('incrementDailyUsage insert error:', insertError)
    }
  }
}

export async function decrementSingleUseCredits(userId: string, newCreditsRemaining: number): Promise<void> {
  await supabaseAdmin
    .from('users')
    .update({ uses_left: Math.max(0, newCreditsRemaining) })
    .eq('id', userId)
}

