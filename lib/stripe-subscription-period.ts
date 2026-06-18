import type Stripe from 'stripe'

function num(v: unknown): number | undefined {
  return typeof v === 'number' && v > 0 ? v : undefined
}

/**
 * Period end (unix seconds) for a subscription.
 *
 * Stripe's current API ("basil", used by stripe-node v18+/v21) moved `current_period_end` OFF the
 * Subscription object and ONTO each subscription item. Reading the old top-level field returns
 * undefined, which previously caused a fall back to `trial_end` — and for a converted trial that is a
 * PAST date, expiring the user's access immediately. We read the item field first, then fall back to
 * the legacy top-level field for older subscriptions.
 */
function periodEndUnixFromSubscription(sub: Stripe.Subscription): number | undefined {
  const items = sub.items?.data ?? []
  let maxEnd: number | undefined
  for (const it of items) {
    const e = num((it as unknown as Record<string, unknown>).current_period_end)
    if (e !== undefined) maxEnd = maxEnd === undefined ? e : Math.max(maxEnd, e)
  }
  if (maxEnd !== undefined) return maxEnd

  const r = sub as unknown as Record<string, unknown>
  return num(r.current_period_end) ?? num(r.currentPeriodEnd)
}

/** Accurate fallback from the price's billing interval (e.g. monthly vs annual), defaulting to 1 month. */
function intervalFallbackIso(sub: Stripe.Subscription, fromUnix?: number): string {
  const base = fromUnix && fromUnix > 0 ? new Date(fromUnix * 1000) : new Date()
  const recurring = sub.items?.data?.[0]?.price?.recurring
  const interval = recurring?.interval
  const count = recurring?.interval_count ?? 1
  const d = new Date(base)
  if (interval === 'year') d.setFullYear(d.getFullYear() + count)
  else if (interval === 'week') d.setDate(d.getDate() + 7 * count)
  else if (interval === 'day') d.setDate(d.getDate() + count)
  else d.setMonth(d.getMonth() + count) // 'month' or unknown
  return d.toISOString()
}

/** Resolve plan_expiry from a full Subscription object (e.g. webhook payload, list/search result). */
export function getPeriodEndIsoFromSubscriptionObject(subscription: Stripe.Subscription): string {
  const end = periodEndUnixFromSubscription(subscription)
  if (end !== undefined) return new Date(end * 1000).toISOString()

  const r = subscription as unknown as Record<string, unknown>
  const trialEnd = num((subscription as { trial_end?: number }).trial_end) ?? num(r.trial_end)
  // Only trust trial_end if it is still in the future (a past trial_end must never become plan_expiry).
  if (trialEnd !== undefined && trialEnd * 1000 > Date.now()) {
    return new Date(trialEnd * 1000).toISOString()
  }

  const start =
    num((subscription as { start_date?: number }).start_date) ??
    num(r.start_date) ??
    num(r.current_period_start)
  console.warn('stripe subscription period: using interval fallback for sub', subscription.id)
  return intervalFallbackIso(subscription, start)
}

/** Resolve plan_expiry from a Stripe Subscription, re-fetching the full object for freshest fields. */
export async function getSubscriptionPeriodEndIso(
  stripe: Stripe,
  subscription: Stripe.Subscription
): Promise<string> {
  const id = subscription.id
  if (!id) {
    throw new Error('Subscription missing id')
  }

  let full = subscription
  try {
    full = await stripe.subscriptions.retrieve(id)
  } catch (e) {
    console.warn('stripe subscription period: retrieve failed, using provided object', e)
  }

  return getPeriodEndIsoFromSubscriptionObject(full)
}
