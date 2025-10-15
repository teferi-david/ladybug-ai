import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLAN_PRICES } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const planType = session.metadata?.plan_type

        if (!userId || !planType) break

        // Handle one-time payments (trial and single-use)
        if (planType === 'trial' || planType === 'singleUse') {
          const plan = PLAN_PRICES[planType as keyof typeof PLAN_PRICES]
          const expiryDate = new Date(Date.now() + plan.duration)

          await supabaseAdmin
            .from('users')
            .update({
              current_plan: planType === 'trial' ? 'trial' : 'single-use',
              plan_expiry: expiryDate.toISOString(),
              uses_left: planType === 'singleUse' ? plan.tokenLimit : 999999,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!user) break

        // Determine plan type from price ID
        let planType: 'monthly' | 'annual' = 'monthly'
        if (subscription.items.data[0].price.id === PLAN_PRICES.annual.priceId) {
          planType = 'annual'
        }

        // Update user subscription
        await supabaseAdmin
          .from('users')
          .update({
            current_plan: planType,
            plan_expiry: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', user.id)

        // Upsert subscription record
        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!user) break

        // Update user to no plan
        await supabaseAdmin
          .from('users')
          .update({
            current_plan: 'none',
            plan_expiry: null,
          })
          .eq('id', user.id)

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

