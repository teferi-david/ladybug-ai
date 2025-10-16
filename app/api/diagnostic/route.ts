import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Handle GET requests - return diagnostic info
export async function GET() {
  console.log('Diagnostic API GET called')
  
  return NextResponse.json({
    status: 'success',
    message: 'Diagnostic endpoint is working',
    method: 'GET',
    timestamp: new Date().toISOString(),
    endpoint: '/api/diagnostic',
    supportedMethods: ['GET', 'POST']
  }, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'GET, POST'
    }
  })
}

// Handle POST requests - return diagnostic info
export async function POST(request: NextRequest) {
  console.log('Diagnostic API POST called')
  
  try {
    const body = await request.json()
    console.log('Diagnostic POST body:', body)
    
    return NextResponse.json({
      status: 'success',
      message: 'Diagnostic POST endpoint is working',
      method: 'POST',
      receivedData: body,
      timestamp: new Date().toISOString(),
      endpoint: '/api/diagnostic',
      supportedMethods: ['GET', 'POST']
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'GET, POST'
      }
    })
  } catch (error: any) {
    console.error('Diagnostic POST error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Diagnostic POST failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Handle other methods
export async function PUT() {
  return new NextResponse(JSON.stringify({
    status: 'error',
    error: 'Method Not Allowed',
    message: 'This endpoint accepts GET and POST requests',
    allowedMethods: ['GET', 'POST']
  }), { 
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'GET, POST'
    }
  })
}

export async function DELETE() {
  return new NextResponse(JSON.stringify({
    status: 'error',
    error: 'Method Not Allowed',
    message: 'This endpoint accepts GET and POST requests',
    allowedMethods: ['GET', 'POST']
  }), { 
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'GET, POST'
    }
  })
}

export async function PATCH() {
  return new NextResponse(JSON.stringify({
    status: 'error',
    error: 'Method Not Allowed',
    message: 'This endpoint accepts GET and POST requests',
    allowedMethods: ['GET', 'POST']
  }), { 
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'GET, POST'
    }
  })
}
