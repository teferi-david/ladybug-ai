'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { PREMIUM_MAX_WORDS_PER_REQUEST, FREE_TIER_MAX_WORDS_PER_RUN } from '@/lib/premium-config'
import { Button } from '@/components/ui/button'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Quote, Copy } from 'lucide-react'

type FreeUsage = {
  usedToday: number
  usesRemaining: number
  limit: number
}

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
  const [freeUsage, setFreeUsage] = useState<FreeUsage | null>(null)
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

  const wordCount = useMemo(() => countWordsFromForm(formData), [formData])
  const maxWords = premium ? PREMIUM_MAX_WORDS_PER_REQUEST : FREE_TIER_MAX_WORDS_PER_RUN
  const atDailyLimit =
    !premium && planLoaded && freeUsage !== null && freeUsage.usesRemaining === 0
  const overWordLimit = !premium && wordCount > FREE_TIER_MAX_WORDS_PER_RUN

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
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <Quote className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Citation tool</h1>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-gray-600">
          Sign up or log in to generate APA &amp; MLA citations on the free tier — fair daily limits and the
          same signup bonus rules as the AI Humanizer. Pro unlocks higher field limits and unlimited use.
        </p>
        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <ProUpgradeButton asChild className="min-h-11 min-w-[200px]">
            <Link href="/register">Sign up</Link>
          </ProUpgradeButton>
          <Button variant="outline" asChild className="min-h-11 min-w-[200px]">
            <Link href="/login">Log in</Link>
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
          <h1 className="text-2xl font-bold">Citations</h1>
          <p className="text-sm text-gray-600">
            {premium
              ? `APA or MLA · up to ${PREMIUM_MAX_WORDS_PER_REQUEST} words in fields per run`
              : `Free tier · up to ${FREE_TIER_MAX_WORDS_PER_RUN} words in your fields per run · fair daily limits`}
          </p>
        </div>
      </div>

      {!premium && freeUsage !== null && (
        <p className="mb-4 text-sm text-gray-600">
          Citation runs remaining today:{' '}
          <span className="font-medium tabular-nums text-gray-900">{freeUsage.usesRemaining}</span>
          <span className="text-gray-500"> (daily cap + signup bonus, same rules as Humanizer)</span>
        </p>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Format</CardTitle>
          <CardDescription>Fill what you know — leave blanks if unsure</CardDescription>
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

          <p className="text-xs text-gray-500">
            Words in fields: {wordCount} / {maxWords}
            {!premium && overWordLimit && (
              <span className="text-red-600"> — shorten fields for free tier</span>
            )}
          </p>

          <Button
            onClick={handleGenerate}
            disabled={
              processing || atDailyLimit || (!premium && overWordLimit)
            }
            className="w-full"
          >
            {processing ? 'Generating…' : atDailyLimit ? 'Daily limit reached' : 'Generate citation'}
          </Button>

          {!premium && planLoaded && atDailyLimit && (
            <p className="text-center text-xs text-amber-800">
              <Link href="/pricing" className="font-medium underline">
                Start for free
              </Link>{' '}
              for unlimited citations and higher field limits.
            </p>
          )}

          {!premium && planLoaded && !atDailyLimit && (
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex-1 text-xs leading-relaxed text-gray-500">
                Pro unlocks up to {PREMIUM_MAX_WORDS_PER_REQUEST} words in fields per run.
              </p>
              <ProUpgradeButton asChild size="sm" className="w-full shrink-0 sm:w-auto">
                <Link href="/pricing">Start for free</Link>
              </ProUpgradeButton>
            </div>
          )}
        </CardContent>
      </Card>

      {processing && (
        <div className="flex justify-center py-6">
          <LoadingSpinner />
        </div>
      )}

      {output && !processing && (
        <Card>
          <CardHeader>
            <CardTitle className="uppercase">{citationType}</CardTitle>
            <CardDescription>Copy the line below</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-gray-50 p-4 text-sm whitespace-pre-wrap">{output}</div>
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
