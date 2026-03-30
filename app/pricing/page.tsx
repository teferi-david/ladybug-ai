'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

const FEATURES = [
  '1-day free trial, then billed annually',
  'Unlimited AI humanizer (no daily cap while subscribed)',
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
          <p className="text-xl text-gray-600">
            One simple plan — billed annually at $9.95/month equivalent.
          </p>
        </div>

        <Card className="border-primary border-2 shadow-lg">
          <div className="bg-primary text-white text-center py-2 text-sm font-semibold rounded-t-lg">
            Ladybug AI Pro
          </div>
          <CardHeader>
            <CardTitle>Annual subscription</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold text-primary">$9.95</span>
              <span className="text-gray-600 ml-1">/month</span>
            </div>
            <CardDescription className="text-base pt-2">
              Start with a 1-day free trial, then continue annually. Secure checkout powered by Stripe.
            </CardDescription>
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
          <CardFooter>
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Redirecting to Stripe…' : user ? 'Subscribe' : 'Sign up to subscribe'}
            </Button>
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
              Guests get limited daily tries. Subscribers get unlimited use within normal fair-use
              limits described at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
