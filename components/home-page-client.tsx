'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Sparkles, Copy, Check, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { PREMIUM_MAX_WORDS_PER_REQUEST } from '@/lib/premium-config'

export function HomePageClient() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [humanizeLevel, setHumanizeLevel] = useState<'highschool' | 'college' | 'graduate'>('highschool')
  const [hasProAccess, setHasProAccess] = useState(false)
  const [planLoaded, setPlanLoaded] = useState(false)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const wordCount = input.trim().split(/\s+/).filter((w) => w.length > 0).length
  const maxWords = hasProAccess ? PREMIUM_MAX_WORDS_PER_REQUEST : 200

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

  useEffect(() => {
    refreshPlanAccess()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshPlanAccess()
    })
    return () => subscription.unsubscribe()
  }, [refreshPlanAccess])

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
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const result = await apiClient.humanizeText(input, humanizeLevel, session?.access_token)

      const elapsed = Date.now() - start
      if (elapsed < minDurationMs) {
        await new Promise((r) => setTimeout(r, minDurationMs - elapsed))
      }

      setProgress(100)
      setOutput(result)
    } catch (error) {
      console.error(error)
      alert(`❌ ${error instanceof Error ? error.message : 'Something went wrong'}`)
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
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="h-4 w-4" />
              Ladybug AI humanizer
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
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                      <p className="text-xs text-gray-500 flex-1">
                        College &amp; Graduate modes are included with Pro. Free tier: up to 200 words per
                        run; Pro: up to {PREMIUM_MAX_WORDS_PER_REQUEST} words, no daily cap.
                      </p>
                      <Link href="/pricing" className="shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          className="w-full sm:w-auto font-semibold text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-amber-200 hover:via-yellow-300 hover:to-amber-400 border border-amber-400/60 shadow-[0_0_18px_rgba(234,179,8,0.55),0_0_36px_rgba(250,204,21,0.25)] hover:shadow-[0_0_24px_rgba(234,179,8,0.7)] transition-shadow animate-pulse"
                        >
                          Upgrade to unlock
                        </Button>
                      </Link>
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
                        : 'Free tier is limited to 200 words. Shorten your text or upgrade to Pro.'}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleHumanize}
                  disabled={processing || !input.trim() || wordCount > maxWords}
                  className="w-full"
                  size="lg"
                >
                  {processing ? 'Working…' : 'Humanize text'}
                </Button>
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
    </div>
  )
}
