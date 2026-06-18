import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { requireAdminFromRequest } from '@/lib/admin-auth'
import { getUserById } from '@/lib/supabaseServer'
import {
  restoreAccessForUser,
  grantPlanManually,
  findUserByEmail,
} from '@/lib/restore-access'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Action = 'inspect' | 'restore' | 'grant'

/**
 * POST /api/admin/restore-access
 * Authorization: Bearer <token of an ADMIN_EMAILS account>
 * Body: { email?: string, userId?: string, action: 'inspect' | 'restore' | 'grant', plan?, days? }
 *
 *  - inspect : read-only — show current DB plan + every Stripe subscription found, and what restore would do
 *  - restore : re-read Stripe and write the user's plan (non-destructive; only grants when a sub is active)
 *  - grant   : manual override — grant `plan` for `days` (use only when you know they paid)
 */
export async function POST(request: NextRequest) {
  const admin = await requireAdminFromRequest(request.headers.get('authorization'))
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  let body: { email?: string; userId?: string; action?: Action; plan?: string; days?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const action: Action = body.action ?? 'inspect'

  // Resolve the target user from userId or email.
  let userId = typeof body.userId === 'string' ? body.userId.trim() : ''
  if (!userId) {
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    if (!email) {
      return NextResponse.json({ error: 'Provide an email or userId.' }, { status: 400 })
    }
    const found = await findUserByEmail(email)
    if (!found) {
      return NextResponse.json(
        { error: `No account found for ${email}. They may have signed up with a different email.` },
        { status: 404 }
      )
    }
    userId = found.id
  } else {
    const exists = await getUserById(userId)
    if (!exists) {
      return NextResponse.json({ error: `No account found for user ${userId}.` }, { status: 404 })
    }
  }

  try {
    const stripe = getStripe()

    if (action === 'grant') {
      const plan = typeof body.plan === 'string' ? body.plan.trim() : ''
      const days = typeof body.days === 'number' ? body.days : Number(body.days)
      if (!plan || !Number.isFinite(days) || days <= 0) {
        return NextResponse.json(
          { error: 'Manual grant requires a valid plan and a positive number of days.' },
          { status: 400 }
        )
      }
      const result = await grantPlanManually(userId, plan, days)
      return NextResponse.json(result, { status: result.ok ? 200 : 400 })
    }

    const result = await restoreAccessForUser(stripe, userId, { dryRun: action === 'inspect' })
    return NextResponse.json(result, { status: result.ok ? 200 : 404 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Admin restore failed'
    console.error('admin restore-access error:', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
