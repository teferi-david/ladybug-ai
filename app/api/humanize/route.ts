import { NextRequest, NextResponse } from 'next/server'
import { humanizeText } from '@/lib/openai'
import {
  getAuthUserIdFromRequest,
  getUserRowById,
  ensurePublicUserRowForAuth,
} from '@/lib/auth-helpers'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { checkBasicWordQuota, incrementBasicWordsUsed } from '@/lib/basic-word-quota'
import { isBasicPlanKey } from '@/lib/stripe-plans'
import { HUMANIZE_LEVELS, normalizeHumanizeLevel, type HumanizeLevel } from '@/lib/humanize-levels'
import { HUMANIZE_PRIORITIES, type HumanizePriority } from '@/lib/humanizer-priority'
import { PREMIUM_MAX_WORDS_PER_REQUEST } from '@/lib/premium-config'
import { tryDeductCoins, refundCoins, insufficientCoinsMessage } from '@/lib/coins'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
/** Allow long OpenAI runs (reasoning models, large completions). Vercel caps by plan. */
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
  console.log('Humanize API called with POST method')

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

    if (!authUserId) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Unauthorized',
          message: 'Sign in to use the humanizer.',
        },
        { status: 401 }
      )
    }

    let user = await getUserRowById(authUserId)
    if (!user) {
      await ensurePublicUserRowForAuth(authUserId)
      user = await getUserRowById(authUserId)
    }
    if (!user) {
      return NextResponse.json(
        { status: 'error', error: 'Profile not found', message: 'Could not load your account.' },
        { status: 500 }
      )
    }

    let body: {
      text?: string
      level?: string
      priority?: string
      writingDnaSamples?: unknown
    }
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        {
          status: 'error',
          error: 'Invalid JSON in request body',
          message: 'Please ensure your request contains valid JSON',
        },
        { status: 400 }
      )
    }

    const { text, level: rawLevel, priority: rawPriority, writingDnaSamples: rawDna } = body

    let priority: HumanizePriority | undefined
    if (rawPriority !== undefined && rawPriority !== null && rawPriority !== '') {
      const p = String(rawPriority)
      if (HUMANIZE_PRIORITIES.some((x) => x.id === p)) {
        priority = p as HumanizePriority
      }
    }

    const DNA_MAX_CHARS_PER_SAMPLE = 20_000
    let writingDnaSamples: string[] | undefined
    if (Array.isArray(rawDna)) {
      const parts = rawDna
        .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
        .map((s) => s.trim().slice(0, DNA_MAX_CHARS_PER_SAMPLE))
      if (parts.length > 0) {
        writingDnaSamples = parts.slice(0, 8)
      }
    }
    let level: HumanizeLevel
    if (rawLevel === undefined || rawLevel === '') {
      level = 'basic'
    } else {
      const n = normalizeHumanizeLevel(String(rawLevel))
      if (!n) {
        return NextResponse.json(
          {
            status: 'error',
            error: 'Invalid level',
            message: `Level must be one of: ${HUMANIZE_LEVELS.join(', ')} (legacy: highschool, college, graduate)`,
          },
          { status: 400 }
        )
      }
      level = n
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Text is required',
          message: 'Please provide a text field in your request',
        },
        { status: 400 }
      )
    }

    const wordCount = text.trim().split(/\s+/).filter((word) => word.length > 0).length

    const paid = hasProHumanizeAccess(user)

    if (paid) {
      const quota = await checkBasicWordQuota(user.id, user, wordCount)
      if (quota.ok === false) {
        return NextResponse.json(
          {
            status: 'error',
            error: 'Yearly word limit reached',
            message: quota.message,
            upgradeRequired: true,
          },
          { status: 403 }
        )
      }
      if (wordCount > PREMIUM_MAX_WORDS_PER_REQUEST) {
        return NextResponse.json({
          status: 'error',
          error: 'Word limit exceeded',
          message: `Pro humanizer allows up to ${PREMIUM_MAX_WORDS_PER_REQUEST} words per run. This text has ${wordCount} words.`,
          upgradeRequired: false,
        }, { status: 403 })
      }
    } else {
      if (wordCount > PREMIUM_MAX_WORDS_PER_REQUEST) {
        return NextResponse.json({
          status: 'error',
          error: 'Word limit exceeded',
          message: `Each run is limited to ${PREMIUM_MAX_WORDS_PER_REQUEST} words. Shorten your text or split it into parts.`,
          upgradeRequired: false,
        }, { status: 403 })
      }
    }

    let coinsDeducted = 0
    let coinsAfter: number | undefined

    if (!paid) {
      const deduct = await tryDeductCoins(authUserId, wordCount)
      if (deduct.ok === false) {
        if (deduct.reason === 'insufficient') {
          return NextResponse.json(
            {
              status: 'error',
              error: 'Insufficient coins',
              message: insufficientCoinsMessage(deduct.balance, wordCount),
              upgradeRequired: true,
              coinsRemaining: deduct.balance,
            },
            { status: 403 }
          )
        }
        return NextResponse.json(
          {
            status: 'error',
            error: 'Billing unavailable',
            message: 'Could not update your coin balance. Please try again.',
          },
          { status: 503 }
        )
      }
      coinsDeducted = wordCount
      coinsAfter = deduct.balanceAfter
    }

    console.log('Processing text:', text.substring(0, 100) + '...', 'Level:', level)

    let result: string
    try {
      result = await humanizeText(text, level, { priority, writingDnaSamples })
      console.log('Humanization completed')
    } catch (openaiError: unknown) {
      if (coinsDeducted > 0) {
        await refundCoins(authUserId, coinsDeducted)
      }
      const msg = openaiError instanceof Error ? openaiError.message : 'Failed to process text with OpenAI'
      console.error('OpenAI error:', openaiError)
      return NextResponse.json(
        {
          status: 'error',
          error: 'OpenAI processing failed',
          message: msg,
          details: process.env.NODE_ENV === 'development' ? msg : undefined,
        },
        { status: 500 }
      )
    }

    if (paid) {
      if (isBasicPlanKey(user.current_plan)) {
        await incrementBasicWordsUsed(user.id, wordCount)
      }
      console.log(`Paid user ${user.id} used ${wordCount} words for humanization`)
    } else {
      console.log(`Coin humanize user ${user.id}, words ${wordCount}, coins left ~${coinsAfter}`)
    }

    return NextResponse.json({
      status: 'success',
      result,
      wordsUsed: wordCount,
      ...(paid
        ? {}
        : { coinsRemaining: coinsAfter }),
      timestamp: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'POST',
      },
    })
  } catch (error: unknown) {
    console.error('Unexpected error in humanize API:', error)
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('Error stack:', err?.stack)

    return NextResponse.json(
      {
        status: 'error',
        error: 'Internal server error',
        message: err.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
