import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLAN_PRICES } from '@/lib/stripe'
import { getUserFromToken } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CHECKOUT SESSION CREATION START ===')
    console.log('Timestamp:', new Date().toISOString())
    
    const { planType } = await request.json()
    console.log('Plan type received:', planType)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))

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
    console.log('App URL:', appUrl)

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not defined')
      return NextResponse.json({ error: 'Stripe configuration error' }, { status: 500 })
    }

    const priceId = PLAN_PRICES[planType as keyof typeof PLAN_PRICES].priceId
    console.log('Price ID:', priceId)

    if (!priceId) {
      console.error('Price ID not found for plan type:', planType)
      return NextResponse.json({ error: 'Price configuration error' }, { status: 500 })
    }

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id

    if (!customerId) {
      console.log('Creating new Stripe customer...')
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.email,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id
      console.log('Customer created:', customerId)

      // Update user with customer ID
      // @ts-ignore
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    } else {
      console.log('Using existing customer:', customerId)
    }

    // Validate URLs
    const successUrl = `${appUrl}/dashboard?success=true`
    const cancelUrl = `${appUrl}/pricing?canceled=true`
    
    console.log('Success URL:', successUrl)
    console.log('Cancel URL:', cancelUrl)

    // Create checkout session with proper error handling
    const sessionParams: any = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: planType === 'singleUse' || planType === 'trial' ? 'payment' : 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      },
    }

    // Add trial period for subscription plans (not trial payment)
    if (planType === 'monthly' || planType === 'annual') {
      sessionParams.subscription_data = {
        trial_period_days: 3,
      }
    }

    console.log('Creating session with params:', JSON.stringify(sessionParams, null, 2))

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log('Session created successfully:', session.id)
    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
    })
    
    return NextResponse.json({ 
      error: 'Failed to create checkout session',
      details: error.message,
      type: error.type,
      code: error.code,
    }, { status: 500 })
  }
}

