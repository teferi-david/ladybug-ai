import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('Simple test API called')
  
  try {
    const body = await request.json()
    console.log('Received body:', body)
    
    return NextResponse.json({
      status: 'success',
      message: 'Simple test API is working',
      receivedData: body,
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Error in simple test API:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Failed to process request',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
