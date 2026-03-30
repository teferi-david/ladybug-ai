import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { getSubscriptionPeriodEndIso } from '@/lib/stripe-subscription-period'
import { validateUserSession, updateUserPlan, supabaseServer } from '@/lib/supabaseServer'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getCustomerId(session: Stripe.Checkout.Session): string | null {
  const c = session.customer
  if (typeof c === 'string') return c
  if (c && typeof c === 'object' && 'id' in c && !(c as Stripe.DeletedCustomer).deleted) {
    return (c as Stripe.Customer).id
  }
  return null
}

/**
 * Resolve Subscription after Checkout — Stripe sometimes omits expanded fields or returns only an id.
 */
async function resolveSubscription(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<Stripe.Subscription | null> {
  const sub = session.subscription

  if (typeof sub === 'string' && sub.length > 0) {
    return stripe.subscriptions.retrieve(sub)
  }

  if (sub && typeof sub === 'object' && 'id' in sub) {
    const id = (sub as Stripe.Subscription).id
    if (id) {
      return stripe.subscriptions.retrieve(id)
    }
  }

  const inv = session.invoice
  const invoiceId = typeof inv === 'string' ? inv : inv && typeof inv === 'object' && 'id' in inv ? inv.id : null
  if (invoiceId) {
    const invoice = await stripe.invoices.retrieve(invoiceId, { expand: ['subscription'] })
    const invSub = invoice.subscription
    if (typeof invSub === 'string' && invSub.length > 0) {
      return stripe.subscriptions.retrieve(invSub)
    }
    if (invSub && typeof invSub === 'object' && 'id' in invSub) {
      return stripe.subscriptions.retrieve((invSub as Stripe.Subscription).id)
    }
  }

  const customerId = getCustomerId(session)
  if (customerId) {
    const list = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    })
    const uid = session.metadata?.supabase_user_id
    const byMeta =
      uid && list.data.find((s) => s.metadata?.supabase_user_id === uid)
    const pick =
      byMeta ??
      list.data.find((s) => s.status === 'active' || s.status === 'trialing') ??
      list.data[0]
    if (pick) return pick
  }

  return null
}

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
      expand: ['subscription', 'invoice', 'customer'],
    })

    const refUserId = session.client_reference_id || session.metadata?.supabase_user_id
    if (refUserId !== user.id) {
      return NextResponse.json({ error: 'Session does not match account' }, { status: 403 })
    }

    if (session.status !== 'complete') {
      return NextResponse.json({ error: 'Checkout not complete' }, { status: 400 })
    }

    const subscription = await resolveSubscription(stripe, session)
    if (!subscription) {
      return NextResponse.json(
        {
          error:
            'Could not load subscription yet. Open Dashboard in a minute or contact support if this persists.',
        },
        { status: 503 }
      )
    }

    const periodEnd = await getSubscriptionPeriodEndIso(stripe, subscription)
    await updateUserPlan(user.id, 'annual', periodEnd, undefined, {
      cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
    })

    const customerId = getCustomerId(session)

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
