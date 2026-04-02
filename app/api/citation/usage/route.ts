import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserIdFromRequest, getUserRowById, checkDailyUsage } from '@/lib/auth-helpers'
import { hasProHumanizeAccess } from '@/lib/plan-access'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** GET /api/citation/usage — free-tier daily counter for citation tool (same rules as humanizer). */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const authUserId = await getAuthUserIdFromRequest(authHeader, request)

    if (!authUserId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Sign in to use the citation tool.' },
        { status: 401 }
      )
    }

    const user = await getUserRowById(authUserId)
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

    const { usesRemaining, usedToday, limit, allowed } = await checkDailyUsage(
      authUserId,
      ipAddress,
      'citation'
    )

    return NextResponse.json({
      premium: false,
      limit,
      usedToday,
      usesRemaining,
      atLimit: !allowed,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to load usage'
    console.error('citation usage GET:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
