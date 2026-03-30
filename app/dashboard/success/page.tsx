'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        const sessionId = searchParams.get('session_id')

        if (sessionId) {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session?.access_token) {
            router.push('/login')
            return
          }

          const res = await fetch('/api/stripe/complete-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ sessionId }),
          })

          const data = await res.json().catch(() => ({}))
          if (!res.ok) {
            setError(data.error || 'Could not confirm your subscription. Webhook may still process shortly.')
            return
          }

          setSuccess(true)
          return
        }

        const ok = searchParams.get('success')
        const plan = searchParams.get('plan')

        if (ok === 'true' && plan) {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session?.user) {
            router.push('/login')
            return
          }

          const { error: updateError } = await supabase
            .from('users')
            .update({
              current_plan: plan,
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.user.id)

          if (updateError) {
            console.error('Failed to update user plan:', updateError)
            setError('Failed to activate your plan. Please contact support.')
            return
          }

          setSuccess(true)
        } else {
          setError('Invalid payment confirmation')
        }
      } catch (err: unknown) {
        console.error('Payment success processing error:', err)
        setError('Failed to process payment. Please contact support.')
      } finally {
        setLoading(false)
      }
    }

    processPaymentSuccess()
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Processing your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-600">Payment Successful!</CardTitle>
            <CardDescription>
              Your subscription has been activated. You now have access to all AI tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
              size="lg"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
