import { NextRequest, NextResponse } from 'next/server'
import { getPaymentDetails } from '@/lib/squareClient'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/square/return
 * Handles return from Square checkout
 * 
 * Query params:
 * - reference_id: User and plan information
 * - payment_id: Square payment ID (optional)
 * 
 * Redirects to dashboard on success
 */
export async function GET(request: NextRequest) {
  try {
    console.log('=== SQUARE RETURN HANDLER START ===')
    
    const { searchParams } = new URL(request.url)
    const referenceId = searchParams.get('reference_id')
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')

    console.log('Return parameters:', { referenceId, paymentId, status })

    // If no reference ID, redirect to pricing with error
    if (!referenceId) {
      console.error('No reference_id in return URL')
      return NextResponse.redirect(
        new URL('/pricing?error=missing_reference', process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    // Parse reference ID: <user_id>::<plan>::<nonce>
    const [userId, plan, nonce] = referenceId.split('::')
    if (!userId || !plan || !nonce) {
      console.error('Invalid reference_id format:', referenceId)
      return NextResponse.redirect(
        new URL('/pricing?error=invalid_reference', process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    // Optional: Verify payment status with Square if payment_id provided
    if (paymentId) {
      try {
        const payment = await getPaymentDetails(paymentId)
        if (!payment) {
          console.error('Payment not found in Square:', paymentId)
          return NextResponse.redirect(
            new URL('/pricing?error=payment_not_found', process.env.NEXT_PUBLIC_APP_URL!)
          )
        }

        if (payment.status !== 'COMPLETED') {
          console.error('Payment not completed:', payment.status)
          return NextResponse.redirect(
            new URL('/pricing?error=payment_incomplete', process.env.NEXT_PUBLIC_APP_URL!)
          )
        }

        console.log('Payment verified with Square:', paymentId)
      } catch (error) {
        console.error('Error verifying payment with Square:', error)
        // Continue anyway - webhook should have processed the payment
      }
    }

    // Redirect to dashboard with success parameters
    const dashboardUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL!)
    dashboardUrl.searchParams.set('payment_success', 'true')
    dashboardUrl.searchParams.set('plan', plan)
    dashboardUrl.searchParams.set('user_id', userId)

    console.log('Redirecting to dashboard:', dashboardUrl.toString())
    console.log('=== SQUARE RETURN HANDLER END ===')

    return NextResponse.redirect(dashboardUrl)

  } catch (error: any) {
    console.error('Return handler error:', error)
    
    // Redirect to pricing with error
    return NextResponse.redirect(
      new URL('/pricing?error=processing_failed', process.env.NEXT_PUBLIC_APP_URL!)
    )
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function POST() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts GET requests'
  }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts GET requests'
  }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts GET requests'
  }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts GET requests'
  }, { status: 405 })
}
