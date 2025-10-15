'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/loading-spinner'
import { formatDate, isExpired } from '@/lib/utils'
import { Sparkles, RefreshCw, Quote, Calendar, CreditCard, User } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [managingSubscription, setManagingSubscription] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    setUser(session.user)
    await fetchUserData(session.access_token)
  }

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setManagingSubscription(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to open subscription management')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setManagingSubscription(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const planExpired = userData?.plan_expiry ? isExpired(userData.plan_expiry) : true
  const hasActivePlan = userData?.current_plan !== 'none' && !planExpired

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userData?.name || user?.email}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {userData?.current_plan === 'none' ? 'Free' : userData?.current_plan}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {hasActivePlan ? 'Active' : 'Inactive'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Expiry</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData?.plan_expiry ? formatDate(userData.plan_expiry) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {planExpired && userData?.plan_expiry ? 'Expired' : 'Active until'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData?.current_plan === 'single-use'
                  ? userData?.uses_left || 0
                  : hasActivePlan
                  ? 'Unlimited'
                  : '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userData?.current_plan === 'single-use' ? 'Tokens' : 'Usage'}
              </p>
            </CardContent>
          </Card>
        </div>

        {!hasActivePlan && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle>Upgrade Your Plan</CardTitle>
              <CardDescription>
                Get unlimited access to all AI tools with a subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pricing">
                <Button>View Pricing Plans</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access your favorite tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/humanizer">
                <Button variant="outline" className="w-full justify-start">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Humanizer
                </Button>
              </Link>
              <Link href="/paraphraser">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Paraphraser
                </Button>
              </Link>
              <Link href="/citation">
                <Button variant="outline" className="w-full justify-start">
                  <Quote className="mr-2 h-4 w-4" />
                  Citation Generator
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {userData?.stripe_customer_id && (
                <Button
                  onClick={handleManageSubscription}
                  disabled={managingSubscription}
                  className="w-full"
                >
                  {managingSubscription ? 'Loading...' : 'Manage Subscription'}
                </Button>
              )}
              <Link href="/pricing">
                <Button variant="outline" className="w-full">
                  View All Plans
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Name</span>
              <span className="font-medium">{userData?.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Member Since</span>
              <span className="font-medium">
                {userData?.created_at ? formatDate(userData.created_at) : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

