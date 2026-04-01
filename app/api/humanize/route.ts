import { NextRequest, NextResponse } from 'next/server'
import { humanizeText } from '@/lib/openai'
import {
  getAuthUserIdFromRequest,
  getUserRowById,
  checkDailyUsage,
  incrementDailyUsage,
} from '@/lib/auth-helpers'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import {
  checkBasicWordQuota,
  incrementBasicWordsUsed,
} from '@/lib/basic-word-quota'
import { isBasicPlanKey } from '@/lib/stripe-plans'
import { FREE_TIER_DAILY_HUMANIZER_LIMIT, PREMIUM_MAX_WORDS_PER_REQUEST } from '@/lib/premium-config'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
/** Allow long OpenAI runs (reasoning models, large completions). Vercel caps by plan. */
export const maxDuration = 300

// Handle GET requests
export async function GET() {
  return new NextResponse(JSON.stringify({
    status: 'error',
    error: 'Method Not Allowed',
    message: 'This endpoint only accepts POST requests',
    allowedMethods: ['POST']
  }), { 
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'POST'
    }
  })
}

// Handle PUT requests
export async function PUT() {
  return new NextResponse(JSON.stringify({
    status: 'error',
    error: 'Method Not Allowed',
    message: 'This endpoint only accepts POST requests',
    allowedMethods: ['POST']
  }), { 
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'POST'
    }
  })
}

// Handle DELETE requests
export async function DELETE() {
  return new NextResponse(JSON.stringify({
    status: 'error',
    error: 'Method Not Allowed',
    message: 'This endpoint only accepts POST requests',
    allowedMethods: ['POST']
  }), { 
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'POST'
    }
  })
}

// Handle PATCH requests
export async function PATCH() {
  return new NextResponse(JSON.stringify({
    status: 'error',
    error: 'Method Not Allowed',
    message: 'This endpoint only accepts POST requests',
    allowedMethods: ['POST']
  }), { 
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'POST'
    }
  })
}

export async function POST(request: NextRequest) {
  console.log('Humanize API called with POST method')
  
  // Verify the request method
  if (request.method !== 'POST') {
    return new NextResponse(JSON.stringify({
      status: 'error',
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests',
      receivedMethod: request.method,
      allowedMethods: ['POST']
    }), { 
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST'
      }
    })
  }
  
  try {
    const authHeader = request.headers.get('authorization')
    /** Bearer + request cookies (localStorage-only clients bypassed before createBrowserClient). */
    const authUserId = await getAuthUserIdFromRequest(authHeader, request)
    const user = authUserId ? await getUserRowById(authUserId) : null
    const freeTierUserId = authUserId

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'

    let body: { text?: string; level?: string }
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({
        status: 'error',
        error: 'Invalid JSON in request body',
        message: 'Please ensure your request contains valid JSON',
      }, { status: 400 })
    }

    const { text, level: rawLevel = 'highschool' } = body
    const level = rawLevel as 'highschool' | 'college' | 'graduate'

    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        status: 'error',
        error: 'Text is required',
        message: 'Please provide a text field in your request',
      }, { status: 400 })
    }

    if (!['highschool', 'college', 'graduate'].includes(level)) {
      return NextResponse.json({
        status: 'error',
        error: 'Invalid level',
        message: 'Level must be one of: highschool, college, graduate',
      }, { status: 400 })
    }

    const wordCount = text.trim().split(/\s+/).filter((word) => word.length > 0).length

    const proLevels = level === 'college' || level === 'graduate'
    const paid = user && hasProHumanizeAccess(user)

    if (proLevels && !paid) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Upgrade required',
          message:
            'College and Graduate humanization are Pro features. Start a 1-day free trial for unlimited access.',
          upgradeRequired: true,
        },
        { status: 403 }
      )
    }

    if (paid) {
      const quota = await checkBasicWordQuota(user!.id, user!, wordCount)
      if (!quota.ok) {
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
      const { allowed, usesRemaining, limit, usedToday } = await checkDailyUsage(
        freeTierUserId,
        ipAddress,
        'humanizer'
      )
      if (!allowed) {
        return NextResponse.json({
          status: 'error',
          error: 'Daily limit reached',
          message: `You’ve reached today’s limit on the free humanizer. Try a plan for free to keep going with unlimited access to all tools.`,
          upgradeRequired: true,
          usesRemaining: 0,
          limit: FREE_TIER_DAILY_HUMANIZER_LIMIT,
          freeUsage: {
            usedToday,
            usesRemaining: 0,
            limit,
          },
        }, { status: 403 })
      }
      if (wordCount > 200) {
        return NextResponse.json({
          status: 'error',
          error: 'Word limit exceeded',
          message: `Free tier is limited to 200 words. This text has ${wordCount} words. Start a 1-day free trial for higher per-run limits.`,
          upgradeRequired: true,
        }, { status: 403 })
      }
    }

    console.log('Processing text:', text.substring(0, 100) + '...', 'Level:', level)
    
    // Call OpenAI to humanize the text with error handling
    let result
    try {
      result = await humanizeText(text, level)
      console.log('Humanization completed')
    } catch (openaiError: any) {
      console.error('OpenAI error:', openaiError)
      return NextResponse.json({
        status: 'error',
        error: 'OpenAI processing failed',
        message: openaiError.message || 'Failed to process text with OpenAI',
        details: process.env.NODE_ENV === 'development' ? openaiError.message : undefined
      }, { status: 500 })
    }
    
    let freeUsagePayload: {
      usedToday: number
      usesRemaining: number
      limit: number
    } | undefined

    if (!paid) {
      await incrementDailyUsage(freeTierUserId, ipAddress, 'humanizer')
      const after = await checkDailyUsage(freeTierUserId, ipAddress, 'humanizer')
      freeUsagePayload = {
        usedToday: after.usedToday,
        usesRemaining: after.usesRemaining,
        limit: after.limit,
      }
      console.log(`Free tier humanize use (id: ${freeTierUserId ?? 'anon-ip'})`)
    } else {
      if (isBasicPlanKey(user!.current_plan)) {
        await incrementBasicWordsUsed(user!.id, wordCount)
      }
      console.log(`Paid user ${user!.id} used ${wordCount} words for humanization`)
    }

    return NextResponse.json({
      status: 'success',
      result: result,
      wordsUsed: wordCount,
      ...(freeUsagePayload ? { freeUsage: freeUsagePayload } : {}),
      timestamp: new Date().toISOString()
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST'
      }
    })
    
  } catch (error: any) {
    console.error('Unexpected error in humanize API:', error)
    console.error('Error stack:', error?.stack)
    
    // Always return a valid JSON response
    return NextResponse.json({
      status: 'error',
      error: 'Internal server error',
      message: error?.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}