import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  console.log('Test API GET called')
  return NextResponse.json({
    status: 'ok',
    method: 'GET',
    message: 'Test GET request successful!',
    timestamp: new Date().toISOString(),
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  }, { status: 200 })
}

export async function POST(request: NextRequest) {
  console.log('Test API POST called')
  try {
    const body = await request.json()
    return NextResponse.json({
      status: 'ok',
      method: 'POST',
      message: 'Test POST request successful!',
      receivedBody: body,
      timestamp: new Date().toISOString(),
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error parsing POST body:', error)
    return NextResponse.json({
      status: 'error',
      method: 'POST',
      message: 'Failed to parse request body.',
      error: error.message,
      timestamp: new Date().toISOString(),
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    }, { status: 400 })
  }
}