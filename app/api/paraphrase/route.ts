import { NextRequest, NextResponse } from 'next/server'
import { paraphraseText } from '@/lib/openai'
import { requirePremiumUser } from '@/lib/api-auth'
import { checkBasicWordQuota, incrementBasicWordsUsed } from '@/lib/basic-word-quota'
import { isBasicPlanKey } from '@/lib/stripe-plans'
import { PREMIUM_MAX_WORDS_PER_REQUEST } from '@/lib/premium-config'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
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
  console.log('Paraphrase API called with POST method')
  
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
    const auth = await requirePremiumUser(request.headers.get('authorization'))
    if ('response' in auth) return auth.response
    const { user } = auth

    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        error: 'Text is required',
        message: 'Please provide a text field in your request'
      }, { status: 400 })
    }

    const wordCount = text.trim().split(/\s+/).filter((w: string) => w.length > 0).length

    const quota = await checkBasicWordQuota(user.id, user, wordCount)
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

    if (isBasicPlanKey(user.current_plan)) {
      await incrementBasicWordsUsed(user.id, wordCount)
    }

    console.log('Paraphrasing completed')

    return NextResponse.json({
      status: 'success',
      result: result,
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Error in paraphrase API:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Failed to paraphrase text',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}