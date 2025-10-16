import { NextRequest, NextResponse } from 'next/server'
import { SQUARE_CONFIG } from '@/lib/square'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    console.log('=== SQUARE AUTH TEST ===')
    console.log('Access Token (first 10 chars):', SQUARE_CONFIG.accessToken?.substring(0, 10) + '...')
    console.log('Location ID:', SQUARE_CONFIG.locationId)
    console.log('Environment:', SQUARE_CONFIG.environment)
    
    // Test Square API with a simple request
    const response = await fetch(`https://connect.squareup.com/v2/locations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SQUARE_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18',
      },
    })
    
    console.log('Square API test response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Square API test successful:', data)
      return NextResponse.json({
        success: true,
        message: 'Square authentication successful',
        locations: data.locations?.length || 0,
        environment: SQUARE_CONFIG.environment
      })
    } else {
      const errorData = await response.json()
      console.error('Square API test failed:', errorData)
      return NextResponse.json({
        success: false,
        error: 'Square authentication failed',
        details: errorData,
        status: response.status
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Square auth test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Square auth test failed',
      details: error.message
    }, { status: 500 })
  }
}
