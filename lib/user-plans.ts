// User plan management and word limits
export interface UserPlan {
  id: string
  planType: 'trial' | 'monthly' | 'annual' | 'singleUse'
  wordLimit: number
  periodDays: number
  description: string
}

export const USER_PLANS: Record<string, UserPlan> = {
  trial: {
    id: 'trial',
    planType: 'trial',
    wordLimit: 5000,
    periodDays: 3,
    description: '3-Day Trial - 5,000 words'
  },
  monthly: {
    id: 'monthly',
    planType: 'monthly',
    wordLimit: 25000,
    periodDays: 30,
    description: 'Monthly Plan - 25,000 words/month'
  },
  annual: {
    id: 'annual',
    planType: 'annual',
    wordLimit: 25000,
    periodDays: 365,
    description: 'Annual Plan - 25,000 words/month'
  },
  singleUse: {
    id: 'singleUse',
    planType: 'singleUse',
    wordLimit: 2000,
    periodDays: 1,
    description: 'Single Use - 2,000 words for 24 hours'
  }
}

export function getPlanDetails(planType: string): UserPlan | null {
  return USER_PLANS[planType] || null
}

export function isPlanActive(user: any): boolean {
  if (!user.current_plan || !user.plan_expiry) {
    return false
  }

  const now = new Date()
  const expiryDate = new Date(user.plan_expiry)
  
  return expiryDate > now
}

export function getRemainingWords(user: any): number {
  if (!isPlanActive(user)) {
    return 0
  }

  const plan = getPlanDetails(user.current_plan)
  if (!plan) {
    return 0
  }

  return Math.max(0, plan.wordLimit - (user.words_used || 0))
}

export function canUseFeature(user: any, wordCount: number): boolean {
  if (!isPlanActive(user)) {
    return false
  }

  const remaining = getRemainingWords(user)
  return remaining >= wordCount
}

export function updateUserUsage(user: any, wordsUsed: number): any {
  return {
    ...user,
    words_used: (user.words_used || 0) + wordsUsed,
    last_used: new Date().toISOString()
  }
}
