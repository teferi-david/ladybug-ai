import { NextRequest, NextResponse } from 'next/server'
import { generateCitation } from '@/lib/openai'
import { requirePremiumUser } from '@/lib/api-auth'
import { checkBasicWordQuota, countWordsFromRecord, incrementBasicWordsUsed } from '@/lib/basic-word-quota'
import { isBasicPlanKey } from '@/lib/stripe-plans'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
  console.log('Citation API called with POST method')
  
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
    const { type, author, title, year, publisher, url, accessDate } = body

    if (!type || (type !== 'apa' && type !== 'mla')) {
      return NextResponse.json(
        { error: 'Invalid type', message: 'type must be "apa" or "mla"' },
        { status: 400 }
      )
    }

    const wordCount = countWordsFromRecord(body as Record<string, unknown>)
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
      result: result,
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Error in citation API:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Failed to generate citation',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}