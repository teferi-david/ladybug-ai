import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPlanDetails } from '@/lib/user-plans'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SQUARE WEBHOOK RECEIVED ===')
    
    const body = await request.text()
    const signature = request.headers.get('x-square-signature')
    
    // Verify webhook signature (in production, you should verify this)
    if (process.env.NODE_ENV === 'production' && signature) {
      // Add signature verification logic here
      console.log('Webhook signature verification would happen here')
    }
    
    const event = JSON.parse(body)
    console.log('Webhook event:', event)
    
    // Handle different Square webhook events
    switch (event.type) {
      case 'payment.updated':
        await handlePaymentSuccess(event.data)
        break
      case 'subscription.created':
        await handleSubscriptionCreated(event.data)
        break
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data)
        break
      default:
        console.log('Unhandled webhook event type:', event.type)
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentData: any) {
  try {
    console.log('Processing payment success:', paymentData)
    
    const { payment } = paymentData
    if (!payment) return
    
    // Extract customer email from payment
    const customerEmail = payment.buyer_email_address
    if (!customerEmail) {
      console.error('No customer email found in payment')
      return
    }
    
    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', customerEmail)
      .single()
    
    if (userError || !user) {
      console.error('User not found:', userError)
      return
    }
    
    // Determine plan type from payment amount
    const amount = payment.total_money?.amount || 0
    let planType = 'trial' // default
    
    if (amount === 149) planType = 'trial'
    else if (amount === 1549) planType = 'monthly'
    else if (amount === 14949) planType = 'annual'
    else if (amount === 399) planType = 'singleUse'
    
    const plan = getPlanDetails(planType)
    if (!plan) {
      console.error('Invalid plan type:', planType)
      return
    }
    
    // Calculate expiry date
    const now = new Date()
    const expiryDate = new Date(now.getTime() + (plan.periodDays * 24 * 60 * 60 * 1000))
    
    // Update user subscription
    const { error: updateError } = await supabase
      .from('users')
      .update({
        current_plan: planType,
        plan_expiry: expiryDate.toISOString(),
        words_used: 0,
        payment_id: payment.id,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (updateError) {
      console.error('Failed to update user subscription:', updateError)
      return
    }
    
    console.log('User subscription updated successfully:', {
      userId: user.id,
      planType,
      expiryDate: expiryDate.toISOString(),
      wordLimit: plan.wordLimit
    })
    
  } catch (error: any) {
    console.error('Error handling payment success:', error)
  }
}

async function handleSubscriptionCreated(subscriptionData: any) {
  console.log('Subscription created:', subscriptionData)
  // Handle subscription creation if needed
}

async function handleSubscriptionUpdated(subscriptionData: any) {
  console.log('Subscription updated:', subscriptionData)
  // Handle subscription updates if needed
}
