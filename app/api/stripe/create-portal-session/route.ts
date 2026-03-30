import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { validateUserSession, getUserById } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/stripe/create-portal-session
 * Authorization: Bearer <supabase_access_token>
 * Opens Stripe Customer Portal (manage/cancel subscription).
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

    const row = await getUserById(user.id)
    const customerId = row?.stripe_customer_id
    if (!customerId) {
      return NextResponse.json(
        {
          error: 'No billing profile',
          message: 'We could not find a Stripe customer for this account. Contact support.',
        },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const stripe = getStripe()

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard`,
    })

    return NextResponse.json({ url: portal.url })
  } catch (e: any) {
    console.error('billing portal error:', e)
    return NextResponse.json(
      { error: e.message || 'Could not open billing portal' },
      { status: 500 }
    )
  }
}
