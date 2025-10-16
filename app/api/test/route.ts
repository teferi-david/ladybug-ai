import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Test API endpoint is working',
    method: 'GET',
    timestamp: new Date().toISOString(),
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      status: 'ok',
      message: 'Test API endpoint is working',
      method: 'POST',
      timestamp: new Date().toISOString(),
      url: request.url,
      body: body,
      headers: Object.fromEntries(request.headers.entries())
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to parse JSON body',
      method: 'POST',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

// Handle any other HTTP methods
export async function PUT(request: NextRequest) {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts GET and POST requests',
    method: 'PUT',
    allowed: ['GET', 'POST'],
    endpoint: '/api/test'
  }, { status: 405 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts GET and POST requests',
    method: 'DELETE',
    allowed: ['GET', 'POST'],
    endpoint: '/api/test'
  }, { status: 405 })
}
