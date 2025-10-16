import { NextRequest, NextResponse } from 'next/server'
import { square, PLAN_PRICES, PlanType } from '@/lib/square'
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

    // Create Square checkout session
    const checkoutRequest = {
      idempotencyKey: `${user.id}-${planType}-${Date.now()}`,
      checkoutPageData: {
        askForShippingAddress: false,
        merchantSupportEmail: 'support@ladybugai.us',
        prePopulateBuyerEmail: user.email,
        prePopulateBuyerPhoneNumber: '',
        redirectUrl: `${appUrl}/dashboard?success=true`,
        note: `Ladybug AI - ${plan.name}`,
      },
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems: [
          {
            name: plan.name,
            quantity: '1',
            basePriceMoney: {
              amount: plan.amount,
              currency: 'USD',
            },
          },
        ],
        pricingOptions: {
          autoApplyDiscounts: false,
          autoApplyTaxes: false,
        },
      },
    }

    const { result } = await square.checkoutApi.createCheckout(
      process.env.SQUARE_LOCATION_ID!,
      checkoutRequest
    )

    return NextResponse.json({
      checkoutUrl: result.checkout?.checkoutPageUrl,
      checkoutId: result.checkout?.id,
    })

  } catch (error: any) {
    console.error('Square checkout error:', error)
    return NextResponse.json({
      error: 'Failed to create checkout session',
      details: error.message,
    }, { status: 500 })
  }
}
