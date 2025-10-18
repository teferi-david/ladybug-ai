'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/loading-spinner'
import { CreditCard, CheckCircle } from 'lucide-react'

interface BuyButtonProps {
  plan: 'trial' | 'monthly' | 'annual' | 'single-use'
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const PLAN_LABELS = {
  trial: 'Start 3-Day Trial',
  monthly: 'Get Monthly Plan',
  annual: 'Get Annual Plan',
  'single-use': 'Buy Single Use',
} as const

const PLAN_PRICES = {
  trial: '$1.49',
  monthly: '$15.49',
  annual: '$149.49',
  'single-use': '$3.99',
} as const

/**
 * BuyButton component for Square checkout integration
 * 
 * Handles authentication, checkout creation, and redirect to Square
 * Shows loading states and error handling
 */
export function BuyButton({ 
  plan, 
  children, 
  className = '', 
  variant = 'default',
  size = 'default'
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        // Redirect to login if not authenticated
        window.location.href = '/login'
        return
      }

      console.log('Creating checkout for plan:', plan)

      // Create checkout session
      const response = await fetch('/api/square/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          supabaseAccessToken: session.access_token,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout')
      }

      console.log('Checkout created, redirecting to Square:', data.checkoutUrl)

      // Redirect to Square checkout
      window.location.href = data.checkoutUrl

    } catch (error: any) {
      console.error('Purchase error:', error)
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePurchase}
        disabled={loading}
        variant={variant}
        size={size}
        className={`w-full ${className}`}
      >
        {loading ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {children || PLAN_LABELS[plan]}
          </>
        )}
      </Button>
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center">
        {PLAN_PRICES[plan]} • Secure payment by Square
      </div>
    </div>
  )
}

/**
 * SuccessButton component for showing successful purchases
 */
export function SuccessButton({ plan }: { plan: string }) {
  return (
    <Button disabled className="w-full bg-green-600 hover:bg-green-700">
      <CheckCircle className="mr-2 h-4 w-4" />
      {plan} Active
    </Button>
  )
}

/**
 * LoginButton component for unauthenticated users
 */
export function LoginButton({ plan }: { plan: string }) {
  return (
    <Button 
      onClick={() => window.location.href = '/login'} 
      variant="outline" 
      className="w-full"
    >
      Sign In to Purchase {plan}
    </Button>
  )
}
