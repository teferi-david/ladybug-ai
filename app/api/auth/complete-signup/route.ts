import { NextRequest, NextResponse } from 'next/server'
import {
  ensurePublicUserRowForAuth,
  getAuthUserIdFromRequest,
} from '@/lib/auth-helpers'
import {
  SIGNUP_BONUS_FREE_WORDS,
  SIGNUP_BONUS_HUMANIZER_RUNS,
} from '@/lib/premium-config'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Creates `public.users` on first visit after auth (email or OAuth) and grants signup bonus runs.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const authUserId = await getAuthUserIdFromRequest(authHeader, request)
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await ensurePublicUserRowForAuth(authUserId)
    if (!result.ok) {
      return NextResponse.json({ error: 'Could not create profile' }, { status: 500 })
    }

    return NextResponse.json({
      isNewProfile: result.created,
      signupBonusRuns: result.created ? SIGNUP_BONUS_HUMANIZER_RUNS : 0,
      signupBonusWords: result.created ? SIGNUP_BONUS_FREE_WORDS : 0,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error'
    console.error('complete-signup:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
