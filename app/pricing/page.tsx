'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

const FEATURES = [
  'Full Pro access during your 1-day trial',
  'Unlimited AI humanizer (no daily cap while subscribed)',
  'Paraphraser, Citations, and other Pro AI tools',
  'All humanize levels (High school, College, Graduate)',
  'Higher word limits vs free tier',
  'Cancel anytime in the Stripe customer portal',
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<unknown>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const handleCheckout = async () => {
    if (!user) {
      router.push('/register')
      return
    }

    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
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
        body: JSON.stringify({}),
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
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing</h1>
          <p className="text-2xl md:text-3xl font-bold text-primary mb-2">1 Day free trial</p>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            One simple Pro plan. After your trial, pricing is $9.95/month equivalent, charged as one annual
            payment (taxes may apply).
          </p>
        </div>

        <Card className="border-primary border-2 shadow-lg">
          <div className="bg-primary text-white text-center py-2 text-sm font-semibold rounded-t-lg">
            Ladybug AI Pro
          </div>
          <CardHeader>
            <CardTitle className="text-xl">Annual subscription</CardTitle>
            <div className="space-y-1.5 pt-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Start with a 1-day free trial, then continue annually.
              </p>
              <p className="text-xs text-gray-500 leading-snug">
                Then $9.95/month equivalent, billed annually as one payment. Secure checkout with Stripe.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-2">
            <ProUpgradeButton
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading
                ? 'Redirecting to Stripe…'
                : user
                  ? 'Start 1-day free trial'
                  : 'Sign up — try free for 1 day'}
            </ProUpgradeButton>
          </CardFooter>
        </Card>

        <div className="mt-10 text-left max-w-lg mx-auto space-y-6">
          <h2 className="text-xl font-bold text-center">FAQ</h2>
          <div>
            <h3 className="font-semibold mb-1">How does billing work?</h3>
            <p className="text-gray-600 text-sm">
              You are charged once per year for twelve months at the $9.95/month rate (total varies
              by taxes). Manage or cancel in your Stripe billing portal.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">What about the free tier?</h3>
            <p className="text-gray-600 text-sm">
              Guests get limited daily tries on the humanizer. After checkout you get a 1-day free trial,
              then annual billing — unlimited humanizer and Pro tools within normal fair-use limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
