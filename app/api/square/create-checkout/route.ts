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

    // Create Square order using the correct API structure
    const orderRequest = {
      idempotency_key: `${user.id}-${planType}-${Date.now()}`,
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
        pricing_options: {
          auto_apply_discounts: false,
          auto_apply_taxes: false,
        },
      },
    }

    console.log('Creating Square order with request:', JSON.stringify(orderRequest, null, 2))
    
    // Create the order first
    const orderResponse = await fetch(`https://connect.squareup.com/v2/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SQUARE_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18',
      },
      body: JSON.stringify(orderRequest),
    })
    
    console.log('Order response status:', orderResponse.status)

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json()
      console.error('Square Order API error:', errorData)
      return NextResponse.json({
        error: 'Failed to create order',
        details: errorData,
      }, { status: 500 })
    }

    const orderData = await orderResponse.json()
    const orderId = orderData.order?.id

    if (!orderId) {
      console.error('No order ID returned:', orderData)
      return NextResponse.json({
        error: 'Failed to create order - no order ID returned',
        details: orderData,
      }, { status: 500 })
    }

    console.log('Order created successfully:', orderId)

    // Create Square checkout session using the correct API
    const checkoutRequest = {
      idempotency_key: `${user.id}-checkout-${Date.now()}`,
      checkout_page_data: {
        ask_for_shipping_address: false,
        merchant_support_email: 'support@ladybugai.us',
        pre_populate_buyer_email: user.email,
        redirect_url: `${appUrl}/dashboard?success=true`,
        note: `Ladybug AI - ${plan.name}`,
      },
      order_id: orderId,
    }

    console.log('Creating Square checkout with request:', JSON.stringify(checkoutRequest, null, 2))
    
    // Create checkout session
    const response = await fetch(`https://connect.squareup.com/v2/checkouts`, {
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
    console.log('Square checkout created successfully:', data)
    
    // Return the checkout URL
    const checkoutUrl = data.checkout?.checkout_page_url
    
    if (!checkoutUrl) {
      console.error('No checkout URL returned:', data)
      return NextResponse.json({
        error: 'Failed to create checkout session - no URL returned',
        details: data,
      }, { status: 500 })
    }
    
    return NextResponse.json({
      checkoutUrl: checkoutUrl,
      checkoutId: data.checkout?.id,
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