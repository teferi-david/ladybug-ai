import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    console.log('Testing Stripe configuration...')
    
    // Check environment variables
    const envVars = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Set' : 'Missing',
      STRIPE_TRIAL_PRICE_ID: process.env.STRIPE_TRIAL_PRICE_ID ? 'Set' : 'Missing',
      STRIPE_MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID ? 'Set' : 'Missing',
      STRIPE_ANNUAL_PRICE_ID: process.env.STRIPE_ANNUAL_PRICE_ID ? 'Set' : 'Missing',
      STRIPE_SINGLE_USE_PRICE_ID: process.env.STRIPE_SINGLE_USE_PRICE_ID ? 'Set' : 'Missing',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
    }

    console.log('Environment variables:', envVars)

    // Test Stripe API connection
    let stripeTest = null
    try {
      const account = await stripe.accounts.retrieve()
      stripeTest = {
        status: 'Connected',
        accountId: account.id,
        country: account.country,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      }
    } catch (error: any) {
      stripeTest = {
        status: 'Error',
        error: error.message,
        type: error.type,
        code: error.code,
      }
    }

    // Test price retrieval
    let priceTests = {}
    const priceIds = [
      { name: 'Trial', id: process.env.STRIPE_TRIAL_PRICE_ID },
      { name: 'Monthly', id: process.env.STRIPE_MONTHLY_PRICE_ID },
      { name: 'Annual', id: process.env.STRIPE_ANNUAL_PRICE_ID },
      { name: 'Single Use', id: process.env.STRIPE_SINGLE_USE_PRICE_ID },
    ]

    for (const price of priceIds) {
      if (price.id) {
        try {
          const priceData = await stripe.prices.retrieve(price.id)
          priceTests[price.name] = {
            status: 'Valid',
            id: priceData.id,
            active: priceData.active,
            unit_amount: priceData.unit_amount,
            currency: priceData.currency,
            type: priceData.type,
          }
        } catch (error: any) {
          priceTests[price.name] = {
            status: 'Error',
            error: error.message,
            type: error.type,
            code: error.code,
          }
        }
      } else {
        priceTests[price.name] = {
          status: 'Missing',
          error: 'Price ID not set in environment',
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: envVars,
      stripeConnection: stripeTest,
      priceValidation: priceTests,
      instructions: {
        issue: 'You are using product IDs instead of price IDs',
        solution: 'Create prices for your products in Stripe dashboard',
        steps: [
          '1. Go to your Stripe dashboard',
          '2. Navigate to Products section',
          '3. For each product, create a price',
          '4. Copy the price IDs (not product IDs)',
          '5. Update your environment variables',
          '6. Redeploy your application'
        ],
        quickFix: 'Run the fix-stripe-prices.js script to create prices automatically'
      }
    })
  } catch (error: any) {
    console.error('Stripe config test error:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
