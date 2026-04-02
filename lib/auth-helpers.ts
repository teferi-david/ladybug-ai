import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import {
  FREE_TIER_DAILY_HUMANIZER_LIMIT,
  SIGNUP_BONUS_HUMANIZER_RUNS,
} from '@/lib/premium-config'
import { isExpired } from './utils'

type User = Database['public']['Tables']['users']['Row']

/**
 * Supabase Auth user id from the JWT — does not require a `public.users` row.
 * Free-tier daily_usage is keyed by IP + tool + day (DB unique); auth id is used for increment FK / attribution.
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

/**
 * OAuth / Google users may exist in auth.users before a public.users row exists.
 * If daily_usage.user_id references public.users(id), inserts fail silently until this row exists.
 */
export type EnsurePublicUserResult = { ok: boolean; created: boolean }

/** Ensures public.users exists for FK (e.g. daily_usage). New rows get signup bonus humanizer runs. */
export async function ensurePublicUserRowForAuth(userId: string): Promise<EnsurePublicUserResult> {
  const { data: existing } = await supabaseAdmin.from('users').select('id').eq('id', userId).maybeSingle()
  if (existing) return { ok: true, created: false }

  const { data: authRes, error: authErr } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (authErr || !authRes.user) {
    console.error('ensurePublicUserRowForAuth: auth.admin.getUserById failed', authErr)
    return { ok: false, created: false }
  }
  const u = authRes.user
  const email = u.email ?? `${u.id}@users.placeholder`
  const name =
    (typeof u.user_metadata?.name === 'string' && u.user_metadata.name) ||
    (typeof u.user_metadata?.full_name === 'string' && u.user_metadata.full_name) ||
    null

  const { error: insertErr } = await supabaseAdmin.from('users').insert({
    id: u.id,
    email,
    name,
    current_plan: 'free',
    uses_left: 0,
    subscription_status: 'inactive',
    signup_bonus_humanizer_runs_remaining: SIGNUP_BONUS_HUMANIZER_RUNS,
  })

  if (insertErr && insertErr.code !== '23505') {
    console.error('ensurePublicUserRowForAuth: insert public.users failed', insertErr)
    return { ok: false, created: false }
  }
  if (insertErr?.code === '23505') {
    return { ok: true, created: false }
  }
  return { ok: true, created: true }
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

/**
 * DB enforces UNIQUE (ip_address, tool_name, last_reset) — one counter per IP+tool+calendar day.
 * Signed-in and anonymous traffic on the same IP share that single row.
 */
async function sumUsesForIpToolDay(
  ipAddress: string,
  toolName: 'humanizer' | 'paraphraser' | 'citation',
  today: string
): Promise<{ sum: number; ok: boolean }> {
  const { data: rows, error } = await supabaseAdmin
    .from('daily_usage')
    .select('uses_today')
    .eq('tool_name', toolName)
    .eq('last_reset', today)
    .eq('ip_address', ipAddress)

  if (error) {
    console.error('sumUsesForIpToolDay:', error)
    return { sum: 0, ok: false }
  }
  const sum = (rows ?? []).reduce((s, r) => s + (r.uses_today ?? 0), 0)
  return { sum, ok: true }
}

async function getSignupBonusHumanizerRunsRemaining(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('signup_bonus_humanizer_runs_remaining')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return 0
  return Math.max(0, data.signup_bonus_humanizer_runs_remaining ?? 0)
}

export type DailyUsageCheckResult = {
  allowed: boolean
  usesRemaining: number
  usedToday: number
  limit: number
}

export async function checkDailyUsage(
  userId: string | null,
  ipAddress: string,
  toolName: 'humanizer' | 'paraphraser' | 'citation'
): Promise<DailyUsageCheckResult> {
  const today = new Date().toISOString().split('T')[0]
  const { sum: currentUses, ok } = await sumUsesForIpToolDay(ipAddress, toolName, today)
  if (!ok) {
    return {
      allowed: false,
      usesRemaining: 0,
      usedToday: FREE_TIER_DAILY_HUMANIZER_LIMIT,
      limit: FREE_TIER_DAILY_HUMANIZER_LIMIT,
    }
  }
  let bonusRemaining = 0
  if (userId && toolName === 'humanizer') {
    bonusRemaining = await getSignupBonusHumanizerRunsRemaining(userId)
  }
  const underIpLimit = currentUses < FREE_TIER_DAILY_HUMANIZER_LIMIT
  const allowed = underIpLimit || bonusRemaining > 0
  const baseRemaining = Math.max(0, FREE_TIER_DAILY_HUMANIZER_LIMIT - currentUses)
  return {
    allowed,
    usesRemaining: baseRemaining + bonusRemaining,
    usedToday: currentUses,
    limit: FREE_TIER_DAILY_HUMANIZER_LIMIT,
  }
}

function isUniqueViolation(err: { code?: string } | null | undefined): boolean {
  return err?.code === '23505'
}

const INCREMENT_CONFLICT_RETRIES = 2

/** Returns true only when the DB write succeeded (callers must not grant free tier without this). */
export async function incrementDailyUsage(
  userId: string | null,
  ipAddress: string,
  toolName: 'humanizer' | 'paraphraser' | 'citation',
  conflictRetry = 0
): Promise<boolean> {
  if (userId) {
    const ensured = await ensurePublicUserRowForAuth(userId)
    if (!ensured.ok) return false
  }

  const today = new Date().toISOString().split('T')[0]
  const nowIso = new Date().toISOString()

  // Unique (ip_address, tool_name, last_reset): one row per IP+day+tool regardless of user_id
  const { data: existingList, error: fetchError } = await supabaseAdmin
    .from('daily_usage')
    .select('*')
    .eq('tool_name', toolName)
    .eq('last_reset', today)
    .eq('ip_address', ipAddress)
    .limit(1)

  if (fetchError) {
    console.error('incrementDailyUsage lookup error:', fetchError)
    return false
  }

  const existing = existingList?.[0]
  const currentUses = existing ? (existing.uses_today ?? 0) : 0

  if (currentUses < FREE_TIER_DAILY_HUMANIZER_LIMIT) {
    if (existing) {
      const nextUses = currentUses + 1
      const { error: updateError } = await supabaseAdmin
        .from('daily_usage')
        .update({
          uses_today: nextUses,
          updated_at: nowIso,
          ...(userId ? { user_id: userId } : {}),
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('incrementDailyUsage update error:', updateError)
        return false
      }
      return true
    }

    const insertPayload: Database['public']['Tables']['daily_usage']['Insert'] = {
      ip_address: ipAddress,
      tool_name: toolName,
      uses_today: 1,
      last_reset: today,
      created_at: nowIso,
      updated_at: nowIso,
    }
    if (userId) {
      insertPayload.user_id = userId
    }

    const { error: insertError } = await supabaseAdmin.from('daily_usage').insert(insertPayload)

    if (insertError) {
      if (isUniqueViolation(insertError) && conflictRetry < INCREMENT_CONFLICT_RETRIES) {
        return incrementDailyUsage(userId, ipAddress, toolName, conflictRetry + 1)
      }
      console.error('incrementDailyUsage insert error:', insertError)
      return false
    }
    return true
  }

  if (toolName !== 'humanizer' || !userId) {
    return false
  }

  const bonus = await getSignupBonusHumanizerRunsRemaining(userId)
  if (bonus <= 0) {
    return false
  }

  const { data: consumed, error: bonusErr } = await supabaseAdmin
    .from('users')
    .update({
      signup_bonus_humanizer_runs_remaining: bonus - 1,
      updated_at: nowIso,
    })
    .eq('id', userId)
    .eq('signup_bonus_humanizer_runs_remaining', bonus)
    .select('id')
    .maybeSingle()

  if (bonusErr || !consumed) {
    console.error('incrementDailyUsage signup bonus decrement:', bonusErr)
    return false
  }
  return true
}

export async function decrementSingleUseCredits(userId: string, newCreditsRemaining: number): Promise<void> {
  await supabaseAdmin
    .from('users')
    .update({ uses_left: Math.max(0, newCreditsRemaining) })
    .eq('id', userId)
}

