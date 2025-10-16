import { NextRequest, NextResponse } from 'next/server'
import { nlpTestSuite } from '@/lib/nlp-test'

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
  console.log('NLP Test API called')
  
  try {
    const body = await request.json()
    const { testType } = body
    
    let result
    
    switch (testType) {
      case 'humanization':
        result = await nlpTestSuite.testHumanization()
        break
      case 'paraphrasing':
        result = await nlpTestSuite.testParaphrasing()
        break
      case 'citation':
        result = await nlpTestSuite.testCitationGeneration()
        break
      case 'all':
        result = await nlpTestSuite.runAllTests()
        break
      case 'realworld':
        result = await nlpTestSuite.testRealWorldExamples()
        break
      default:
        result = await nlpTestSuite.runAllTests()
    }
    
    return NextResponse.json({
      status: 'success',
      testType: testType || 'all',
      result: result,
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Error in NLP test API:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Failed to run NLP tests',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
