import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLAN_PRICES = {
  trial: {
    priceId: process.env.STRIPE_TRIAL_PRICE_ID!,
    amount: 149, // $1.49 in cents
    name: '3-Day Trial',
    duration: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
  },
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 1549, // $15.49 in cents
    name: 'Monthly Plan',
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID!,
    amount: 14949, // $149.49 in cents
    name: 'Annual Plan',
    duration: 365 * 24 * 60 * 60 * 1000, // 365 days
  },
  singleUse: {
    priceId: process.env.STRIPE_SINGLE_USE_PRICE_ID!,
    amount: 399, // $3.99 in cents
    name: 'Single Use',
    duration: 24 * 60 * 60 * 1000, // 24 hours
    tokenLimit: 2000,
  },
}

