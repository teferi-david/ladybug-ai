import { SquareClient, SquareEnvironment, WebhooksHelper } from 'square'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

// Initialize Square client with environment configuration
const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.NODE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
})

// Plan configuration mapping
export const PLAN_CONFIG = {
  trial: {
    name: '3-Day Trial',
    amount: 149, // $1.49 in cents
    duration: 3, // days
    wordLimit: 5000,
  },
  monthly: {
    name: 'Monthly Plan',
    amount: 1549, // $15.49 in cents
    duration: 30, // days
    wordLimit: 25000,
  },
  annual: {
    name: 'Annual Plan',
    amount: 14949, // $149.49 in cents
    duration: 365, // days
    wordLimit: 25000,
  },
  'single-use': {
    name: 'Single Use',
    amount: 399, // $3.99 in cents
    duration: 1, // day
    wordLimit: 2000,
  },
} as const

export type PlanKey = keyof typeof PLAN_CONFIG

/**
 * Creates a Square checkout link for the specified plan
 * @param params - Checkout parameters
 * @returns Promise<{ checkoutUrl: string; checkoutId: string }>
 */
export async function createCheckoutLink(params: {
  plan: PlanKey
  userId: string
  userEmail: string
  successUrl?: string
  cancelUrl?: string
}): Promise<{ checkoutUrl: string; checkoutId: string }> {
  const { plan, userId, userEmail, successUrl, cancelUrl } = params
  
  // Validate plan exists
  if (!PLAN_CONFIG[plan]) {
    throw new Error(`Invalid plan: ${plan}`)
  }

  const planConfig = PLAN_CONFIG[plan]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // Generate unique reference ID for webhook processing
  const nonce = Date.now().toString(36) + Math.random().toString(36).substr(2)
  const referenceId = `${userId}::${plan}::${nonce}`
  
  // Create idempotency key
  const idempotencyKey = `checkout-${userId}-${plan}-${Date.now()}`

  try {
    // Create Square order first
    const orderResponse = await squareClient.ordersApi.createOrder({
      idempotencyKey: `order-${idempotencyKey}`,
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems: [
          {
            name: planConfig.name,
            quantity: '1',
            basePriceMoney: {
              amount: planConfig.amount,
              currency: 'USD',
            },
          },
        ],
        // Include reference ID for webhook processing
        metadata: {
          reference_id: referenceId,
          user_id: userId,
          plan: plan,
        },
      },
    })

    if (!orderResponse.result.order?.id) {
      throw new Error('Failed to create order')
    }

    const orderId = orderResponse.result.order.id

    // Create Square checkout using the order
    const checkoutResponse = await squareClient.checkoutApi.createCheckout({
      idempotencyKey,
      checkout: {
        orderId,
        askForShippingAddress: false,
        merchantSupportEmail: 'support@ladybugai.us',
        prePopulateBuyerEmail: userEmail,
        redirectUrl: successUrl || `${appUrl}/api/square/return`,
        note: `Ladybug AI - ${planConfig.name}`,
      },
    })

    if (!checkoutResponse.result.checkout?.checkoutPageUrl) {
      throw new Error('Failed to create checkout - no URL returned')
    }

    return {
      checkoutUrl: checkoutResponse.result.checkout.checkoutPageUrl,
      checkoutId: checkoutResponse.result.checkout.id!,
    }
  } catch (error: any) {
    console.error('Square checkout creation error:', error)
    throw new Error(`Failed to create checkout: ${error.message}`)
  }
}

/**
 * Verifies Square webhook signature for security
 * @param req - Next.js request object
 * @param body - Raw request body
 * @returns boolean indicating if signature is valid
 */
export function verifyWebhookSignature(req: NextRequest, body: string): boolean {
  try {
    const signature = req.headers.get('x-square-signature')
    if (!signature) {
      console.error('Missing Square signature header')
      return false
    }

    // Verify webhook signature using HMAC-SHA256
    // Reference: https://developer.squareup.com/docs/webhooks-api/verify-signatures
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!
    const expectedSignature = crypto
      .createHmac('sha256', webhookSignatureKey)
      .update(body)
      .digest('base64')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return false
  }
}

/**
 * Retrieves payment details from Square
 * @param paymentId - Square payment ID
 * @returns Payment details or null if not found
 */
export async function getPaymentDetails(paymentId: string) {
  try {
    const response = await squareClient.paymentsApi.getPayment(paymentId)
    return response.result.payment
  } catch (error) {
    console.error('Error fetching payment details:', error)
    return null
  }
}

export { squareClient }
