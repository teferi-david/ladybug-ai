import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import {
  reconcileStripeSubscriptionForUser,
  resolveSupabaseUserIdForStripeSubscription,
} from '@/lib/stripe-reconcile-user-plan'
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

        await reconcileStripeSubscriptionForUser(stripe, userId, {
          includeSubscriptionIds: subId ? [subId] : undefined,
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = await resolveSupabaseUserIdForStripeSubscription(subscription)
        if (!userId) break

        await reconcileStripeSubscriptionForUser(stripe, userId, {
          includeSubscriptionIds: [subscription.id],
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = await resolveSupabaseUserIdForStripeSubscription(subscription)
        if (!userId) break

        await reconcileStripeSubscriptionForUser(stripe, userId)
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
