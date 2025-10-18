import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, getPaymentDetails } from '@/lib/squareClient'
import { 
  recordPaymentIfNew, 
  updateUserPlan, 
  calculatePlanExpiry, 
  calculateUsesLeft,
  getUserById 
} from '@/lib/supabaseServer'
import { PLAN_CONFIG, PlanKey } from '@/lib/squareClient'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/square/webhook
 * Handles Square webhook events for payment processing
 * 
 * Verifies webhook signature and processes payment events
 * Updates user plans and records payments for idempotency
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== SQUARE WEBHOOK START ===')
    
    // Get raw body for signature verification
    const body = await request.text()
    
    // Verify webhook signature for security
    if (!verifyWebhookSignature(request, body)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({
        error: 'Invalid signature'
      }, { status: 400 })
    }

    // Parse webhook payload
    const event = JSON.parse(body)
    console.log('Webhook event received:', event.type)

    // Handle payment events
    if (event.type === 'payment.updated' || event.type === 'payment.created') {
      const payment = event.data.object
      
      // Only process completed payments
      if (payment.status !== 'COMPLETED') {
        console.log(`Payment ${payment.id} status: ${payment.status} - skipping`)
        return NextResponse.json({ status: 'ignored' })
      }

      console.log(`Processing completed payment: ${payment.id}`)

      // Extract reference ID from payment metadata
      const referenceId = payment.metadata?.reference_id
      if (!referenceId) {
        console.error('No reference_id found in payment metadata')
        return NextResponse.json({
          error: 'Missing reference_id'
        }, { status: 400 })
      }

      // Parse reference ID: <user_id>::<plan>::<nonce>
      const [userId, plan, nonce] = referenceId.split('::')
      if (!userId || !plan || !nonce) {
        console.error('Invalid reference_id format:', referenceId)
        return NextResponse.json({
          error: 'Invalid reference_id format'
        }, { status: 400 })
      }

      // Validate plan
      if (!PLAN_CONFIG[plan as PlanKey]) {
        console.error('Invalid plan in reference_id:', plan)
        return NextResponse.json({
          error: 'Invalid plan'
        }, { status: 400 })
      }

      console.log(`Processing payment for user ${userId}, plan: ${plan}`)

      // Check idempotency - record payment if new
      const isNewPayment = await recordPaymentIfNew(payment.id, {
        userId,
        plan: plan as PlanKey,
        amount: payment.totalMoney?.amount || 0,
        currency: payment.totalMoney?.currency || 'USD',
        metadata: {
          reference_id: referenceId,
          nonce,
          square_payment_id: payment.id,
        }
      })

      // If payment already processed, return success
      if (!isNewPayment) {
        console.log(`Payment ${payment.id} already processed - skipping`)
        return NextResponse.json({ status: 'already_processed' })
      }

      // Get user data to verify they exist
      const userData = await getUserById(userId)
      if (!userData) {
        console.error(`User ${userId} not found in database`)
        return NextResponse.json({
          error: 'User not found'
        }, { status: 404 })
      }

      // Calculate plan expiry and uses
      const planExpiry = calculatePlanExpiry(plan as PlanKey)
      const usesLeft = calculateUsesLeft(plan as PlanKey)

      // Update user plan
      await updateUserPlan(userId, plan as PlanKey, planExpiry, usesLeft)

      console.log(`User ${userId} plan updated to ${plan} with expiry ${planExpiry}`)
      console.log('=== SQUARE WEBHOOK END ===')

      return NextResponse.json({ 
        status: 'success',
        userId,
        plan,
        planExpiry,
        usesLeft
      })

    } else if (event.type === 'refund.created' || event.type === 'refund.updated') {
      // Handle refund events if needed
      console.log(`Refund event received: ${event.type}`)
      return NextResponse.json({ status: 'refund_processed' })

    } else {
      // Ignore other event types
      console.log(`Ignoring event type: ${event.type}`)
      return NextResponse.json({ status: 'ignored' })
    }

  } catch (error: any) {
    console.error('Webhook processing error:', error)
    
    return NextResponse.json({
      error: 'Webhook processing failed',
      message: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests'
  }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests'
  }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests'
  }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests'
  }, { status: 405 })
}