'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { PREMIUM_MAX_WORDS_PER_REQUEST } from '@/lib/premium-config'
import { Button } from '@/components/ui/button'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/loading-spinner'
import { RefreshCw, Copy } from 'lucide-react'

export default function ParaphraserPage() {
  const [loading, setLoading] = useState(true)
  /** null = still checking session */
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [premium, setPremium] = useState(false)
  const [planLoaded, setPlanLoaded] = useState(false)
  const [coinsRemaining, setCoinsRemaining] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [processing, setProcessing] = useState(false)

  const wordCount = input.trim().split(/\s+/).filter((w) => w.length > 0).length
  const maxWords = premium
    ? PREMIUM_MAX_WORDS_PER_REQUEST
    : coinsRemaining === null
      ? PREMIUM_MAX_WORDS_PER_REQUEST
      : Math.min(PREMIUM_MAX_WORDS_PER_REQUEST, coinsRemaining)

  const coinsInsufficient =
    !premium && planLoaded && coinsRemaining !== null && wordCount > coinsRemaining

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
        setCoinsRemaining(null)
      } else if (typeof data.coinsRemaining === 'number') {
        setCoinsRemaining(data.coinsRemaining)
      } else {
        setCoinsRemaining(null)
      }
    } catch {
      setCoinsRemaining(null)
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
        if (typeof data.coinsRemaining === 'number') {
          setCoinsRemaining(data.coinsRemaining)
        }
        return
      }

      setOutput(data.result)
      if (typeof data.coinsRemaining === 'number') {
        setCoinsRemaining(data.coinsRemaining)
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
          <h1 className="text-2xl font-bold tracking-tight dark:text-zinc-100">Paraphraser</h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-zinc-400">
            Example below. Sign up or log in to paraphrase your own text. Free accounts share one coin balance (1
            coin = 1 word) across tools.
          </p>
        </div>

        <div className="mb-10 grid gap-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-4 dark:border-violet-900/40 dark:from-violet-950/40 dark:to-zinc-950 md:grid-cols-2 md:p-6">
          <div className="rounded-xl border border-gray-200 bg-white/90 p-4 text-left dark:border-zinc-700 dark:bg-zinc-900/80">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-500">Original</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-zinc-200">
              The implementation of the proposed methodology would necessitate a comprehensive evaluation of the
              underlying variables in order to ascertain optimal outcomes.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white/90 p-4 text-left dark:border-emerald-900/40 dark:bg-zinc-900/80">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Paraphrased</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-zinc-200">
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
          <h1 className="text-2xl font-bold dark:text-zinc-100">Paraphraser</h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            {premium
              ? `Paste text · up to ${PREMIUM_MAX_WORDS_PER_REQUEST} words per run`
              : `Free · 1 coin per word · shared balance with Humanizer & Citations`}
          </p>
        </div>
      </div>

      {!premium && coinsRemaining !== null && (
        <p className="mb-4 text-sm text-gray-600 dark:text-zinc-400">
          Coins remaining:{' '}
          <span className="font-medium tabular-nums text-gray-900 dark:text-zinc-100">{coinsRemaining}</span>
        </p>
      )}

      <Card className="dark:border-zinc-800 dark:bg-zinc-950/40">
        <CardHeader>
          <CardTitle className="dark:text-zinc-100">Your text</CardTitle>
          <CardDescription className="dark:text-zinc-500">We will rephrase it while keeping your meaning.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste here…"
            className="min-h-[200px] dark:border-zinc-700 dark:bg-zinc-950"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={processing}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-zinc-500">
            <span>
              {wordCount} / {maxWords} words
            </span>
            <Button
              onClick={handleParaphrase}
              disabled={processing || !input.trim() || wordCount > maxWords || coinsInsufficient}
            >
              {processing ? 'Working…' : coinsInsufficient ? 'Not enough coins' : 'Paraphrase'}
            </Button>
          </div>

          {!premium && planLoaded && coinsInsufficient && (
            <p className="text-center text-xs text-amber-800 dark:text-amber-200/90">
              <Link href="/pricing" className="font-medium underline">
                Upgrade to Pro
              </Link>{' '}
              for unlimited words, or shorten your text.
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
        <Card className="mt-6 dark:border-zinc-800 dark:bg-zinc-950/40">
          <CardHeader>
            <CardTitle className="dark:text-zinc-100">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-gray-50 p-4 text-sm whitespace-pre-wrap dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100">
              {output}
            </div>
            <Button
              variant="outline"
              className="mt-4 gap-2 dark:border-zinc-600"
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
