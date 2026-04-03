import { NextRequest, NextResponse } from 'next/server'
import { generateCitation } from '@/lib/openai'
import {
  getAuthUserIdFromRequest,
  getUserRowById,
  ensurePublicUserRowForAuth,
} from '@/lib/auth-helpers'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { checkBasicWordQuota, countWordsFromRecord, incrementBasicWordsUsed } from '@/lib/basic-word-quota'
import { isBasicPlanKey } from '@/lib/stripe-plans'
import { PREMIUM_MAX_WORDS_PER_REQUEST } from '@/lib/premium-config'
import { tryDeductCoins, refundCoins, insufficientCoinsMessage } from '@/lib/coins'

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

    if (!authUserId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Sign in or create an account to use the citation tool.',
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
      return NextResponse.json({ error: 'Profile not found' }, { status: 500 })
    }

    const paid = Boolean(hasProHumanizeAccess(user))

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
      const quota = await checkBasicWordQuota(user.id, user, wordCount)
      if (quota.ok === false) {
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
            message: `Citation fields allow up to ${PREMIUM_MAX_WORDS_PER_REQUEST} words per run.`,
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

      if (isBasicPlanKey(user.current_plan)) {
        await incrementBasicWordsUsed(user.id, wordCount)
      }

      console.log('Citation generation completed')

      return NextResponse.json({
        status: 'success',
        result,
        timestamp: new Date().toISOString(),
      })
    }

    if (wordCount > PREMIUM_MAX_WORDS_PER_REQUEST) {
      return NextResponse.json(
        {
          error: 'Word limit exceeded',
          message: `Citation fields allow up to ${PREMIUM_MAX_WORDS_PER_REQUEST} words per run.`,
          upgradeRequired: false,
        },
        { status: 403 }
      )
    }

    const deduct = await tryDeductCoins(authUserId, wordCount)
    if (deduct.ok === false) {
      if (deduct.reason === 'insufficient') {
        return NextResponse.json(
          {
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
          error: 'Billing unavailable',
          message: 'Could not update your coin balance. Please try again.',
        },
        { status: 503 }
      )
    }

    const coinsAfter = deduct.balanceAfter

    console.log('Processing citation:', type, title?.substring?.(0, 40))

    let result: string
    try {
      result = await generateCitation({
        type,
        author,
        title,
        year,
        publisher,
        url,
        accessDate,
      })
    } catch (e) {
      await refundCoins(authUserId, wordCount)
      throw e
    }

    console.log('Citation generation completed (coins)')

    return NextResponse.json({
      status: 'success',
      result,
      coinsRemaining: coinsAfter,
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
