import { NextRequest, NextResponse } from 'next/server'
import { paraphraseText } from '@/lib/openai'
import {
  getAuthUserIdFromRequest,
  getUserRowById,
  checkDailyUsage,
  incrementDailyUsage,
} from '@/lib/auth-helpers'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { checkBasicWordQuota, incrementBasicWordsUsed } from '@/lib/basic-word-quota'
import { isBasicPlanKey } from '@/lib/stripe-plans'
import {
  FREE_TIER_DAILY_HUMANIZER_LIMIT,
  FREE_TIER_MAX_WORDS_PER_RUN,
  PREMIUM_MAX_WORDS_PER_REQUEST,
} from '@/lib/premium-config'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

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
  console.log('Paraphrase API called with POST method')

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
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        {
          error: 'Text is required',
          message: 'Please provide a text field in your request',
        },
        { status: 400 }
      )
    }

    const wordCount = text
      .trim()
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length

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

      if (wordCount > PREMIUM_MAX_WORDS_PER_REQUEST) {
        return NextResponse.json(
          {
            error: 'Word limit exceeded',
            message: `Paraphraser allows up to ${PREMIUM_MAX_WORDS_PER_REQUEST} words per run.`,
          },
          { status: 403 }
        )
      }

      console.log('Processing text:', text.substring(0, 100) + '...')

      const result = await paraphraseText(text)

      if (isBasicPlanKey(user!.current_plan)) {
        await incrementBasicWordsUsed(user!.id, wordCount)
      }

      console.log('Paraphrasing completed')

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
          message: 'Sign in or create an account to use the paraphraser on the free tier.',
        },
        { status: 401 }
      )
    }

    const { allowed, usesRemaining, limit, usedToday } = await checkDailyUsage(
      authUserId,
      ipAddress,
      'paraphraser'
    )
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Daily limit reached',
          message: `You've reached today's limit on the free paraphraser. Upgrade for unlimited use.`,
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
          message: `Free tier is limited to ${FREE_TIER_MAX_WORDS_PER_RUN} words per run. Upgrade for higher limits.`,
          upgradeRequired: true,
        },
        { status: 403 }
      )
    }

    const reserved = await incrementDailyUsage(authUserId, ipAddress, 'paraphraser')
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

    console.log('Processing text:', text.substring(0, 100) + '...')

    const result = await paraphraseText(text)

    const after = await checkDailyUsage(authUserId, ipAddress, 'paraphraser')

    console.log('Paraphrasing completed (free tier)')

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
    console.error('Error in paraphrase API:', error)
    const message = error instanceof Error ? error.message : 'Failed to paraphrase text'
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
