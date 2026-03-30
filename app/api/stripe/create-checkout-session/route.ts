import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { validateUserSession } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/stripe/create-checkout-session
 * Authorization: Bearer <supabase_access_token>
 * Body: optional { successUrl?, cancelUrl? }
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const user = await validateUserSession(token)
    if (!user?.id || !user.email) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      console.error('STRIPE_PRICE_ID is not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    let body: { successUrl?: string; cancelUrl?: string } = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const successUrl =
      body.successUrl ||
      `${appUrl}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = body.cancelUrl || `${appUrl}/pricing`

    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      customer_email: user.email,
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (e: any) {
    console.error('Stripe checkout error:', e)
    return NextResponse.json(
      { error: e.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}
