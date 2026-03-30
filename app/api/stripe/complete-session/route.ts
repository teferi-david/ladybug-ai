import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { validateUserSession, updateUserPlan, supabaseServer } from '@/lib/supabaseServer'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/stripe/complete-session
 * Authorization: Bearer <token>
 * Body: { sessionId: string }
 * Verifies Checkout Session and activates annual plan (Stripe subscription period end).
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const user = await validateUserSession(token)
    if (!user?.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { sessionId } = await request.json()
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    const refUserId = session.client_reference_id || session.metadata?.supabase_user_id
    if (refUserId !== user.id) {
      return NextResponse.json({ error: 'Session does not match account' }, { status: 403 })
    }

    if (session.status !== 'complete') {
      return NextResponse.json({ error: 'Checkout not complete' }, { status: 400 })
    }

    let subscription: Stripe.Subscription
    const sub = session.subscription
    if (typeof sub === 'string') {
      subscription = await stripe.subscriptions.retrieve(sub)
    } else if (sub && typeof sub === 'object' && 'current_period_end' in sub) {
      subscription = sub as Stripe.Subscription
    } else {
      return NextResponse.json({ error: 'No subscription on session' }, { status: 400 })
    }

    const periodEnd = new Date(subscription.current_period_end * 1000).toISOString()
    await updateUserPlan(user.id, 'annual', periodEnd)

    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer && typeof session.customer === 'object' && 'id' in session.customer
          ? (session.customer as Stripe.Customer).id
          : null

    if (customerId) {
      await supabaseServer
        .from('users')
        .update({
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
    }

    return NextResponse.json({ ok: true, plan: 'annual', plan_expiry: periodEnd })
  } catch (e: any) {
    console.error('complete-session error:', e)
    return NextResponse.json(
      { error: e.message || 'Failed to complete session' },
      { status: 500 }
    )
  }
}
