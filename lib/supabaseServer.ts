import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { PLAN_CONFIG, PlanKey } from './squareClient'

// Initialize Supabase server client with service role key for admin operations
const supabaseServer = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Retrieves user data by ID from the users table
 * @param userId - User ID from Supabase auth
 * @returns User data or null if not found
 */
export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching user:', error)
    return null
  }
}

/**
 * Updates user plan and expiry in the users table
 * @param userId - User ID
 * @param planKey - Plan type
 * @param planExpiry - Expiry date
 * @param usesLeft - Optional uses left for single-use plans
 */
export async function updateUserPlan(
  userId: string,
  planKey: PlanKey,
  planExpiry: string,
  usesLeft?: number
) {
  try {
    const updateData: any = {
      current_plan: planKey,
      plan_expiry: planExpiry,
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    }

    // Set uses_left for single-use plans
    if (planKey === 'single-use' && usesLeft !== undefined) {
      updateData.uses_left = usesLeft
    }

    const { error } = await supabaseServer
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      console.error('Error updating user plan:', error)
      throw new Error(`Failed to update user plan: ${error.message}`)
    }

    console.log(`User ${userId} plan updated to ${planKey} with expiry ${planExpiry}`)
  } catch (error) {
    console.error('Unexpected error updating user plan:', error)
    throw error
  }
}

/**
 * Records payment in the payments table for idempotency
 * @param squarePaymentId - Square payment ID
 * @param payload - Payment payload data
 * @returns boolean indicating if payment was new (true) or already processed (false)
 */
export async function recordPaymentIfNew(
  squarePaymentId: string,
  payload: {
    userId: string
    plan: PlanKey
    amount: number
    currency: string
    metadata?: any
  }
): Promise<boolean> {
  try {
    // First, check if payment already exists
    const { data: existingPayment, error: checkError } = await supabaseServer
      .from('payments')
      .select('id')
      .eq('square_payment_id', squarePaymentId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned", which is expected for new payments
      console.error('Error checking existing payment:', checkError)
      throw new Error(`Failed to check existing payment: ${checkError.message}`)
    }

    // If payment already exists, return false (already processed)
    if (existingPayment) {
      console.log(`Payment ${squarePaymentId} already processed`)
      return false
    }

    // Insert new payment record
    const { error: insertError } = await supabaseServer
      .from('payments')
      .insert({
        user_id: payload.userId,
        plan: payload.plan,
        square_payment_id: squarePaymentId,
        amount: payload.amount,
        currency: payload.currency,
        metadata: payload.metadata || null,
      })

    if (insertError) {
      console.error('Error inserting payment record:', insertError)
      throw new Error(`Failed to record payment: ${insertError.message}`)
    }

    console.log(`Payment ${squarePaymentId} recorded for user ${payload.userId}`)
    return true
  } catch (error) {
    console.error('Unexpected error recording payment:', error)
    throw error
  }
}

/**
 * Calculates plan expiry date based on plan type
 * @param planKey - Plan type
 * @returns ISO string of expiry date
 */
export function calculatePlanExpiry(planKey: PlanKey): string {
  const planConfig = PLAN_CONFIG[planKey]
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + planConfig.duration)
  return expiryDate.toISOString()
}

/**
 * Calculates uses left for single-use plans
 * @param planKey - Plan type
 * @returns Number of uses left
 */
export function calculateUsesLeft(planKey: PlanKey): number | undefined {
  if (planKey === 'single-use') {
    return PLAN_CONFIG[planKey].wordLimit
  }
  return undefined
}

/**
 * Validates user session from Supabase auth token
 * @param authToken - Supabase access token
 * @returns User data or null if invalid
 */
export async function validateUserSession(authToken: string) {
  try {
    const { data: { user }, error } = await supabaseServer.auth.getUser(authToken)
    
    if (error || !user) {
      console.error('Invalid auth token:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Error validating user session:', error)
    return null
  }
}

export { supabaseServer }
