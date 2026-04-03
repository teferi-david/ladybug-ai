import { NextRequest, NextResponse } from 'next/server'
import {
  getAuthUserIdFromRequest,
  getUserRowById,
  ensurePublicUserRowForAuth,
} from '@/lib/auth-helpers'
import { hasProHumanizeAccess } from '@/lib/plan-access'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/humanize/usage — Pro vs coin balance for UI.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const authUserId = await getAuthUserIdFromRequest(authHeader, request)
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let user = await getUserRowById(authUserId)
    if (!user) {
      await ensurePublicUserRowForAuth(authUserId)
      user = await getUserRowById(authUserId)
    }
    if (!user) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 500 })
    }

    const paid = hasProHumanizeAccess(user)

    if (paid) {
      return NextResponse.json({
        premium: true,
        coinsRemaining: null,
      })
    }

    return NextResponse.json({
      premium: false,
      coinsRemaining: user.coin_balance ?? 0,
    })
  } catch (e: unknown) {
    console.error('humanize usage GET:', e)
    const msg = e instanceof Error ? e.message : 'Failed to load usage'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
