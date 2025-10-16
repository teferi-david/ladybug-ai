import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE CHECKOUT TEST ===')
    
    const { planType = 'trial' } = await request.json()
    console.log('Testing plan type:', planType)

    // Get price ID
    const priceId = process.env[`STRIPE_${planType.toUpperCase()}_PRICE_ID` as keyof typeof process.env]
    console.log('Price ID:', priceId)

    if (!priceId) {
      return NextResponse.json({
        error: 'Price ID not found',
        planType,
        availableEnvVars: {
          STRIPE_TRIAL_PRICE_ID: !!process.env.STRIPE_TRIAL_PRICE_ID,
          STRIPE_MONTHLY_PRICE_ID: !!process.env.STRIPE_MONTHLY_PRICE_ID,
          STRIPE_ANNUAL_PRICE_ID: !!process.env.STRIPE_ANNUAL_PRICE_ID,
          STRIPE_SINGLE_USE_PRICE_ID: !!process.env.STRIPE_SINGLE_USE_PRICE_ID,
        }
      }, { status: 500 })
    }

    // Test price retrieval
    let priceInfo = null
    try {
      const price = await stripe.prices.retrieve(priceId)
      priceInfo = {
        id: price.id,
        active: price.active,
        unit_amount: price.unit_amount,
        currency: price.currency,
        type: price.type
      }
      console.log('Price info:', priceInfo)
    } catch (error: any) {
      return NextResponse.json({
        error: 'Price validation failed',
        priceId,
        errorMessage: error.message,
        errorType: error.type,
        errorCode: error.code
      }, { status: 500 })
    }

    // Test session creation with minimal params
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: planType === 'singleUse' || planType === 'trial' ? 'payment' : 'subscription',
        success_url: `${appUrl}/dashboard?success=true`,
        cancel_url: `${appUrl}/pricing?canceled=true`,
        metadata: {
          test: 'true',
          plan_type: planType,
        },
      })

      console.log('Session created successfully:', session.id)

      return NextResponse.json({
        status: 'success',
        sessionId: session.id,
        url: session.url,
        priceInfo,
        planType,
        mode: session.mode
      })

    } catch (error: any) {
      console.error('Session creation error:', error)
      return NextResponse.json({
        error: 'Session creation failed',
        message: error.message,
        type: error.type,
        code: error.code,
        param: error.param,
        priceInfo
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
