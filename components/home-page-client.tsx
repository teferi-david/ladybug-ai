'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Sparkles, Copy, Check, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { FREE_TIER_DAILY_HUMANIZER_LIMIT, PREMIUM_MAX_WORDS_PER_REQUEST } from '@/lib/premium-config'
import { UpgradeModal } from '@/components/upgrade-modal'
import { HumanizerHero } from '@/components/humanizer-hero'
import { HumanizerMarketing } from '@/components/humanizer-marketing'

type FreeUsage = {
  usedToday: number
  usesRemaining: number
  limit: number
}

export function HomePageClient() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [humanizeLevel, setHumanizeLevel] = useState<'highschool' | 'college' | 'graduate'>('highschool')
  const [hasProAccess, setHasProAccess] = useState(false)
  const [planLoaded, setPlanLoaded] = useState(false)
  const [freeUsage, setFreeUsage] = useState<FreeUsage | null>(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState<string | undefined>(undefined)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /** Validates session with Supabase then returns a fresh access token for API routes. */
  const getAccessTokenForApi = useCallback(async () => {
    await supabase.auth.getUser()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    let token = session?.access_token
    if (!token) {
      const { data: refreshed } = await supabase.auth.refreshSession()
      token = refreshed.session?.access_token
    }
    return token
  }, [supabase])

  const wordCount = input.trim().split(/\s+/).filter((w) => w.length > 0).length
  const maxWords = hasProAccess ? PREMIUM_MAX_WORDS_PER_REQUEST : 200
  const atDailyLimit =
    !hasProAccess && planLoaded && freeUsage !== null && freeUsage.usesRemaining === 0

  const refreshPlanAccess = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      setHasProAccess(false)
      setPlanLoaded(true)
      return
    }
    const { data: row } = await supabase
      .from('users')
      .select('current_plan, plan_expiry')
      .eq('id', session.user.id)
      .single()
    setHasProAccess(hasProHumanizeAccess(row))
    setPlanLoaded(true)
  }, [])

  /** Server is source of truth for Pro vs free (matches POST /api/humanize). */
  const refreshFreeUsage = useCallback(async () => {
    setUsageLoading(true)
    try {
      const { apiClient } = await import('@/lib/axios-client')
      const token = await getAccessTokenForApi()
      const data = await apiClient.getHumanizeUsage(token)
      if (data.premium) {
        setHasProAccess(true)
        setFreeUsage(null)
        return
      }
      setHasProAccess(false)
      if (
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
    } finally {
      setUsageLoading(false)
    }
  }, [getAccessTokenForApi])

  useEffect(() => {
    void refreshPlanAccess()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshPlanAccess().then(() => {
        void refreshFreeUsage()
      })
    })
    return () => subscription.unsubscribe()
  }, [refreshPlanAccess, refreshFreeUsage])

  useEffect(() => {
    if (!planLoaded) return
    void refreshFreeUsage()
  }, [planLoaded, refreshFreeUsage])

  useEffect(() => {
    if (!hasProAccess && (humanizeLevel === 'college' || humanizeLevel === 'graduate')) {
      setHumanizeLevel('highschool')
    }
  }, [hasProAccess, humanizeLevel])

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  const clearProgressAnimation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  const setLevel = (level: 'highschool' | 'college' | 'graduate') => {
    if ((level === 'college' || level === 'graduate') && !hasProAccess) return
    setHumanizeLevel(level)
  }

  const handleHumanize = async () => {
    if (!input.trim()) return

    setProcessing(true)
    setOutput('')
    setProgress(0)

    const minDurationMs = 2800
    const start = Date.now()

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(95, (elapsed / minDurationMs) * 95)
      setProgress(pct)
    }, 40)

    try {
      const { apiClient } = await import('@/lib/axios-client')
      const token = await getAccessTokenForApi()
      const { result, freeUsage: usageAfter } = await apiClient.humanizeText(input, humanizeLevel, token)

      const elapsed = Date.now() - start
      if (elapsed < minDurationMs) {
        await new Promise((r) => setTimeout(r, minDurationMs - elapsed))
      }

      setProgress(100)
      setOutput(result)
      if (usageAfter) {
        setFreeUsage(usageAfter)
        setHasProAccess(false)
      }
      void refreshFreeUsage()
    } catch (error) {
      console.error(error)
      const e = error as Error & {
        upgradeRequired?: boolean
        freeUsage?: FreeUsage
        status?: number
      }
      if (e.freeUsage) {
        setFreeUsage(e.freeUsage)
      }
      if (e.upgradeRequired || e.status === 403) {
        setUpgradeMessage(e.message)
        setUpgradeModalOpen(true)
        void refreshFreeUsage()
      } else {
        alert(`❌ ${e.message || 'Something went wrong'}`)
      }
    } finally {
      clearProgressAnimation()
      setProcessing(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Copy failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <HumanizerHero />
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        message={upgradeMessage}
      />
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          {!hasProAccess && planLoaded && (
            <div className="max-w-6xl mx-auto mb-6">
              {usageLoading && !freeUsage ? (
                <p className="text-center text-sm text-gray-500">Loading daily usage…</p>
              ) : freeUsage ? (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    freeUsage.usesRemaining === 0
                      ? 'border-amber-300 bg-amber-50 text-amber-950'
                      : 'border-gray-200 bg-white text-gray-800'
                  }`}
                  role="status"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">Free tier — daily humanizer</p>
                      <p className="mt-0.5 text-gray-600">
                        <span className="tabular-nums">
                          {freeUsage.usedToday} / {freeUsage.limit}
                        </span>{' '}
                        uses today
                        {freeUsage.usesRemaining > 0 ? (
                          <span className="text-gray-600">
                            {' '}
                            ·{' '}
                            <span className="font-medium text-gray-800">
                              {freeUsage.usesRemaining}
                            </span>{' '}
                            left — start a 1-day free trial for unlimited use.
                          </span>
                        ) : (
                          <span className="text-amber-900 font-medium">
                            {' '}
                            · You’ve hit today’s limit.
                          </span>
                        )}
                      </p>
                    </div>
                    {freeUsage.usesRemaining === 0 && (
                      <ProUpgradeButton asChild size="sm" className="w-full shrink-0 sm:w-auto">
                        <Link href="/pricing">Try for free</Link>
                      </ProUpgradeButton>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-xs text-gray-500">
                  Free tier: {FREE_TIER_DAILY_HUMANIZER_LIMIT} humanizer uses per day. Sign in for a
                  consistent limit across devices.
                </p>
              )}
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="h-4 w-4" />
              Ladybug AI — Humanizer
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Human-like text in one click</h1>
            <p className="text-lg text-gray-600">
              Humanizer AI for natural rewrites: paste AI-generated text on the left, and your human-style
              output appears on the right. Ladybug AI helps essays and papers read clearly.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto items-stretch">
            <Card className="border-2 border-primary/20 shadow-sm flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-500">Input</span>
                </CardTitle>
                <CardDescription>Paste your AI text below, choose a level, then humanize.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div>
                  <label className="block text-sm font-medium mb-2">Humanize level</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={humanizeLevel === 'highschool' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLevel('highschool')}
                      className="flex-1 min-w-[100px]"
                    >
                      High school
                    </Button>
                    <Button
                      type="button"
                      variant={humanizeLevel === 'college' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLevel('college')}
                      disabled={!hasProAccess}
                      className="flex-1 min-w-[100px] relative disabled:opacity-60"
                    >
                      <span className="flex items-center justify-center gap-1">
                        College
                        {!hasProAccess && <Lock className="h-3.5 w-3.5 shrink-0" />}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant={humanizeLevel === 'graduate' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLevel('graduate')}
                      disabled={!hasProAccess}
                      className="flex-1 min-w-[100px] relative disabled:opacity-60"
                    >
                      <span className="flex items-center justify-center gap-1">
                        Graduate
                        {!hasProAccess && <Lock className="h-3.5 w-3.5 shrink-0" />}
                      </span>
                    </Button>
                  </div>

                  {!hasProAccess && planLoaded && (
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                      <p className="text-xs text-gray-500 flex-1 leading-relaxed">
                        College &amp; Graduate modes and unlimited runs are on Pro. Free tier: up to 200
                        words per run; Pro (after your 1-day trial): up to {PREMIUM_MAX_WORDS_PER_REQUEST}{' '}
                        words, no daily cap — plus Paraphraser, Citations, and other tools.
                      </p>
                      <ProUpgradeButton asChild size="sm" className="w-full shrink-0 sm:w-auto">
                        <Link href="/pricing">Try for free</Link>
                      </ProUpgradeButton>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">AI text</label>
                    <span className="text-sm text-gray-500">{wordCount} words</span>
                  </div>
                  <Textarea
                    placeholder="Paste your AI-generated text here..."
                    className="min-h-[280px] flex-1 resize-y"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={processing}
                  />
                  {wordCount > maxWords && (
                    <p className="text-sm text-red-500 mt-2">
                      {hasProAccess
                        ? `Pro allows up to ${PREMIUM_MAX_WORDS_PER_REQUEST} words per run. Shorten your text.`
                        : 'Free tier is limited to 200 words. Shorten your text or start a 1-day free trial for higher limits.'}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleHumanize}
                  disabled={
                    processing || !input.trim() || wordCount > maxWords || atDailyLimit
                  }
                  className="w-full"
                  size="lg"
                >
                  {processing
                    ? 'Working…'
                    : atDailyLimit
                      ? 'Daily limit reached — try Pro free for unlimited'
                      : 'Humanize text'}
                </Button>
                {atDailyLimit && (
                  <p className="text-xs text-center text-amber-800">
                    Come back tomorrow for {FREE_TIER_DAILY_HUMANIZER_LIMIT} more free uses, or{' '}
                    <Link href="/pricing" className="underline font-medium">
                      start a 1-day free trial
                    </Link>{' '}
                    for unlimited humanizer and all Pro tools.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 shadow-sm flex flex-col min-h-[420px]">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-500">Human-like output</CardTitle>
                <CardDescription>Review and copy when ready.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                {processing && (
                  <div className="space-y-3 py-2">
                    <p className="text-sm font-medium text-center text-gray-800">
                      Bypassing Turnitin and GPT Zero
                    </p>
                    <Progress value={progress} className="h-3" />
                    <p className="text-xs text-center text-gray-500">
                      Refining tone and phrasing…
                    </p>
                  </div>
                )}

                {!processing && !output && (
                  <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center text-gray-500 text-sm">
                    Humanized text will show here after you run the tool.
                  </div>
                )}

                {!processing && output && (
                  <>
                    <div className="flex-1 min-h-[200px] p-4 bg-gray-50 rounded-lg border text-sm whitespace-pre-wrap overflow-y-auto max-h-[min(420px,50vh)]">
                      {output}
                    </div>
                    <Button
                      type="button"
                      onClick={copyToClipboard}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy human text
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <HumanizerMarketing />
    </div>
  )
}
