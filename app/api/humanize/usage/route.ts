import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserIdFromRequest, getUserRowById, checkDailyUsage } from '@/lib/auth-helpers'
import { hasProHumanizeAccess } from '@/lib/plan-access'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/humanize/usage — free-tier daily counter for UI (signed in or anonymous by IP).
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const authUserId = await getAuthUserIdFromRequest(authHeader, request)
    const user = authUserId ? await getUserRowById(authUserId) : null
    const paid = user && hasProHumanizeAccess(user)

    if (paid) {
      return NextResponse.json({
        premium: true,
        limit: null,
        usedToday: null,
        usesRemaining: null,
      })
    }

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'

    const freeTierUserId = authUserId
    const { usesRemaining, usedToday, limit, allowed } = await checkDailyUsage(
      freeTierUserId,
      ipAddress,
      'humanizer'
    )

    return NextResponse.json({
      premium: false,
      limit,
      usedToday,
      usesRemaining,
      atLimit: !allowed,
    })
  } catch (e: any) {
    console.error('humanize usage GET:', e)
    return NextResponse.json(
      { error: e?.message || 'Failed to load usage' },
      { status: 500 }
    )
  }
}
