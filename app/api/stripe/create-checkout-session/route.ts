import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { isValidCheckoutPriceId, STRIPE_PRICE_IDS } from '@/lib/stripe-plans'
import { validateUserSession, getUserById, supabaseServer } from '@/lib/supabaseServer'
import type Stripe from 'stripe'

function isStripeInvalidCustomerError(e: unknown): boolean {
  const err = e as Stripe.errors.StripeError | { code?: string; message?: string }
  if (err?.code === 'resource_missing') return true
  const msg = typeof err?.message === 'string' ? err.message : ''
  return /no such customer/i.test(msg)
}

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    let body: { successUrl?: string; cancelUrl?: string; priceId?: string } = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const priceId =
      body.priceId && isValidCheckoutPriceId(body.priceId)
        ? body.priceId
        : process.env.STRIPE_PRICE_ID && isValidCheckoutPriceId(process.env.STRIPE_PRICE_ID)
          ? process.env.STRIPE_PRICE_ID
          : STRIPE_PRICE_IDS.unlimitedAnnual

    if (!isValidCheckoutPriceId(priceId)) {
      console.error('Invalid or missing Stripe price id')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const successUrl =
      body.successUrl ||
      `${appUrl}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = body.cancelUrl || `${appUrl}/pricing`

    const stripe = getStripe()

    // 1-day trial: set STRIPE_TRIAL_PERIOD_DAYS=0 to disable trial on checkout
    const trialRaw = process.env.STRIPE_TRIAL_PERIOD_DAYS
    const trialDays =
      trialRaw === '0' || trialRaw === ''
        ? null
        : Math.min(365, Math.max(1, parseInt(trialRaw ?? '1', 10) || 1))

    /** One-time Price in Stripe (e.g. $4.99) charged at checkout when a trial applies */
    const trialStartPriceId = process.env.STRIPE_TRIAL_START_PRICE_ID?.trim()

    const lineItems: { price: string; quantity: number }[] = [{ price: priceId, quantity: 1 }]
    if (trialDays != null) {
      if (!trialStartPriceId?.startsWith('price_')) {
        console.error(
          'STRIPE_TRIAL_START_PRICE_ID must be set to a one-time Stripe Price when trial is enabled'
        )
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      }
      lineItems.push({ price: trialStartPriceId, quantity: 1 })
    }

    const profile = await getUserById(user.id)
    const storedCus = profile === null ? undefined : profile.stripe_customer_id
    const existingCustomerId =
      typeof storedCus === 'string' && storedCus.startsWith('cus_') ? storedCus : undefined

    const sessionBase: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
        ...(trialDays != null ? { trial_period_days: trialDays } : {}),
      },
      allow_promotion_codes: true,
    }

    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.create(
        existingCustomerId
          ? { ...sessionBase, customer: existingCustomerId }
          : { ...sessionBase, customer_email: user.email }
      )
    } catch (e) {
      if (existingCustomerId && isStripeInvalidCustomerError(e)) {
        await supabaseServer
          .from('users')
          .update({
            stripe_customer_id: null,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', user.id)
        session = await stripe.checkout.sessions.create({
          ...sessionBase,
          customer_email: user.email,
        })
      } else {
        throw e
      }
    }

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
