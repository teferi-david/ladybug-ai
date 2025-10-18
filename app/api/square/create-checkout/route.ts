import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutLink, PLAN_CONFIG, PlanKey } from '@/lib/squareClient'
import { validateUserSession, getUserById } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/square/create-checkout
 * Creates a Square checkout link for authenticated users
 * 
 * Body: {
 *   plan: 'trial' | 'monthly' | 'annual' | 'single-use',
 *   successUrl?: string,
 *   cancelUrl?: string,
 *   supabaseAccessToken: string
 * }
 * 
 * Returns: {
 *   checkoutUrl: string,
 *   checkoutId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== SQUARE CHECKOUT CREATION START ===')
    
    // Parse request body
    const body = await request.json()
    const { plan, successUrl, cancelUrl, supabaseAccessToken } = body

    // Validate required fields
    if (!plan || !supabaseAccessToken) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'Plan and supabaseAccessToken are required'
      }, { status: 400 })
    }

    // Validate plan type
    if (!PLAN_CONFIG[plan as PlanKey]) {
      return NextResponse.json({
        error: 'Invalid plan',
        message: `Plan must be one of: ${Object.keys(PLAN_CONFIG).join(', ')}`
      }, { status: 400 })
    }

    // Validate user session
    const user = await validateUserSession(supabaseAccessToken)
    if (!user) {
      return NextResponse.json({
        error: 'Authentication required',
        message: 'Invalid or expired authentication token'
      }, { status: 401 })
    }

    // Get user data from database
    const userData = await getUserById(user.id)
    if (!userData) {
      return NextResponse.json({
        error: 'User not found',
        message: 'User data not found in database'
      }, { status: 404 })
    }

    console.log(`Creating checkout for user ${user.email} (${user.id}) for plan: ${plan}`)
    console.log('Plan config:', PLAN_CONFIG[plan as PlanKey])
    console.log('User email:', user.email)
    console.log('Success URL:', successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/square/return`)

    // Validate required environment variables
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      console.error('Missing SQUARE_ACCESS_TOKEN')
      return NextResponse.json({
        error: 'Server configuration error',
        message: 'Square access token not configured'
      }, { status: 500 })
    }

    if (!process.env.SQUARE_LOCATION_ID) {
      console.error('Missing SQUARE_LOCATION_ID')
      return NextResponse.json({
        error: 'Server configuration error',
        message: 'Square location ID not configured'
      }, { status: 500 })
    }

    // Create Square checkout link
    const { checkoutUrl, checkoutId } = await createCheckoutLink({
      plan: plan as PlanKey,
      userId: user.id,
      userEmail: user.email!,
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/square/return`,
      cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    })

    console.log(`Checkout created successfully: ${checkoutId}`)
    console.log('Checkout URL:', checkoutUrl)
    console.log('=== SQUARE CHECKOUT CREATION END ===')

    return NextResponse.json({
      checkoutUrl,
      checkoutId,
      plan,
      userId: user.id,
    })

  } catch (error: any) {
    console.error('Square checkout creation error:', error)
    
    return NextResponse.json({
      error: 'Checkout creation failed',
      message: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests'
  }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests'
  }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests'
  }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests'
  }, { status: 405 })
}