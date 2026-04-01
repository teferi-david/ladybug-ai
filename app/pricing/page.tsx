'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { STRIPE_PRICE_IDS } from '@/lib/stripe-plans'
import { cn } from '@/lib/utils'

/** Display math (annual total ÷ 12) — matches Stripe prices. */
const BASIC_MONTHLY = 14.99
const BASIC_ANNUAL_TOTAL = 59.4
const UNLIMITED_MONTHLY = 24.99
const UNLIMITED_ANNUAL_TOTAL = 119.4

const basicAnnualEq = BASIC_ANNUAL_TOTAL / 12
const unlimitedAnnualEq = UNLIMITED_ANNUAL_TOTAL / 12

const basicAnnualSavePct = Math.round(
  (1 - BASIC_ANNUAL_TOTAL / (BASIC_MONTHLY * 12)) * 100
)
const unlimitedAnnualSavePct = Math.round(
  (1 - UNLIMITED_ANNUAL_TOTAL / (UNLIMITED_MONTHLY * 12)) * 100
)

const emeraldBadgeClass =
  'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800'

const BASIC_FEATURES = [
  '500,000 words per year (all tools combined)',
  'AI Humanizer — Basic, Advanced, and Academic (Turnitin) modes',
  'Paraphraser & citation tools',
  '1-day free trial, then billing continues',
  'Cancel anytime in the Stripe customer portal',
]

const UNLIMITED_FEATURES = [
  'Unlimited words across all tools',
  'Everything in Basic, without usage limits',
  '1-day free trial, then billing continues',
  'Cancel anytime in the Stripe customer portal',
]

export default function PricingPage() {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [user, setUser] = useState<unknown>(null)
  const [cycle, setCycle] = useState<'annual' | 'monthly'>('annual')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const handleCheckout = async (priceId: string) => {
    if (!user) {
      router.push('/register')
      return
    }

    setLoadingId(priceId)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Checkout could not be started. Try again.')
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('No checkout URL returned.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoadingId(null)
    }
  }

  const basicPriceId =
    cycle === 'annual' ? STRIPE_PRICE_IDS.basicAnnual : STRIPE_PRICE_IDS.basicMonthly
  const unlimitedPriceId =
    cycle === 'annual' ? STRIPE_PRICE_IDS.unlimitedAnnual : STRIPE_PRICE_IDS.unlimitedMonthly

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        {/* No top “Pricing” title — page context is obvious (Grubby-style: jump to value) */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-2xl font-bold text-primary md:text-3xl">1 Day free trial</p>
          <p className="mx-auto mb-8 max-w-lg text-sm text-gray-500">
            Start with a 1-day free trial, then continue on the plan you choose. Annual pricing shows as a
            simple monthly equivalent.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setCycle('annual')}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-semibold transition-colors',
                  cycle === 'annual' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Annual
              </button>
              <button
                type="button"
                onClick={() => setCycle('monthly')}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-semibold transition-colors',
                  cycle === 'monthly' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Monthly
              </button>
            </div>
            {cycle === 'annual' && (
              <span className={emeraldBadgeClass}>70% off</span>
            )}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="flex flex-col border-2 border-gray-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">Basic</CardTitle>
              {cycle === 'annual' ? (
                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">${basicAnnualEq.toFixed(2)}</span>
                    <span className="text-gray-600">/month</span>
                    <span className={emeraldBadgeClass}>~{basicAnnualSavePct}% off vs monthly</span>
                  </div>
                  <p className="text-xs text-gray-500">Billed Annually</p>
                </div>
              ) : (
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">${BASIC_MONTHLY.toFixed(2)}</span>
                  <span className="text-gray-600"> /month</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <ul className="space-y-3">
                {BASIC_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start text-sm">
                    <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <ProUpgradeButton
                type="button"
                onClick={() => void handleCheckout(basicPriceId)}
                disabled={loadingId !== null}
                className="w-full"
                size="lg"
              >
                {loadingId === basicPriceId
                  ? 'Redirecting to Stripe…'
                  : user
                    ? 'Start 1-day free trial — Basic'
                    : 'Sign up — try Basic free for 1 day'}
              </ProUpgradeButton>
            </CardFooter>
          </Card>

          <Card className="relative flex flex-col border-2 border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              Best for heavy use
            </div>
            <CardHeader className="pb-2 pt-6">
              <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">Unlimited</CardTitle>
              {cycle === 'annual' ? (
                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">${unlimitedAnnualEq.toFixed(2)}</span>
                    <span className="text-gray-600">/month</span>
                    <span className={emeraldBadgeClass}>~{unlimitedAnnualSavePct}% off vs monthly</span>
                  </div>
                  <p className="text-xs text-gray-500">Billed Annually</p>
                </div>
              ) : (
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">${UNLIMITED_MONTHLY.toFixed(2)}</span>
                  <span className="text-gray-600"> /month</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <ul className="space-y-3">
                {UNLIMITED_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start text-sm">
                    <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <ProUpgradeButton
                type="button"
                onClick={() => void handleCheckout(unlimitedPriceId)}
                disabled={loadingId !== null}
                className="w-full"
                size="lg"
              >
                {loadingId === unlimitedPriceId
                  ? 'Redirecting to Stripe…'
                  : user
                    ? 'Start 1-day free trial — Unlimited'
                    : 'Sign up — try Unlimited free for 1 day'}
              </ProUpgradeButton>
            </CardFooter>
          </Card>
        </div>

        <div className="mx-auto mt-14 max-w-2xl space-y-6 text-left">
          <h2 className="text-center text-xl font-bold">FAQ</h2>
          <div>
            <h3 className="mb-1 font-semibold">How does billing work?</h3>
            <p className="text-sm text-gray-600">
              After the 1-day trial, Stripe charges your selected plan. Annual plans are billed once per year.
              Manage or cancel in the Stripe billing portal.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold">What is the free tier?</h3>
            <p className="text-sm text-gray-600">
              You can use the humanizer on the free tier with fair limits. Paid plans unlock every tool and
              higher limits — Basic includes 500,000 words per rolling year; Unlimited has no word cap.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
