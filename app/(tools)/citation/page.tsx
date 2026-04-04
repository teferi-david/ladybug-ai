'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { PREMIUM_MAX_WORDS_PER_REQUEST } from '@/lib/premium-config'
import { Button } from '@/components/ui/button'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/loading-spinner'
import { broadcastCoinBalanceUpdated } from '@/lib/coin-balance-sync'
import { recordToolVisit } from '@/lib/dashboard-recents'
import { loadCitationDraft, saveCitationDraft } from '@/lib/tool-drafts'
import { Quote, Copy } from 'lucide-react'

function countWordsFromForm(d: Record<string, string>): number {
  let n = 0
  for (const v of Object.values(d)) {
    if (typeof v === 'string' && v.trim()) {
      n += v.trim().split(/\s+/).filter((w) => w.length > 0).length
    }
  }
  return n
}

export default function CitationPage() {
  const [loading, setLoading] = useState(true)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [premium, setPremium] = useState(false)
  const [planLoaded, setPlanLoaded] = useState(false)
  const [coinsRemaining, setCoinsRemaining] = useState<number | null>(null)
  const [citationType, setCitationType] = useState<'apa' | 'mla'>('apa')
  const [formData, setFormData] = useState({
    author: '',
    title: '',
    year: '',
    publisher: '',
    url: '',
    accessDate: '',
  })
  const [output, setOutput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [draftHydrated, setDraftHydrated] = useState(false)

  const wordCount = useMemo(() => countWordsFromForm(formData), [formData])
  const maxWords = premium
    ? PREMIUM_MAX_WORDS_PER_REQUEST
    : coinsRemaining === null
      ? PREMIUM_MAX_WORDS_PER_REQUEST
      : Math.min(PREMIUM_MAX_WORDS_PER_REQUEST, coinsRemaining)
  const coinsInsufficient =
    !premium && planLoaded && coinsRemaining !== null && wordCount > coinsRemaining
  const overWordLimit = !premium && wordCount > maxWords

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
      const data = await apiClient.getCitationUsage(session.access_token)
      if (data.premium) {
        setCoinsRemaining(null)
      } else if (typeof data.coinsRemaining === 'number') {
        setCoinsRemaining(data.coinsRemaining)
        broadcastCoinBalanceUpdated(data.coinsRemaining)
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

  useEffect(() => {
    if (!signedIn) {
      setDraftHydrated(false)
      return
    }
    recordToolVisit('/citation', 'Citations')
    const d = loadCitationDraft()
    if (d) {
      setCitationType(d.citationType)
      setFormData(d.formData)
      setOutput(d.output)
    }
    setDraftHydrated(true)
  }, [signedIn])

  useEffect(() => {
    if (!signedIn || !draftHydrated) return
    const id = window.setTimeout(() => {
      saveCitationDraft({ citationType, formData, output })
    }, 450)
    return () => window.clearTimeout(id)
  }, [signedIn, draftHydrated, citationType, formData, output])

  const handleGenerate = async () => {
    setProcessing(true)
    setOutput('')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return

      const response = await fetch('/api/citation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: citationType,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || data.error || 'Error')
        if (typeof data.coinsRemaining === 'number') {
          setCoinsRemaining(data.coinsRemaining)
          broadcastCoinBalanceUpdated(data.coinsRemaining)
        }
        return
      }

      setOutput(data.result)
      if (typeof data.coinsRemaining === 'number') {
        setCoinsRemaining(data.coinsRemaining)
        broadcastCoinBalanceUpdated(data.coinsRemaining)
      }
    } catch {
      alert('Request failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading || signedIn === null) {
    return <LoadingSpinner />
  }

  if (!signedIn) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 md:py-16">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Quote className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Citation tool</h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-zinc-300">
            Example APA-style line below. Sign up or log in to generate citations from your own source details.
          </p>
        </div>

        <div className="mb-10 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-6 text-left dark:border-violet-900/40 dark:from-zinc-900 dark:to-zinc-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
            Sample output (APA)
          </p>
          <p className="mt-3 font-mono text-sm leading-relaxed text-gray-800 dark:text-zinc-200">
            Martinez, L. R. (2023). <em>Writing with clarity: A student guide</em>. Harbor Press.
          </p>
        </div>

        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <ProUpgradeButton asChild className="min-h-11 min-w-[200px]">
            <Link href="/register?next=%2Fcitation">Sign up to use</Link>
          </ProUpgradeButton>
          <Button variant="outline" asChild className="min-h-11 min-w-[200px]">
            <Link href="/login?next=%2Fcitation">Log in</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
          <Quote className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Citations</h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            {premium
              ? `APA or MLA · up to ${PREMIUM_MAX_WORDS_PER_REQUEST} words in fields per run`
              : `Free · 1 coin per word in fields · shared balance with other tools`}
          </p>
        </div>
      </div>

      {!premium && coinsRemaining !== null && (
        <p className="mb-4 text-sm text-gray-600 dark:text-zinc-400">
          Coins remaining:{' '}
          <span className="font-medium tabular-nums text-gray-900 dark:text-zinc-100">{coinsRemaining}</span>
        </p>
      )}

      <Card className="mb-6 dark:border-zinc-800 dark:bg-zinc-950/40">
        <CardHeader>
          <CardTitle>Format</CardTitle>
          <CardDescription>Fill what you know. Blank fields are fine if you are not sure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={citationType === 'apa' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setCitationType('apa')}
            >
              APA
            </Button>
            <Button
              type="button"
              variant={citationType === 'mla' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setCitationType('mla')}
            >
              MLA
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              placeholder="e.g. Smith, J."
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Article or book title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                placeholder="2024"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => handleInputChange('publisher', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://…"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accessDate">Access date (optional)</Label>
            <Input
              id="accessDate"
              placeholder="Mar 30, 2026"
              value={formData.accessDate}
              onChange={(e) => handleInputChange('accessDate', e.target.value)}
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Words in fields: {wordCount} / {maxWords}
            {!premium && overWordLimit && (
              <span className="text-red-600 dark:text-red-400">. Shorten fields to stay inside the free tier cap.</span>
            )}
          </p>

          <Button
            onClick={handleGenerate}
            disabled={
              processing || coinsInsufficient || (!premium && overWordLimit)
            }
            className="w-full"
          >
            {processing ? 'Generating…' : coinsInsufficient ? 'Not enough coins' : 'Generate citation'}
          </Button>

          {!premium && planLoaded && coinsInsufficient && (
            <p className="text-center text-xs text-amber-800 dark:text-amber-200/90">
              <Link href="/pricing" className="font-medium underline">
                Upgrade to Pro
              </Link>{' '}
              for unlimited words, or shorten your fields.
            </p>
          )}

        </CardContent>
      </Card>

      {processing && (
        <div className="flex justify-center py-6">
          <LoadingSpinner />
        </div>
      )}

      {output && !processing && (
        <Card className="dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="uppercase">{citationType}</CardTitle>
            <CardDescription>Copy the line below</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-gray-50 p-4 text-sm whitespace-pre-wrap text-foreground dark:bg-zinc-900 dark:text-zinc-100">
              {output}
            </div>
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => void navigator.clipboard.writeText(output)}
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
