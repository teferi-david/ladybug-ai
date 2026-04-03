'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/loading-spinner'
import { BookOpen, Quote, RefreshCw, Sparkles, Wand2 } from 'lucide-react'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import { cn } from '@/lib/utils'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

const tools = [
  {
    href: '/humanizer',
    label: 'Humanizer',
    description: 'Natural rewrites for AI drafts',
    icon: Sparkles,
    badge: 'Popular',
    badgeClass: 'bg-violet-100 text-violet-800',
  },
  {
    href: '/paraphraser',
    label: 'Paraphraser',
    description: 'Rephrase with clarity',
    icon: RefreshCw,
  },
  {
    href: '/citation',
    label: 'Citations',
    description: 'APA & MLA',
    icon: Quote,
  },
  {
    href: '/bypass-turnitin',
    label: 'Turnitin guide',
    description: 'Detection & integrity',
    icon: BookOpen,
  },
  {
    href: '/ai-humanizer',
    label: 'Blog',
    description: 'Tips & guides',
    icon: Wand2,
    badge: 'Read',
    badgeClass: 'bg-slate-100 text-slate-700',
  },
] as const

export function DashboardPageClient() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [coins, setCoins] = useState<number | null>(null)
  const [premium, setPremium] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (!session?.user) {
        router.replace('/login?next=/dashboard')
        return
      }
      setEmail(session.user.email ?? null)
      const { data: row } = await supabase
        .from('users')
        .select('current_plan, plan_expiry, subscription_status, uses_left, coin_balance')
        .eq('id', session.user.id)
        .single()
      const profile = row as UserRow | null
      const isPro = profile ? hasProHumanizeAccess(profile) : false
      setPremium(isPro)
      if (!isPro && profile && typeof profile.coin_balance === 'number') {
        setCoins(profile.coin_balance)
      } else {
        setCoins(null)
      }
      setReady(true)
    })()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace('/login?next=/dashboard')
      }
    })
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [router])

  if (!ready) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen px-4 py-10 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-zinc-100">
              Let&apos;s make today productive!
            </h1>
            {email && (
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-500">
                Signed in as <span className="text-gray-700 dark:text-zinc-300">{email}</span>
              </p>
            )}
            {!premium && coins !== null && (
              <p className="mt-2 text-sm font-medium text-violet-800 dark:text-violet-300">
                Coins: {coins.toLocaleString()} <span className="font-normal text-gray-600 dark:text-zinc-500">(1 per word)</span>
              </p>
            )}
          </div>
          <ProUpgradeButton asChild className="shrink-0 rounded-full">
            <Link href="/pricing">Upgrade now</Link>
          </ProUpgradeButton>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => {
            const Icon = t.icon
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  'group relative flex flex-col rounded-2xl border border-violet-100/80 bg-gradient-to-br from-white to-violet-50/40 p-5 shadow-sm transition',
                  'hover:border-violet-200 hover:shadow-md dark:border-zinc-800 dark:from-zinc-950 dark:to-violet-950/30 dark:hover:border-violet-800'
                )}
              >
                <div className="mb-4 flex items-start justify-between gap-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  {'badge' in t && t.badge && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        t.badgeClass
                      )}
                    >
                      {t.badge}
                    </span>
                  )}
                </div>
                <p className="text-lg font-semibold text-gray-900">{t.label}</p>
                <p className="mt-1 text-sm text-gray-600">{t.description}</p>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-sm text-gray-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-500">
          <p className="font-medium text-gray-700 dark:text-zinc-300">Recents</p>
          <p className="mt-2">Your recent work will appear here in a future update.</p>
        </div>
      </div>
    </div>
  )
}
