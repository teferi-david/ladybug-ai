'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import { Badge } from '@/components/ui/badge'
import { Zap, ExternalLink } from 'lucide-react'
import { getPlanDetails, isPlanActive } from '@/lib/user-plans'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

export function SettingsPageClient() {
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

    const { data, error } = await supabase.from('users').select('*').eq('id', session.user.id).single()

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const from = params.get('from')
    if (from !== 'checkout' && from !== 'billing') return
    const id1 = window.setTimeout(() => void loadProfile(), 600)
    const id2 = window.setTimeout(() => void loadProfile(), 2000)
    const id3 = window.setTimeout(() => {
      window.history.replaceState({}, '', '/settings')
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
        await loadProfile()
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
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
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
    <div className="min-h-full bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Settings</h1>
            <p className="text-gray-600">Account, plan, and billing — {authUser.email}</p>
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
                    <p className="mt-1 text-sm text-gray-600">
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
                </div>
                <Badge variant={planActive && isPremium ? 'default' : 'secondary'}>
                  {isPremium ? 'Premium' : 'Free'}
                </Badge>
              </div>

              {isPremium && profile?.stripe_customer_id && (
                <div className="border-t pt-2">
                  <p className="mb-2 text-sm text-gray-600">
                    Manage payment method, invoices, or cancel.
                  </p>
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
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Billing link is not attached yet. If you subscribed recently, refresh in a minute or
                  contact support.
                </p>
              )}

              {!isPremium && (
                <div className="mt-2 space-y-6 border-t border-gray-100 pt-8">
                  <p className="max-w-prose text-sm leading-relaxed tracking-tight text-gray-600">
                    Start a 1-day free trial for unlimited AI Humanizer, Paraphraser, Citations, and higher
                    word limits — then billed annually if you continue.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <ProUpgradeButton asChild className="w-full sm:w-auto sm:min-w-[220px]">
                      <Link href="/pricing">Try for free</Link>
                    </ProUpgradeButton>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
