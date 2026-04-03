'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { PREMIUM_MAX_WORDS_PER_REQUEST, FREE_TIER_MAX_WORDS_PER_RUN } from '@/lib/premium-config'
import { Button } from '@/components/ui/button'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/loading-spinner'
import { RefreshCw, Copy } from 'lucide-react'

type FreeUsage = {
  usedToday: number
  usesRemaining: number
  limit: number
}

export default function ParaphraserPage() {
  const [loading, setLoading] = useState(true)
  /** null = still checking session */
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [premium, setPremium] = useState(false)
  const [planLoaded, setPlanLoaded] = useState(false)
  const [freeUsage, setFreeUsage] = useState<FreeUsage | null>(null)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [processing, setProcessing] = useState(false)

  const wordCount = input.trim().split(/\s+/).filter((w) => w.length > 0).length
  const maxWords = premium ? PREMIUM_MAX_WORDS_PER_REQUEST : FREE_TIER_MAX_WORDS_PER_RUN
  const atDailyLimit =
    !premium && planLoaded && freeUsage !== null && freeUsage.usesRemaining === 0

  const load = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      setSignedIn(false)
      setLoading(false)
      return
    }
    setSignedIn(true)

    const { data: row } = await supabase
      .from('users')
      .select('current_plan, plan_expiry, subscription_status, uses_left')
      .eq('id', session.user.id)
      .single()
    setPremium(hasProHumanizeAccess(row))
    setPlanLoaded(true)

    try {
      const { apiClient } = await import('@/lib/axios-client')
      const data = await apiClient.getParaphraseUsage(session.access_token)
      if (data.premium) {
        setFreeUsage(null)
      } else if (
        typeof data.limit === 'number' &&
        typeof data.usedToday === 'number' &&
        typeof data.usesRemaining === 'number'
      ) {
        setFreeUsage({
          limit: data.limit,
          usedToday: data.usedToday,
          usesRemaining: data.usesRemaining,
        })
      } else {
        setFreeUsage(null)
      }
    } catch {
      setFreeUsage(null)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load()
    })
    return () => subscription.unsubscribe()
  }, [load])

  const handleParaphrase = async () => {
    if (!input.trim() || wordCount > maxWords) return

    setProcessing(true)
    setOutput('')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return

      const response = await fetch('/api/paraphrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: input }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || data.error || 'Something went wrong')
        if (data.freeUsage) {
          setFreeUsage({
            usedToday: data.freeUsage.usedToday,
            usesRemaining: data.freeUsage.usesRemaining,
            limit: data.freeUsage.limit,
          })
        }
        return
      }

      setOutput(data.result)
      if (data.freeUsage) {
        setFreeUsage({
          usedToday: data.freeUsage.usedToday,
          usesRemaining: data.freeUsage.usesRemaining,
          limit: data.freeUsage.limit,
        })
      }
    } catch {
      alert('Request failed. Try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading || signedIn === null) {
    return <LoadingSpinner />
  }

  if (!signedIn) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <RefreshCw className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Paraphraser</h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Example below. Sign up or log in to paraphrase your own text on the free tier (same fair limits as
            the Humanizer).
          </p>
        </div>

        <div className="mb-10 grid gap-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-4 md:grid-cols-2 md:p-6">
          <div className="rounded-xl border border-gray-200 bg-white/90 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Original</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-800">
              The implementation of the proposed methodology would necessitate a comprehensive evaluation of the
              underlying variables in order to ascertain optimal outcomes.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white/90 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Paraphrased</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-800">
              Putting this approach into practice means we need to look closely at the main factors involved so we
              can get the best results.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <ProUpgradeButton asChild className="min-h-11 min-w-[200px]">
            <Link href="/register?next=%2Fparaphraser">Sign up to use</Link>
          </ProUpgradeButton>
          <Button variant="outline" asChild className="min-h-11 min-w-[200px]">
            <Link href="/login?next=%2Fparaphraser">Log in</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
          <RefreshCw className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Paraphraser</h1>
          <p className="text-sm text-gray-600">
            {premium
              ? `Paste text · up to ${PREMIUM_MAX_WORDS_PER_REQUEST} words per run`
              : `Free tier · up to ${FREE_TIER_MAX_WORDS_PER_RUN} words per run · fair daily limits (same as Humanizer)`}
          </p>
        </div>
      </div>

      {!premium && freeUsage !== null && (
        <p className="mb-4 text-sm text-gray-600">
          Paraphrase runs remaining today:{' '}
          <span className="font-medium tabular-nums text-gray-900">{freeUsage.usesRemaining}</span>
          <span className="text-gray-500"> (daily cap + signup bonus, same rules as Humanizer)</span>
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your text</CardTitle>
          <CardDescription>We will rephrase it while keeping your meaning.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste here…"
            className="min-h-[200px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={processing}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
            <span>
              {wordCount} / {maxWords} words
            </span>
            <Button
              onClick={handleParaphrase}
              disabled={processing || !input.trim() || wordCount > maxWords || atDailyLimit}
            >
              {processing ? 'Working…' : atDailyLimit ? 'Daily limit reached' : 'Paraphrase'}
            </Button>
          </div>

          {!premium && planLoaded && atDailyLimit && (
            <p className="text-center text-xs text-amber-800">
              <Link href="/pricing" className="font-medium underline">
                Start for free
              </Link>{' '}
              for unlimited paraphrasing and higher per-run limits.
            </p>
          )}

        </CardContent>
      </Card>

      {processing && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {output && !processing && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-gray-50 p-4 text-sm whitespace-pre-wrap">{output}</div>
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => {
                void navigator.clipboard.writeText(output)
              }}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
