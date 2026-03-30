import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { validateUserSession, getUserById, supabaseServer } from '@/lib/supabaseServer'
import type Stripe from 'stripe'

function isMissingStripeCustomerError(e: unknown): boolean {
  const err = e as Stripe.errors.StripeError | { code?: string; message?: string; type?: string }
  if (err?.code === 'resource_missing') return true
  const msg = typeof err?.message === 'string' ? err.message : ''
  return /no such customer/i.test(msg)
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/stripe/create-portal-session
 * Authorization: Bearer <supabase_access_token>
 * Opens Stripe Customer Portal (manage/cancel subscription).
 */
export async function POST(request: NextRequest) {
  let userId: string | null = null
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

    userId = user.id
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

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
    const stripe = getStripe()

    // Stripe shows "Return to [business name]" using your Stripe account / portal branding;
    // after closing the portal, users land on billing-return (see app/dashboard/billing-return).
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/billing-return`,
    })

    return NextResponse.json({ url: portal.url })
  } catch (e: any) {
    console.error('billing portal error:', e)

    // Stale ID (test/live mix, customer deleted in Dashboard, or old account) — clear so UI can recover
    if (isMissingStripeCustomerError(e) && userId) {
      await supabaseServer
        .from('users')
        .update({
          stripe_customer_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      return NextResponse.json(
        {
          error: 'stripe_customer_invalid',
          message:
            'That Stripe billing profile is no longer valid (for example after switching test/live mode or if the customer was removed). We cleared the link on your account. Use Pricing to subscribe again if you need billing access, or contact support.',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: e.message || 'Could not open billing portal' },
      { status: 500 }
    )
  }
}
