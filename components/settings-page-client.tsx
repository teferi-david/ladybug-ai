'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import { Badge } from '@/components/ui/badge'
import { Zap, ExternalLink, LogOut } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { isPlanActive } from '@/lib/user-plans'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import {
  BASIC_YEARLY_WORD_CAP,
  getPlanDisplayName,
  isBasicPlanKey,
} from '@/lib/stripe-plans'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

export function SettingsPageClient() {
  const router = useRouter()
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [signupWelcomeOpen, setSignupWelcomeOpen] = useState(false)
  const [signupBonusWords, setSignupBonusWords] = useState(0)
  const signupWelcomeHandled = useRef(false)

  const loadProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }
    setAuthUser(session.user)

    if (session.access_token) {
      try {
        const signupRes = await fetch('/api/auth/complete-signup', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (signupRes.ok) {
          const signupData = (await signupRes.json()) as {
            isNewProfile?: boolean
            signupBonusWords?: number
          }
          if (
            signupData.isNewProfile &&
            (signupData.signupBonusWords ?? 0) > 0 &&
            !signupWelcomeHandled.current
          ) {
            signupWelcomeHandled.current = true
            setSignupBonusWords(signupData.signupBonusWords ?? 0)
            setSignupWelcomeOpen(true)
          }
        }
      } catch {
        /* non-blocking */
      }
    }

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

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
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <>
      <Dialog open={signupWelcomeOpen} onOpenChange={setSignupWelcomeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to Ladybug AI</DialogTitle>
            <DialogDescription className="text-base text-gray-700 dark:text-zinc-300">
              You have <strong>400 coins</strong> to start (1 coin = 1 word across Humanizer, Paraphraser, and
              Citations). Open any tool to begin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" className="w-full sm:w-auto" onClick={() => setSignupWelcomeOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-full bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold dark:text-zinc-100">Settings</h1>
              <p className="text-gray-600 dark:text-zinc-400">Account, plan, and billing ({authUser.email})</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 gap-2 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
              onClick={() => void handleSignOut()}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </Button>
          </div>

          <Card className="mb-6 dark:border-zinc-800 dark:bg-zinc-950/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-zinc-100">
                <Zap className="h-5 w-5" />
                Current plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold dark:text-zinc-100">
                    {isPremium ? getPlanDisplayName(profile?.current_plan) : 'Free'}
                  </h3>
                  {!isPremium && profile && typeof profile.coin_balance === 'number' && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
                      Coins remaining:{' '}
                      <span className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
                        {profile.coin_balance.toLocaleString()}
                      </span>{' '}
                      <span className="text-gray-500 dark:text-zinc-500">(1 coin = 1 word)</span>
                    </p>
                  )}
                  {isPremium && profile && isBasicPlanKey(profile.current_plan) && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
                      Words used this year:{' '}
                      <span className="font-medium tabular-nums">
                        {(profile.basic_words_yearly_used ?? 0).toLocaleString()} /{' '}
                        {BASIC_YEARLY_WORD_CAP.toLocaleString()}
                      </span>
                    </p>
                  )}
                  {isPremium && profile?.plan_expiry && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
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
                  <p className="mb-2 text-sm text-gray-600 dark:text-zinc-400">
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
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                  Billing link is not attached yet. If you subscribed recently, refresh in a minute or
                  contact support.
                </p>
              )}

              {!isPremium && (
                <div className="mt-2 space-y-6 border-t border-gray-100 pt-8 dark:border-zinc-800">
                  <p className="max-w-prose text-sm leading-relaxed tracking-tight text-gray-600 dark:text-zinc-300">
                    Start your 1 day Trial for unlimited AI Humanizer, Paraphraser, Citations, and higher word
                    limits. Checkout shows the amount before you pay. After that you are billed on the plan you
                    choose if you stay subscribed.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <ProUpgradeButton asChild className="w-full sm:w-auto sm:min-w-[220px]">
                      <Link href="/pricing">Start trial</Link>
                    </ProUpgradeButton>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  )
}
