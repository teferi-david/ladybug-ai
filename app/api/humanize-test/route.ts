import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  console.log('Humanize Test API GET called')
  return NextResponse.json({
    status: 'ok',
    method: 'GET',
    message: 'Humanize test endpoint working - GET request successful!',
    timestamp: new Date().toISOString(),
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  }, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

export async function POST(request: NextRequest) {
  console.log('Humanize Test API POST called')
  console.log('Request URL:', request.url)
  console.log('Request method:', request.method)
  console.log('Request headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    return NextResponse.json({
      status: 'ok',
      method: 'POST',
      message: 'Humanize test endpoint working - POST request successful!',
      receivedBody: body,
      timestamp: new Date().toISOString(),
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
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
    }, { 
      status: 400,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
