import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getPlanDetails } from '@/lib/user-plans'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SQUARE PAYMENT SUCCESS ===')
    
    const { userId, planType, paymentId } = await request.json()
    console.log('Payment success data:', { userId, planType, paymentId })

    if (!userId || !planType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const plan = getPlanDetails(planType)
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // Calculate expiry date
    const now = new Date()
    const expiryDate = new Date(now.getTime() + (plan.periodDays * 24 * 60 * 60 * 1000))

    // Update user plan in database
    const { error } = await supabase
      .from('users')
      .update({
        current_plan: planType,
        plan_expiry: expiryDate.toISOString(),
        words_used: 0, // Reset word count for new plan
        payment_id: paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json({ error: 'Failed to update user plan' }, { status: 500 })
    }

    console.log('User plan updated successfully:', {
      userId,
      planType,
      wordLimit: plan.wordLimit,
      expiryDate: expiryDate.toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'User plan updated successfully',
      plan: {
        type: planType,
        wordLimit: plan.wordLimit,
        expiryDate: expiryDate.toISOString(),
        description: plan.description
      }
    })

  } catch (error: any) {
    console.error('Payment success handler error:', error)
    return NextResponse.json({
      error: 'Failed to process payment success',
      details: error.message
    }, { status: 500 })
  }
}
