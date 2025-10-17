import { NextRequest, NextResponse } from 'next/server'
import { SQUARE_CONFIG } from '@/lib/square'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    console.log('=== SQUARE SIMPLE TEST ===')
    console.log('Access Token (first 10 chars):', SQUARE_CONFIG.accessToken?.substring(0, 10) + '...')
    console.log('Location ID:', SQUARE_CONFIG.locationId)
    console.log('Environment:', SQUARE_CONFIG.environment)
    
    // Test with a simple locations API call (sandbox)
    const response = await fetch(`https://connect.squareupsandbox.com/v2/locations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SQUARE_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18',
      },
    })
    
    console.log('Square API response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Square API test successful')
      return NextResponse.json({
        success: true,
        message: 'Square authentication working',
        locationsCount: data.locations?.length || 0,
        environment: SQUARE_CONFIG.environment,
        hasAccessToken: !!SQUARE_CONFIG.accessToken,
        hasLocationId: !!SQUARE_CONFIG.locationId
      })
    } else {
      const errorData = await response.json()
      console.error('Square API test failed:', errorData)
      return NextResponse.json({
        success: false,
        error: 'Square authentication failed',
        details: errorData,
        status: response.status,
        hasAccessToken: !!SQUARE_CONFIG.accessToken,
        hasLocationId: !!SQUARE_CONFIG.locationId
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Square simple test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Square test failed',
      details: error.message,
      hasAccessToken: !!SQUARE_CONFIG.accessToken,
      hasLocationId: !!SQUARE_CONFIG.locationId
    }, { status: 500 })
  }
}
