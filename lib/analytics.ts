import { track } from '@vercel/analytics'

/**
 * Funnel step names — keep these stable; they appear as custom events in the
 * Vercel Analytics dashboard. The funnel is:
 *   signup → humanize_run → limit_hit → pricing_viewed → checkout_started → subscription_activated
 */
export type FunnelEvent =
  | 'signup'
  | 'humanize_run'
  | 'limit_hit'
  | 'pricing_viewed'
  | 'checkout_started'
  | 'subscription_activated'

type Props = Record<string, string | number | boolean | null>

/** Fire a funnel event. Never throws — analytics must never break the UX. */
export function trackFunnel(event: FunnelEvent, props?: Props): void {
  try {
    track(event, props)
  } catch {
    /* no-op: analytics is best-effort */
  }
}

/** Classify a humanizer limit/upgrade error into a funnel-friendly reason. */
export function classifyLimitReason(message?: string | null): string {
  const m = (message ?? '').toLowerCase()
  if (m.includes('coin')) return 'coins'
  if (m.includes('yearly') || m.includes('year')) return 'yearly_word_cap'
  if (m.includes('word')) return 'per_run_word_cap'
  if (m.includes('daily') || m.includes('day')) return 'daily_runs'
  return 'other'
}
