import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLAN_PRICES } from '@/lib/stripe'
import { getUserFromToken } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase/server'

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

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id

      // Update user with customer ID
      // @ts-ignore
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const priceId = PLAN_PRICES[planType as keyof typeof PLAN_PRICES].priceId

    // Create checkout session with special handling for trial-to-annual conversion
    let sessionConfig: any = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      },
    }

    // Handle trial plan - convert to annual subscription with 3-day trial
    if (planType === 'trial') {
      sessionConfig.mode = 'subscription'
      sessionConfig.subscription_data = {
        trial_period_days: 3,
        metadata: {
          user_id: user.id,
          plan_type: 'annual', // Convert trial to annual after trial ends
        },
      }
      // Use annual price for the subscription
      sessionConfig.line_items = [
        {
          price: PLAN_PRICES.annual.priceId,
          quantity: 1,
        },
      ]
    } else {
      sessionConfig.mode = planType === 'singleUse' ? 'payment' : 'subscription'
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}

