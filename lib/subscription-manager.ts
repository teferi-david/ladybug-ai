// Subscription management system like popular SaaS sites
export interface SubscriptionStatus {
  isActive: boolean
  planType: string
  expiryDate: Date | null
  wordLimit: number
  wordsUsed: number
  wordsRemaining: number
  daysRemaining: number
  isExpired: boolean
  isNearExpiry: boolean
}

export class SubscriptionManager {
  static async getUserStatus(user: any): Promise<SubscriptionStatus> {
    const now = new Date()
    const plan = this.getPlanDetails(user.current_plan || 'free')
    
    let expiryDate: Date | null = null
    let isActive = false
    let isExpired = false
    let daysRemaining = 0
    
    if (user.plan_expiry) {
      expiryDate = new Date(user.plan_expiry)
      isActive = expiryDate > now
      isExpired = expiryDate <= now
      daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }
    
    const wordsUsed = user.words_used || 0
    const wordLimit = plan?.wordLimit || 0
    const wordsRemaining = Math.max(0, wordLimit - wordsUsed)
    const isNearExpiry = daysRemaining <= 3 && daysRemaining > 0
    
    return {
      isActive,
      planType: user.current_plan || 'free',
      expiryDate,
      wordLimit,
      wordsUsed,
      wordsRemaining,
      daysRemaining,
      isExpired,
      isNearExpiry
    }
  }
  
  static getPlanDetails(planType: string) {
    const plans = {
      trial: { wordLimit: 5000, periodDays: 3, name: '3-Day Trial' },
      monthly: { wordLimit: 25000, periodDays: 30, name: 'Monthly Plan' },
      annual: { wordLimit: 25000, periodDays: 365, name: 'Annual Plan' },
      singleUse: { wordLimit: 2000, periodDays: 1, name: 'Single Use' },
      free: { wordLimit: 0, periodDays: 0, name: 'Free Plan' }
    }
    
    return plans[planType as keyof typeof plans] || plans.free
  }
  
  static canUseFeature(status: SubscriptionStatus, wordCount: number): boolean {
    if (!status.isActive) return false
    if (status.isExpired) return false
    return status.wordsRemaining >= wordCount
  }
  
  static getUpgradeMessage(status: SubscriptionStatus): string {
    if (status.isExpired) {
      return 'Your subscription has expired. Please renew to continue using AI features.'
    }
    
    if (!status.isActive) {
      return 'Please upgrade to use AI features.'
    }
    
    if (status.isNearExpiry) {
      return `Your subscription expires in ${status.daysRemaining} days. Consider renewing to avoid interruption.`
    }
    
    return ''
  }
  
  static getStatusColor(status: SubscriptionStatus): string {
    if (status.isExpired) return 'text-red-600'
    if (status.isNearExpiry) return 'text-yellow-600'
    if (status.isActive) return 'text-green-600'
    return 'text-gray-600'
  }
  
  static getStatusBadge(status: SubscriptionStatus): string {
    if (status.isExpired) return 'Expired'
    if (status.isNearExpiry) return 'Expires Soon'
    if (status.isActive) return 'Active'
    return 'Inactive'
  }
}
