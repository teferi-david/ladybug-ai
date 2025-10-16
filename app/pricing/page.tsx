'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const handleCheckout = async (planType: string) => {
    if (!user) {
      router.push('/register')
      return
    }

    setLoading(planType)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ planType }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'An error occurred')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      id: 'trial',
      name: '3-Day Trial',
      price: '$1.49',
      period: 'one-time',
      description: 'Perfect for trying out all features - converts to annual plan',
      features: [
        'Access to all AI tools',
        'AI Humanizer',
        'Paraphraser',
        'Citation Generator (APA & MLA)',
        '3 days full access',
        'Auto-converts to annual plan ($12.49/mo)',
        'Cancel anytime during trial',
      ],
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '$15.49',
      period: 'per month',
      description: 'Unlimited access, billed monthly',
      features: [
        'Unlimited AI Humanizer',
        'Unlimited Paraphraser',
        'Unlimited Citation Generator',
        'Priority support',
        'Cancel anytime',
      ],
    },
    {
      id: 'annual',
      name: 'Annual Plan',
      price: '$12.49',
      period: 'per month',
      description: 'Billed annually - save $36/year',
      popular: true,
      features: [
        'Everything in Monthly',
        'Billed annually ($149.49/year)',
        'Save $36 per year',
        'Priority support',
        'Early access to new features',
      ],
    },
    {
      id: 'singleUse',
      name: 'Single Use',
      price: '$3.99',
      period: 'one-time',
      description: '2,000 tokens, 24-hour access',
      features: [
        '2,000 token limit',
        '24-hour access window',
        'All AI tools',
        'Perfect for one project',
        'No subscription',
      ],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col ${
                plan.popular ? 'border-primary border-2 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-white text-center py-2 text-sm font-semibold rounded-t-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {loading === plan.id ? 'Processing...' : user ? 'Get Started' : 'Sign Up to Continue'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel your subscription at any time from your dashboard.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards via Stripe.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How does the trial work?</h3>
              <p className="text-gray-600 text-sm">
                The 3-day trial gives you full access to all features for 3 days for just $1.49. After the trial, you'll be automatically charged for the annual plan ($12.49/month billed annually). You can cancel anytime during the trial.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What are tokens?</h3>
              <p className="text-gray-600 text-sm">
                Tokens are units of text processing. Approximately 1 token = 4 characters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

