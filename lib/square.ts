import { Client, Environment } from 'squareup'

// Initialize Square client
const square = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
})

export { square }

// Plan configurations
export const PLAN_PRICES = {
  trial: {
    amount: 149, // $1.49 in cents
    name: '3-Day Trial',
    duration: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
  },
  monthly: {
    amount: 1549, // $15.49 in cents
    name: 'Monthly Plan',
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  annual: {
    amount: 14949, // $149.49 in cents
    name: 'Annual Plan',
    duration: 365 * 24 * 60 * 60 * 1000, // 365 days
  },
  singleUse: {
    amount: 399, // $3.99 in cents
    name: 'Single Use',
    duration: 24 * 60 * 60 * 1000, // 24 hours
    tokenLimit: 2000,
  },
}

export type PlanType = keyof typeof PLAN_PRICES
