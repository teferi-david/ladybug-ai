/** Stripe Price IDs: Basic and Unlimited, monthly and annual (env overrides). */
export const STRIPE_PRICE_IDS = {
  basicMonthly: process.env.STRIPE_PRICE_BASIC_MONTHLY ?? 'price_1THQqDDds2fevCulVdKNDgkM',
  basicAnnual: process.env.STRIPE_PRICE_BASIC_ANNUAL ?? 'price_1THQcQDds2fevCulkQZFFItb',
  unlimitedMonthly: process.env.STRIPE_PRICE_UNLIMITED_MONTHLY ?? 'price_1THQsWDds2fevCulMkYDHspI',
  unlimitedAnnual: process.env.STRIPE_PRICE_UNLIMITED_ANNUAL ?? 'price_1TChiYDds2fevCulsSHlcXG4',
} as const

/** Max words per rolling year for Basic plans (all tools combined). */
export const BASIC_YEARLY_WORD_CAP = 500_000

const PRICE_TO_PLAN: Record<string, string> = {
  [STRIPE_PRICE_IDS.basicMonthly]: 'basic_monthly',
  [STRIPE_PRICE_IDS.basicAnnual]: 'basic_annual',
  [STRIPE_PRICE_IDS.unlimitedMonthly]: 'unlimited_monthly',
  [STRIPE_PRICE_IDS.unlimitedAnnual]: 'unlimited_annual',
}

export function planKeyFromStripePriceId(priceId: string | undefined | null): string | null {
  if (!priceId) return null
  return PRICE_TO_PLAN[priceId] ?? null
}

export function isValidCheckoutPriceId(priceId: string): boolean {
  return Object.values(STRIPE_PRICE_IDS).includes(priceId as (typeof STRIPE_PRICE_IDS)[keyof typeof STRIPE_PRICE_IDS])
}

/** Legacy Stripe/Square plans treated as unlimited access. */
export function isLegacyUnlimitedPlan(plan: string): boolean {
  return plan === 'annual' || plan === 'monthly' || plan === 'trial'
}

export function isBasicPlanKey(plan: string): boolean {
  return plan === 'basic_monthly' || plan === 'basic_annual'
}

export function isUnlimitedPlanKey(plan: string): boolean {
  return (
    plan === 'unlimited_monthly' ||
    plan === 'unlimited_annual' ||
    isLegacyUnlimitedPlan(plan)
  )
}

export function getPlanDisplayName(plan: string | null | undefined): string {
  switch (plan) {
    case 'basic_monthly':
      return 'Basic (monthly)'
    case 'basic_annual':
      return 'Basic (annual)'
    case 'unlimited_monthly':
      return 'Unlimited (monthly)'
    case 'unlimited_annual':
      return 'Unlimited (annual)'
    case 'annual':
      return 'Pro annual (legacy)'
    case 'monthly':
      return 'Pro monthly (legacy)'
    case 'trial':
      return 'Trial'
    default:
      return 'Free'
  }
}
