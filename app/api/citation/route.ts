import { NextRequest, NextResponse } from 'next/server'
import { generateCitation } from '@/lib/openai'
import {
  getAuthUserIdFromRequest,
  getUserRowById,
  checkDailyUsage,
  incrementDailyUsage,
} from '@/lib/auth-helpers'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { checkBasicWordQuota, countWordsFromRecord, incrementBasicWordsUsed } from '@/lib/basic-word-quota'
import { isBasicPlanKey } from '@/lib/stripe-plans'
import {
  FREE_TIER_DAILY_HUMANIZER_LIMIT,
  FREE_TIER_MAX_WORDS_PER_RUN,
} from '@/lib/premium-config'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Handle GET requests
export async function GET() {
  return new NextResponse(
    JSON.stringify({
      status: 'error',
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests',
      allowedMethods: ['POST'],
    }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'POST',
      },
    }
  )
}

// Handle PUT requests
export async function PUT() {
  return new NextResponse(
    JSON.stringify({
      status: 'error',
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests',
      allowedMethods: ['POST'],
    }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'POST',
      },
    }
  )
}

// Handle DELETE requests
export async function DELETE() {
  return new NextResponse(
    JSON.stringify({
      status: 'error',
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests',
      allowedMethods: ['POST'],
    }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'POST',
      },
    }
  )
}

// Handle PATCH requests
export async function PATCH() {
  return new NextResponse(
    JSON.stringify({
      status: 'error',
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests',
      allowedMethods: ['POST'],
    }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'POST',
      },
    }
  )
}

export async function POST(request: NextRequest) {
  console.log('Citation API called with POST method')

  if (request.method !== 'POST') {
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        error: 'Method Not Allowed',
        message: 'This endpoint only accepts POST requests',
        receivedMethod: request.method,
        allowedMethods: ['POST'],
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          Allow: 'POST',
        },
      }
    )
  }

  try {
    const authHeader = request.headers.get('authorization')
    const authUserId = await getAuthUserIdFromRequest(authHeader, request)
    const user = authUserId ? await getUserRowById(authUserId) : null
    const paid = Boolean(user && hasProHumanizeAccess(user))

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'

    const body = await request.json()
    const { type, author, title, year, publisher, url, accessDate } = body

    if (!type || (type !== 'apa' && type !== 'mla')) {
      return NextResponse.json(
        { error: 'Invalid type', message: 'type must be "apa" or "mla"' },
        { status: 400 }
      )
    }

    const wordCount = countWordsFromRecord(body as Record<string, unknown>)

    if (paid) {
      const quota = await checkBasicWordQuota(user!.id, user!, wordCount)
      if (!quota.ok) {
        return NextResponse.json(
          {
            error: 'Yearly word limit reached',
            message: quota.message,
            upgradeRequired: true,
          },
          { status: 403 }
        )
      }

      console.log('Processing citation:', type, title?.substring?.(0, 40))

      const result = await generateCitation({
        type,
        author,
        title,
        year,
        publisher,
        url,
        accessDate,
      })

      if (isBasicPlanKey(user!.current_plan)) {
        await incrementBasicWordsUsed(user!.id, wordCount)
      }

      console.log('Citation generation completed')

      return NextResponse.json({
        status: 'success',
        result,
        timestamp: new Date().toISOString(),
      })
    }

    if (!authUserId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Sign in or create an account to use the citation tool on the free tier.',
        },
        { status: 401 }
      )
    }

    const { allowed, usesRemaining, limit, usedToday } = await checkDailyUsage(
      authUserId,
      ipAddress,
      'citation'
    )
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Daily limit reached',
          message: `You've reached today's limit on the free citation tool. Upgrade for unlimited use.`,
          upgradeRequired: true,
          usesRemaining: 0,
          limit: FREE_TIER_DAILY_HUMANIZER_LIMIT,
          freeUsage: {
            usedToday,
            usesRemaining: 0,
            limit,
          },
        },
        { status: 403 }
      )
    }

    if (wordCount > FREE_TIER_MAX_WORDS_PER_RUN) {
      return NextResponse.json(
        {
          error: 'Word limit exceeded',
          message: `Free tier counts up to ${FREE_TIER_MAX_WORDS_PER_RUN} words in your citation fields per run. Shorten fields or upgrade.`,
          upgradeRequired: true,
        },
        { status: 403 }
      )
    }

    const reserved = await incrementDailyUsage(authUserId, ipAddress, 'citation')
    if (!reserved) {
      return NextResponse.json(
        {
          error: 'Usage tracking unavailable',
          message:
            'We could not record your free-tier use. Please try again in a moment. If this keeps happening, contact support.',
        },
        { status: 503 }
      )
    }

    console.log('Processing citation:', type, title?.substring?.(0, 40))

    const result = await generateCitation({
      type,
      author,
      title,
      year,
      publisher,
      url,
      accessDate,
    })

    const after = await checkDailyUsage(authUserId, ipAddress, 'citation')

    console.log('Citation generation completed (free tier)')

    return NextResponse.json({
      status: 'success',
      result,
      freeUsage: {
        usedToday: after.usedToday,
        usesRemaining: after.usesRemaining,
        limit: after.limit,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('Error in citation API:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate citation'
    return NextResponse.json(
      {
        status: 'error',
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
