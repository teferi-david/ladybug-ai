'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Copy, Check, Dna } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { PREMIUM_MAX_WORDS_PER_REQUEST } from '@/lib/premium-config'
import { UpgradeModal } from '@/components/upgrade-modal'
import type { HumanizeLevel } from '@/lib/humanize-levels'
import { cn } from '@/lib/utils'
import {
  HUMANIZE_PRIORITIES,
  type HumanizePriority,
  getStoredPriority,
  getStoredWritingDna,
  setStoredPriority,
} from '@/lib/humanizer-priority'
import { WritingDnaModal } from '@/components/writing-dna-modal'

const HUMANIZE_LOADING_MESSAGES = [
  'Refining phrasing and tone',
  'Improving natural flow',
  'Preparing your humanized text',
] as const

export function HumanizerWorkspace() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [humanizeLevel, setHumanizeLevel] = useState<HumanizeLevel>('basic')
  const [priority, setPriority] = useState<HumanizePriority>('balanced')
  const [dnaSamples, setDnaSamples] = useState<string[]>([])
  const [dnaOpen, setDnaOpen] = useState(false)
  const [hasProAccess, setHasProAccess] = useState(false)
  const [planLoaded, setPlanLoaded] = useState(false)
  const [coinsRemaining, setCoinsRemaining] = useState<number | null>(null)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState<string | undefined>(undefined)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const loadingMsgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [loadingPhase, setLoadingPhase] = useState(0)

  useEffect(() => {
    const p = getStoredPriority()
    if (p) setPriority(p)
    setDnaSamples(getStoredWritingDna())
  }, [])

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
  }, [])

  const wordCount = input.trim().split(/\s+/).filter((w) => w.length > 0).length

  const maxWords = hasProAccess
    ? PREMIUM_MAX_WORDS_PER_REQUEST
    : coinsRemaining === null
      ? PREMIUM_MAX_WORDS_PER_REQUEST
      : Math.min(PREMIUM_MAX_WORDS_PER_REQUEST, coinsRemaining)

  const coinsInsufficient =
    !hasProAccess && planLoaded && coinsRemaining !== null && wordCount > coinsRemaining

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

  const refreshCoins = useCallback(async () => {
    try {
      const { apiClient } = await import('@/lib/axios-client')
      const token = await getAccessTokenForApi()
      const data = await apiClient.getHumanizeUsage(token)
      if (data.premium) {
        setHasProAccess(true)
        setCoinsRemaining(null)
        return
      }
      setHasProAccess(false)
      if (typeof data.coinsRemaining === 'number') {
        setCoinsRemaining(data.coinsRemaining)
      } else {
        setCoinsRemaining(null)
      }
    } catch {
      setCoinsRemaining(null)
    }
  }, [getAccessTokenForApi])

  useEffect(() => {
    void refreshPlanAccess()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshPlanAccess().then(() => {
        void refreshCoins()
      })
    })
    return () => subscription.unsubscribe()
  }, [refreshPlanAccess, refreshCoins])

  useEffect(() => {
    if (!planLoaded) return
    void refreshCoins()
  }, [planLoaded, refreshCoins])

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

  const handlePriorityChange = (p: HumanizePriority) => {
    setPriority(p)
    setStoredPriority(p)
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
      if (!token) {
        throw new Error('Session expired. Please sign in again.')
      }
      const extras = {
        priority,
        ...(dnaSamples.length >= 3 ? { writingDnaSamples: dnaSamples } : {}),
      }
      const { result, coinsRemaining: afterCoins } = await apiClient.humanizeText(
        input,
        humanizeLevel,
        token,
        extras
      )

      const elapsed = Date.now() - start
      if (elapsed < minDurationMs) {
        await new Promise((r) => setTimeout(r, minDurationMs - elapsed))
      }

      setProgress(100)
      setOutput(result)
      if (typeof afterCoins === 'number') {
        setCoinsRemaining(afterCoins)
        setHasProAccess(false)
      }
      void refreshCoins()
    } catch (error) {
      console.error(error)
      const e = error as Error & {
        upgradeRequired?: boolean
        coinsRemaining?: number
        status?: number
      }
      if (typeof e.coinsRemaining === 'number') {
        setCoinsRemaining(e.coinsRemaining)
      }
      if (e.upgradeRequired || e.status === 403) {
        setUpgradeMessage(e.message)
        setUpgradeModalOpen(true)
        void refreshCoins()
      } else {
        alert(e.message || 'Something went wrong. Please try again.')
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
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        message={upgradeMessage}
      />
      <WritingDnaModal
        open={dnaOpen}
        onOpenChange={setDnaOpen}
        initialSamples={dnaSamples}
        onExtracted={() => setDnaSamples(getStoredWritingDna())}
      />

      <section id="humanizer-tool" className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto mb-8 max-w-2xl text-center"
          >
            <h2 className="text-lg font-bold tracking-tight text-gray-900 md:text-xl dark:text-zinc-100">
              Humanize your text
            </h2>
            <p className="mt-2 text-sm text-gray-600 md:text-base dark:text-zinc-400">
              Choose mode, priority (Balanced or Stealth), and optional Mimic. Each word costs 1 coin on the free
              plan.
            </p>
            {!hasProAccess && coinsRemaining !== null && (
              <p className="mt-2 text-sm font-medium text-violet-800 dark:text-violet-300">
                Coins: {coinsRemaining.toLocaleString()}
              </p>
            )}
          </motion.div>

          <div className="mx-auto grid max-w-6xl items-stretch gap-6 lg:grid-cols-2">
            <Card className="liquid-glass-bubble flex flex-col border-2 border-primary/25 shadow-lg shadow-rose-950/10 dark:border-primary/30 dark:shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-500 dark:text-zinc-400">Input</span>
                </CardTitle>
                <CardDescription className="dark:text-zinc-500">
                  Toolbar: level, priority, and Mimic (writing samples) when you want your voice in the output.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="flex flex-col gap-3 rounded-xl border border-gray-200/80 bg-white/50 p-3 sm:flex-row sm:flex-wrap sm:items-end dark:border-zinc-700 dark:bg-zinc-900/50">
                  <div className="min-w-0 flex-1 space-y-1.5 sm:min-w-[140px]">
                    <label htmlFor="humanize-level" className="block text-xs font-medium text-gray-600 dark:text-zinc-400">
                      Humanize level
                    </label>
                    <select
                      id="humanize-level"
                      value={humanizeLevel}
                      onChange={(e) => setHumanizeLevel(e.target.value as HumanizeLevel)}
                      disabled={processing}
                      className={cn(
                        'flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950'
                      )}
                    >
                      <option value="basic">Basic</option>
                      <option value="advanced">Advanced</option>
                      <option value="academic">Academic (Turnitin)</option>
                    </select>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5 sm:min-w-[160px]">
                    <label htmlFor="humanize-priority" className="block text-xs font-medium text-gray-600 dark:text-zinc-400">
                      Priority
                    </label>
                    <select
                      id="humanize-priority"
                      value={priority}
                      onChange={(e) => handlePriorityChange(e.target.value as HumanizePriority)}
                      disabled={processing}
                      className={cn(
                        'flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950'
                      )}
                    >
                      {HUMANIZE_PRIORITIES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 shrink-0 gap-1.5 border-violet-200 bg-violet-50/80 text-violet-900 hover:bg-violet-100 dark:border-violet-500/40 dark:bg-violet-950/50 dark:text-violet-200 dark:hover:bg-violet-900/50"
                    onClick={() => setDnaOpen(true)}
                    disabled={processing}
                  >
                    <Dna className="h-4 w-4" aria-hidden />
                    Mimic
                  </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Button
                    type="button"
                    onClick={handleHumanize}
                    disabled={
                      processing || !input.trim() || wordCount > maxWords || coinsInsufficient
                    }
                    className="h-11 w-full shrink-0 sm:ml-auto sm:w-auto sm:min-w-[168px]"
                    size="lg"
                  >
                    {processing
                      ? 'Working…'
                      : coinsInsufficient
                        ? 'Not enough coins'
                        : 'Humanize text'}
                  </Button>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium dark:text-zinc-200">AI text</label>
                    <span className="text-sm text-gray-500 dark:text-zinc-400">
                      {wordCount} words
                      {!hasProAccess && coinsRemaining !== null && (
                        <span className="ml-2 text-violet-700 dark:text-violet-300">
                          · {wordCount} coins
                        </span>
                      )}
                    </span>
                  </div>
                  <Textarea
                    placeholder="Paste the AI text you want to humanize..."
                    className="min-h-[280px] flex-1 resize-y dark:border-zinc-600 dark:bg-zinc-950"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={processing}
                  />
                  {wordCount > maxWords && (
                    <p className="text-sm text-red-500 mt-2">
                      {hasProAccess
                        ? `Pro allows up to ${PREMIUM_MAX_WORDS_PER_REQUEST} words per run. Shorten your text.`
                        : `This run needs ${wordCount} coins but you can use at most ${maxWords} words with your current balance. Shorten your text or upgrade.`}
                    </p>
                  )}
                </div>
                {dnaSamples.length >= 3 && (
                  <p className="text-xs text-violet-800 dark:text-violet-300">
                    Mimic active: {dnaSamples.length} writing samples will steer tone and rhythm.
                  </p>
                )}
                {coinsInsufficient && (
                  <p className="text-xs text-center text-amber-800 dark:text-amber-200/90">
                    <Link href="/pricing" className="underline font-medium">
                      Upgrade to Pro
                    </Link>{' '}
                    for unlimited words, or shorten your text to fit your coins.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="liquid-glass-bubble flex min-h-[420px] flex-col border-2 border-white/50 shadow-lg shadow-rose-950/10 dark:border-zinc-700 dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-500 dark:text-zinc-400">Human-like output</CardTitle>
                <CardDescription className="dark:text-zinc-500">Read it, tweak it, copy when you are happy.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                {processing && (
                  <div className="space-y-4 py-2">
                    <p
                      key={loadingPhase}
                      className="text-sm font-semibold text-center text-gray-900 min-h-[1.35rem] dark:text-zinc-100"
                    >
                      {HUMANIZE_LOADING_MESSAGES[loadingPhase]}
                    </p>
                    <div className="rounded-full p-[3px] animate-[pulse_1.4s_ease-in-out_infinite] shadow-[0_0_22px_rgba(59,130,246,0.55)] ring-2 ring-primary/35 bg-gradient-to-r from-primary/25 via-amber-300/20 to-primary/25 dark:opacity-90">
                      <Progress value={progress} className="h-3 rounded-full bg-secondary/90" />
                    </div>
                    <p className="text-xs text-center text-gray-500 dark:text-zinc-500">Refining tone and phrasing…</p>
                  </div>
                )}

                {!processing && !output && (
                  <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center text-gray-500 text-sm dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
                    Your humanized text lands here after you run the tool.
                  </div>
                )}

                {!processing && output && (
                  <>
                    <div className="flex-1 min-h-[200px] p-4 bg-gray-50 rounded-lg border text-sm whitespace-pre-wrap overflow-y-auto max-h-[min(420px,50vh)] dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100">
                      {output}
                    </div>
                    <Button
                      type="button"
                      onClick={copyToClipboard}
                      variant="outline"
                      className="w-full gap-2 dark:border-zinc-600"
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
    </div>
  )
}
