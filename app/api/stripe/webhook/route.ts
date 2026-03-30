import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { getPeriodEndIsoFromSubscriptionObject } from '@/lib/stripe-subscription-period'
import { updateUserPlan, supabaseServer } from '@/lib/supabaseServer'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err: any) {
    console.error('Stripe webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const stripe = getStripe()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId = session.client_reference_id || session.metadata?.supabase_user_id
        if (!userId || typeof userId !== 'string') {
          console.error('checkout.session.completed: missing user id')
          break
        }

        const subRef = session.subscription
        const subId = typeof subRef === 'string' ? subRef : subRef?.id
        if (!subId) break

        const subscription = await stripe.subscriptions.retrieve(subId)
        const periodEnd = getPeriodEndIsoFromSubscriptionObject(subscription)
        await updateUserPlan(userId, 'annual', periodEnd)

        const c = session.customer
        let customerId: string | null = null
        if (typeof c === 'string') {
          customerId = c
        } else if (c && typeof c === 'object' && 'deleted' in c && (c as Stripe.DeletedCustomer).deleted) {
          customerId = null
        } else if (c && typeof c === 'object' && 'id' in c) {
          customerId = (c as Stripe.Customer).id
        }

        if (customerId) {
          await supabaseServer
            .from('users')
            .update({
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) break

        if (subscription.status === 'active' || subscription.status === 'trialing') {
          const periodEnd = getPeriodEndIsoFromSubscriptionObject(subscription)
          await updateUserPlan(userId, 'annual', periodEnd)
        } else if (
          subscription.status === 'canceled' ||
          subscription.status === 'unpaid' ||
          subscription.status === 'incomplete_expired'
        ) {
          await supabaseServer
            .from('users')
            .update({
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) break

        await supabaseServer
          .from('users')
          .update({
            subscription_status: 'cancelled',
            current_plan: 'free',
            plan_expiry: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
        break
      }

      default:
        break
    }
  } catch (e) {
    console.error('Stripe webhook handler error:', e)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
