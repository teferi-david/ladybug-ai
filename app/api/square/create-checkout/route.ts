import { NextRequest, NextResponse } from 'next/server'
import { SQUARE_CONFIG, PLAN_PRICES, PlanType } from '@/lib/square'
import { getUserFromToken } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json()

    if (!planType || !['trial', 'monthly', 'annual', 'singleUse'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    const user = await getUserFromToken(authHeader)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const plan = PLAN_PRICES[planType as PlanType]

    // Create Square checkout session using direct API call
    const checkoutRequest = {
      idempotency_key: `${user.id}-${planType}-${Date.now()}`,
      checkout_page_data: {
        ask_for_shipping_address: false,
        merchant_support_email: 'support@ladybugai.us',
        pre_populate_buyer_email: user.email,
        pre_populate_buyer_phone_number: '',
        redirect_url: `${appUrl}/dashboard?success=true`,
        note: `Ladybug AI - ${plan.name}`,
      },
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

    // Make direct API call to Square
    const response = await fetch(`https://connect.squareup.com/v2/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SQUARE_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18',
      },
      body: JSON.stringify(checkoutRequest),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Square API error:', errorData)
      return NextResponse.json({
        error: 'Failed to create checkout session',
        details: errorData,
      }, { status: 500 })
    }

    const data = await response.json()
    
    return NextResponse.json({
      checkoutUrl: data.checkout?.checkout_page_url,
      checkoutId: data.checkout?.id,
    })

  } catch (error: any) {
    console.error('Square checkout error:', error)
    return NextResponse.json({
      error: 'Failed to create checkout session',
      details: error.message,
    }, { status: 500 })
  }
}