'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { PREMIUM_MAX_WORDS_PER_REQUEST } from '@/lib/premium-config'
import { UpgradeModal } from '@/components/upgrade-modal'
import { LandingHero } from '@/components/landing-hero'
import { PricingTeaser } from '@/components/pricing-teaser'
import { HumanizerDetectorLogos } from '@/components/humanizer-detector-logos'
import { HumanizerDetectorResults } from '@/components/humanizer-detector-results'
import { JoinStudentsVideoSection } from '@/components/join-students-video-section'
import { HumanizerMarketing } from '@/components/humanizer-marketing'
import type { HumanizeLevel } from '@/lib/humanize-levels'
import { cn } from '@/lib/utils'

type FreeUsage = {
  usedToday: number
  usesRemaining: number
  limit: number
}

const HUMANIZE_LOADING_MESSAGES = [
  'Bypassing Turnitin',
  'Bypassing GPTZero',
  'Bypassing All AI Detectors',
] as const

export function HomePageClient() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [humanizeLevel, setHumanizeLevel] = useState<HumanizeLevel>('basic')
  const [hasProAccess, setHasProAccess] = useState(false)
  const [planLoaded, setPlanLoaded] = useState(false)
  const [freeUsage, setFreeUsage] = useState<FreeUsage | null>(null)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState<string | undefined>(undefined)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const loadingMsgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [loadingPhase, setLoadingPhase] = useState(0)

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
      .select('current_plan, plan_expiry, subscription_status, uses_left')
      .eq('id', session.user.id)
      .single()
    setHasProAccess(hasProHumanizeAccess(row))
    setPlanLoaded(true)
  }, [])

  /** Server is source of truth for Pro vs free (matches POST /api/humanize). */
  const refreshFreeUsage = useCallback(async () => {
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
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      if (loadingMsgIntervalRef.current) clearInterval(loadingMsgIntervalRef.current)
    }
  }, [])

  const clearProgressAnimation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  const clearLoadingMessageInterval = () => {
    if (loadingMsgIntervalRef.current) {
      clearInterval(loadingMsgIntervalRef.current)
      loadingMsgIntervalRef.current = null
    }
  }

  const handleHumanize = async () => {
    if (!input.trim()) return

    setProcessing(true)
    setOutput('')
    setProgress(0)
    setLoadingPhase(0)
    clearLoadingMessageInterval()
    loadingMsgIntervalRef.current = setInterval(() => {
      setLoadingPhase((p) => (p + 1) % HUMANIZE_LOADING_MESSAGES.length)
    }, 1600)

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
      clearLoadingMessageInterval()
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
    <div className="min-h-screen">
      <LandingHero />
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        message={upgradeMessage}
      />
      <section id="humanizer-tool" className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto mb-8 max-w-2xl text-center"
          >
            <h2 className="text-lg font-bold tracking-tight text-gray-900 md:text-xl">
              Humanize your text
            </h2>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              Paste a draft, pick a mode, and run the humanizer. Free tier includes daily limits.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-6xl items-stretch gap-6 lg:grid-cols-2">
            <Card className="liquid-glass-bubble flex flex-col border-2 border-primary/25 shadow-lg shadow-rose-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-500">Input</span>
                </CardTitle>
                <CardDescription>Pick a level, drop in your text, hit humanize.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <label htmlFor="humanize-level" className="block text-sm font-medium">
                      Humanize level
                    </label>
                    <select
                      id="humanize-level"
                      value={humanizeLevel}
                      onChange={(e) => setHumanizeLevel(e.target.value as HumanizeLevel)}
                      disabled={processing}
                      className={cn(
                        'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-50'
                      )}
                    >
                      <option value="basic">Basic</option>
                      <option value="advanced">Advanced</option>
                      <option value="academic">Academic (Turnitin)</option>
                    </select>
                  </div>
                  <Button
                    type="button"
                    onClick={handleHumanize}
                    disabled={
                      processing || !input.trim() || wordCount > maxWords || atDailyLimit
                    }
                    className="h-11 w-full shrink-0 sm:w-auto sm:min-w-[168px]"
                    size="lg"
                  >
                    {processing
                      ? 'Working…'
                      : atDailyLimit
                        ? 'Limit reached, try a plan for free'
                        : 'Humanize text'}
                  </Button>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">AI text</label>
                    <span className="text-sm text-gray-500">{wordCount} words</span>
                  </div>
                  <Textarea
                    placeholder="Paste the AI text you want to fix..."
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
                {atDailyLimit && (
                  <p className="text-xs text-center text-amber-800">
                    <Link href="/pricing" className="underline font-medium">
                      Try a plan for free
                    </Link>{' '}
                    to keep using the humanizer and all tools.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="liquid-glass-bubble flex min-h-[420px] flex-col border-2 border-white/50 shadow-lg shadow-rose-950/10">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-500">Human-like output</CardTitle>
                <CardDescription>Read it, tweak it, copy when you are happy.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                {processing && (
                  <div className="space-y-4 py-2">
                    <p
                      key={loadingPhase}
                      className="text-sm font-semibold text-center text-gray-900 min-h-[1.35rem]"
                    >
                      {HUMANIZE_LOADING_MESSAGES[loadingPhase]}
                    </p>
                    <div
                      className="rounded-full p-[3px] animate-[pulse_1.4s_ease-in-out_infinite] shadow-[0_0_22px_rgba(59,130,246,0.55)] ring-2 ring-primary/35 bg-gradient-to-r from-primary/25 via-amber-300/20 to-primary/25"
                    >
                      <Progress value={progress} className="h-3 rounded-full bg-secondary/90" />
                    </div>
                    <p className="text-xs text-center text-gray-500">Refining tone and phrasing…</p>
                  </div>
                )}

                {!processing && !output && (
                  <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center text-gray-500 text-sm">
                    Your humanized text lands here after you run the tool.
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
      <PricingTeaser />
      <JoinStudentsVideoSection />
      <div className="border-b border-white/30 bg-white/25 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <HumanizerDetectorLogos />
        </div>
      </div>
      <HumanizerDetectorResults />
      <HumanizerMarketing />
    </div>
  )
}
