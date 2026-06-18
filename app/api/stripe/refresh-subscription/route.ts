import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { getAuthUserIdFromRequest, ensurePublicUserRowForAuth } from '@/lib/auth-helpers'
import { restoreAccessForUser } from '@/lib/restore-access'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { getUserById } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/stripe/refresh-subscription
 * Authorization: Bearer <supabase access token> (or session cookie)
 *
 * Lets a signed-in user re-sync their OWN plan from Stripe. Fixes the common case where a renewal
 * or trial-conversion webhook was missed and the account looks unpaid despite an active subscription.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userId = await getAuthUserIdFromRequest(authHeader, request)
    if (!userId) {
      return NextResponse.json({ error: 'Sign in to refresh your subscription.' }, { status: 401 })
    }

    await ensurePublicUserRowForAuth(userId)

    const stripe = getStripe()
    const result = await restoreAccessForUser(stripe, userId)

    const row = await getUserById(userId)
    const hasAccess = row ? hasProHumanizeAccess(row) : false

    return NextResponse.json({
      ok: result.ok,
      changed: result.changed,
      hasAccess,
      plan: result.plan,
      planExpiry: result.planExpiry,
      message: hasAccess
        ? result.changed
          ? 'Your subscription is active again. You now have full access.'
          : 'Your subscription is active. You have full access.'
        : 'We could not find an active subscription on your account. If you were just charged, wait a moment and try again, or contact support.',
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to refresh subscription'
    console.error('refresh-subscription error:', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
