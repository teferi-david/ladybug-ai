import { NextRequest, NextResponse } from 'next/server'
import { paraphraseText } from '@/lib/openai'

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
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        error: 'Text is required',
        message: 'Please provide a text field in your request'
      }, { status: 400 })
    }

    console.log('Processing text:', text.substring(0, 100) + '...')
    
    // Call custom NLP to paraphrase the text
    const result = await paraphraseText(text)
    
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