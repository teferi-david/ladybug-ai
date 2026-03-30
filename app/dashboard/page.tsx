'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, RefreshCw, Quote, Zap, ExternalLink } from 'lucide-react'
import { getPlanDetails, isPlanActive } from '@/lib/user-plans'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

export default function DashboardPage() {
  const router = useRouter()
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  const loadProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }
    setAuthUser(session.user)

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!error && data) {
      setProfile(data)
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    loadProfile()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile()
    })
    return () => subscription.unsubscribe()
  }, [loadProfile])

  // After Stripe redirect (checkout or billing portal), webhook may lag — refetch profile a few times
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const from = params.get('from')
    if (from !== 'checkout' && from !== 'billing') return
    const id1 = window.setTimeout(() => void loadProfile(), 600)
    const id2 = window.setTimeout(() => void loadProfile(), 2000)
    const id3 = window.setTimeout(() => {
      window.history.replaceState({}, '', '/dashboard')
    }, 2100)
    return () => {
      window.clearTimeout(id1)
      window.clearTimeout(id2)
      window.clearTimeout(id3)
    }
  }, [loadProfile])

  const openBillingPortal = async () => {
    setPortalLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.message || data.error || 'Could not open billing portal')
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading || !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  const merged = profile
    ? { ...profile, email: authUser.email ?? profile.email }
    : ({ id: authUser.id, email: authUser.email } as unknown as UserRow)

  const isPremium = hasProHumanizeAccess(profile)
  const planActive = isPlanActive(merged)
  const planMeta = getPlanDetails(profile?.current_plan || 'free')

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {authUser.email}</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Current plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {isPremium ? 'Ladybug AI Pro' : planMeta?.description || 'Free'}
                  </h3>
                  {isPremium && profile?.plan_expiry && (
                    <p className="text-sm text-gray-600 mt-1">
                      Renews / access through: {formatDate(profile.plan_expiry)}
                    </p>
                  )}
                  {isPremium && profile?.subscription_cancel_at_period_end && profile?.plan_expiry && (
                    <div
                      className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                      role="status"
                    >
                      <p className="font-medium">Cancellation scheduled</p>
                      <p className="mt-1 text-amber-900/90">
                        Your subscription will end on{' '}
                        <span className="font-medium">{formatDate(profile.plan_expiry)}</span>. Until
                        then you keep full Pro access. You will not be charged again after that date.
                      </p>
                    </div>
                  )}
                  {!isPremium && (
                    <p className="text-sm text-gray-600 mt-1">
                      Upgrade for all tools, no daily limits, and up to 1,000 words per run on the
                      humanizer.
                    </p>
                  )}
                </div>
                <Badge variant={planActive && isPremium ? 'default' : 'secondary'}>
                  {isPremium ? 'Premium' : 'Free'}
                </Badge>
              </div>

              {isPremium && profile?.stripe_customer_id && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 mb-2">Manage payment method, invoices, or cancel.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={portalLoading}
                    onClick={openBillingPortal}
                    className="gap-2"
                  >
                    {portalLoading ? 'Opening…' : 'Manage subscription'}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {isPremium && !profile?.stripe_customer_id && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
                  Billing link is not attached yet. If you subscribed recently, refresh in a minute or
                  contact support.
                </p>
              )}

              {!isPremium && (
                <Link href="/pricing">
                  <Button className="w-full sm:w-auto">Upgrade to Pro</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Humanizer</CardTitle>
                <CardDescription>
                  {isPremium
                    ? 'Up to 1,000 words per run · all levels · no daily cap'
                    : 'High school level on the home page; upgrade for College & Graduate'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/">
                  <Button className="w-full" variant={isPremium ? 'default' : 'outline'}>
                    Open Humanizer
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Paraphraser</CardTitle>
                <CardDescription>Simple rewrite — Pro only</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/paraphraser">
                  <Button className="w-full" disabled={!isPremium}>
                    {isPremium ? 'Open Paraphraser' : 'Pro only'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Quote className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Citations</CardTitle>
                <CardDescription>APA & MLA — Pro only</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/citation">
                  <Button className="w-full" disabled={!isPremium}>
                    {isPremium ? 'Open Citations' : 'Pro only'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
