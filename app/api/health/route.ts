import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Handle GET requests for health check
export async function GET() {
  console.log('Health check API called')
  
  try {
    return NextResponse.json({
      status: 'success',
      message: 'API is healthy and running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        customNLP: 'active',
        humanizer: 'ready',
        paraphraser: 'ready',
        citation: 'ready'
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Handle POST requests
export async function POST(request: NextRequest) {
  console.log('Health check POST called')
  
  try {
    const body = await request.json()
    console.log('Health check POST body:', body)
    
    return NextResponse.json({
      status: 'success',
      message: 'Health check POST received',
      receivedData: body,
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error: any) {
    console.error('Health check POST error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Health check POST failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Handle other methods
export async function PUT() {
  return NextResponse.json({
    status: 'error',
    error: 'Method Not Allowed',
    message: 'This endpoint accepts GET and POST requests',
    allowedMethods: ['GET', 'POST']
  }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({
    status: 'error',
    error: 'Method Not Allowed',
    message: 'This endpoint accepts GET and POST requests',
    allowedMethods: ['GET', 'POST']
  }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({
    status: 'error',
    error: 'Method Not Allowed',
    message: 'This endpoint accepts GET and POST requests',
    allowedMethods: ['GET', 'POST']
  }, { status: 405 })
}