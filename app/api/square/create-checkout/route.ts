import { NextRequest, NextResponse } from 'next/server'
import { SQUARE_CONFIG, PLAN_PRICES, PlanType } from '@/lib/square'
import { getUserFromToken } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SQUARE CHECKOUT START ===')
    console.log('Timestamp:', new Date().toISOString())
    
    const { planType } = await request.json()
    console.log('Plan type:', planType)

    if (!planType || !['trial', 'monthly', 'annual', 'singleUse'].includes(planType)) {
      console.error('Invalid plan type:', planType)
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    const user = await getUserFromToken(authHeader)

    if (!user) {
      console.error('No user found in auth header')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log('User found:', user.email)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const plan = PLAN_PRICES[planType as PlanType]
    
    console.log('App URL:', appUrl)
    console.log('Plan details:', plan)
    console.log('Square config:', {
      hasAccessToken: !!SQUARE_CONFIG.accessToken,
      hasLocationId: !!SQUARE_CONFIG.locationId,
      environment: SQUARE_CONFIG.environment
    })

    // Create Square checkout session using the correct API structure
    const checkoutRequest = {
      idempotency_key: `${user.id}-checkout-${Date.now()}`,
      order: {
        location_id: SQUARE_CONFIG.locationId,
        line_items: [
          {
            name: plan.name,
            quantity: '1',
            base_price_money: {
              amount: plan.amount,
              currency: 'USD',
            },
          },
        ],
      },
      ask_for_shipping_address: false,
      merchant_support_email: 'support@ladybugai.us',
      pre_populate_buyer_email: user.email,
      redirect_url: `${appUrl}/dashboard?success=true`,
      note: `Ladybug AI - ${plan.name}`,
    }

    console.log('Creating Square checkout with request:', JSON.stringify(checkoutRequest, null, 2))
    
    // Create payment link using Square Payment Links API
    const response = await fetch(`https://connect.squareup.com/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SQUARE_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18',
      },
      body: JSON.stringify(checkoutRequest),
    })
    
    console.log('Checkout response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Square Checkout API error:', errorData)
      return NextResponse.json({
        error: 'Failed to create checkout session',
        details: errorData,
      }, { status: 500 })
    }

    const data = await response.json()
    console.log('Square payment link created successfully:', data)
    
    // Return the payment link URL
    const checkoutUrl = data.payment_link?.url || data.payment_link?.long_url
    
    if (!checkoutUrl) {
      console.error('No payment URL returned:', data)
      return NextResponse.json({
        error: 'Failed to create payment link - no URL returned',
        details: data,
      }, { status: 500 })
    }
    
    return NextResponse.json({
      checkoutUrl: checkoutUrl,
      checkoutId: data.payment_link?.id,
    })

  } catch (error: any) {
    console.error('Square checkout error:', error)
    return NextResponse.json({
      error: 'Failed to create checkout session',
      details: error.message,
    }, { status: 500 })
  } finally {
    console.log('=== SQUARE CHECKOUT END ===')
  }
}