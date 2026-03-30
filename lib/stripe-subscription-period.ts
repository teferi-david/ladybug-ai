import type Stripe from 'stripe'

/**
 * Resolve plan_expiry from a Stripe Subscription (handles trialing, odd API shapes, and list summaries).
 */
export async function getSubscriptionPeriodEndIso(
  stripe: Stripe,
  subscription: Stripe.Subscription
): Promise<string> {
  const id = subscription.id
  if (!id) {
    throw new Error('Subscription missing id')
  }

  const full = await stripe.subscriptions.retrieve(id)
  const r = full as unknown as Record<string, number | undefined>

  const end =
    (typeof full.current_period_end === 'number' ? full.current_period_end : undefined) ??
    (typeof r.current_period_end === 'number' ? r.current_period_end : undefined) ??
    (typeof r.currentPeriodEnd === 'number' ? r.currentPeriodEnd : undefined)

  if (typeof end === 'number' && end > 0) {
    return new Date(end * 1000).toISOString()
  }

  const trialEnd =
    (typeof full.trial_end === 'number' ? full.trial_end : undefined) ??
    (typeof r.trial_end === 'number' ? r.trial_end : undefined)
  if (typeof trialEnd === 'number' && trialEnd > 0) {
    return new Date(trialEnd * 1000).toISOString()
  }

  const start =
    (typeof full.start_date === 'number' ? full.start_date : undefined) ??
    (typeof r.start_date === 'number' ? r.start_date : undefined)
  if (typeof start === 'number' && start > 0) {
    const d = new Date(start * 1000)
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString()
  }

  const fallback = new Date()
  fallback.setFullYear(fallback.getFullYear() + 1)
  console.warn('stripe subscription period: using +1 year fallback for sub', id)
  return fallback.toISOString()
}

/** Synchronous helper when you already have a full Subscription from Stripe (e.g. webhook payload). */
export function getPeriodEndIsoFromSubscriptionObject(subscription: Stripe.Subscription): string {
  const r = subscription as unknown as Record<string, number | undefined>
  const end =
    (typeof subscription.current_period_end === 'number' ? subscription.current_period_end : undefined) ??
    (typeof r.current_period_end === 'number' ? r.current_period_end : undefined) ??
    (typeof r.currentPeriodEnd === 'number' ? r.currentPeriodEnd : undefined)

  if (typeof end === 'number' && end > 0) {
    return new Date(end * 1000).toISOString()
  }

  const trialEnd =
    (typeof subscription.trial_end === 'number' ? subscription.trial_end : undefined) ??
    (typeof r.trial_end === 'number' ? r.trial_end : undefined)
  if (typeof trialEnd === 'number' && trialEnd > 0) {
    return new Date(trialEnd * 1000).toISOString()
  }

  const start =
    (typeof subscription.start_date === 'number' ? subscription.start_date : undefined) ??
    (typeof r.start_date === 'number' ? r.start_date : undefined)
  if (typeof start === 'number' && start > 0) {
    const d = new Date(start * 1000)
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString()
  }

  const fallback = new Date()
  fallback.setFullYear(fallback.getFullYear() + 1)
  console.warn('stripe subscription period: +1 year fallback (sync) for sub', subscription.id)
  return fallback.toISOString()
}
