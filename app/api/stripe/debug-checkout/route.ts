import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getUserFromToken } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== STRIPE CHECKOUT DEBUG ===')
    
    // Step 1: Check request data
    const body = await request.json()
    console.log('Request body:', body)
    
    const { planType } = body
    console.log('Plan type:', planType)

    // Step 2: Validate plan type
    if (!planType || !['trial', 'monthly', 'annual', 'singleUse'].includes(planType)) {
      return NextResponse.json({
        error: 'Invalid plan type',
        received: planType,
        valid: ['trial', 'monthly', 'annual', 'singleUse']
      }, { status: 400 })
    }

    // Step 3: Check authentication
    const authHeader = request.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    const user = await getUserFromToken(authHeader)
    console.log('User found:', !!user)
    if (user) {
      console.log('User email:', user.email)
      console.log('User ID:', user.id)
    }

    if (!user) {
      return NextResponse.json({
        error: 'Authentication required',
        authHeaderPresent: !!authHeader
      }, { status: 401 })
    }

    // Step 4: Check environment variables
    const envCheck = {
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_TRIAL_PRICE_ID: !!process.env.STRIPE_TRIAL_PRICE_ID,
      STRIPE_MONTHLY_PRICE_ID: !!process.env.STRIPE_MONTHLY_PRICE_ID,
      STRIPE_ANNUAL_PRICE_ID: !!process.env.STRIPE_ANNUAL_PRICE_ID,
      STRIPE_SINGLE_USE_PRICE_ID: !!process.env.STRIPE_SINGLE_USE_PRICE_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
    }
    console.log('Environment check:', envCheck)

    // Step 5: Get price ID
    const priceId = process.env[`STRIPE_${planType.toUpperCase()}_PRICE_ID` as keyof typeof process.env]
    console.log('Price ID for', planType, ':', priceId)

    if (!priceId) {
      return NextResponse.json({
        error: 'Price ID not found',
        planType,
        envVar: `STRIPE_${planType.toUpperCase()}_PRICE_ID`
      }, { status: 500 })
    }

    // Step 6: Validate price ID with Stripe
    let priceValidation = null
    try {
      const price = await stripe.prices.retrieve(priceId)
      priceValidation = {
        status: 'Valid',
        id: price.id,
        active: price.active,
        unit_amount: price.unit_amount,
        currency: price.currency,
        type: price.type
      }
      console.log('Price validation successful:', priceValidation)
    } catch (error: any) {
      priceValidation = {
        status: 'Invalid',
        error: error.message,
        type: error.type,
        code: error.code
      }
      console.error('Price validation failed:', priceValidation)
    }

    // Step 7: Check customer
    let customerId = user.stripe_customer_id
    console.log('Existing customer ID:', customerId)

    let customerInfo = null
    if (customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId)
        customerInfo = {
          status: 'Found',
          id: customer.id,
          email: customer.email,
          created: customer.created
        }
        console.log('Customer found:', customerInfo)
      } catch (error: any) {
        customerInfo = {
          status: 'Error',
          error: error.message
        }
        console.error('Customer retrieval failed:', customerInfo)
      }
    }

    // Step 8: Test session creation (dry run)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${appUrl}/dashboard?success=true`
    const cancelUrl = `${appUrl}/pricing?canceled=true`

    console.log('URLs:', { appUrl, successUrl, cancelUrl })

    // Step 9: Try to create session
    let sessionResult = null
    try {
      const sessionParams = {
        customer: customerId || undefined,
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

      console.log('Session params:', JSON.stringify(sessionParams, null, 2))

      const session = await stripe.checkout.sessions.create(sessionParams)
      sessionResult = {
        status: 'Success',
        sessionId: session.id,
        url: session.url,
        mode: session.mode
      }
      console.log('Session created successfully:', sessionResult)

    } catch (error: any) {
      sessionResult = {
        status: 'Failed',
        error: error.message,
        type: error.type,
        code: error.code,
        param: error.param,
        decline_code: error.decline_code
      }
      console.error('Session creation failed:', sessionResult)
    }

    // Return comprehensive debug info
    return NextResponse.json({
      status: 'debug_complete',
      timestamp: new Date().toISOString(),
      request: {
        planType,
        authHeaderPresent: !!authHeader
      },
      user: {
        found: !!user,
        email: user?.email,
        id: user?.id,
        stripeCustomerId: user?.stripe_customer_id
      },
      environment: envCheck,
      priceValidation,
      customerInfo,
      sessionResult,
      urls: {
        appUrl,
        successUrl,
        cancelUrl
      }
    })

  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
