'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Sparkles, Copy, Check } from 'lucide-react'

export default function HomePage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [humanizeLevel, setHumanizeLevel] = useState<'highschool' | 'college' | 'graduate'>('highschool')
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const wordCount = input.trim().split(/\s+/).filter((w) => w.length > 0).length

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
      const result = await apiClient.humanizeText(input, humanizeLevel)

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
              AI Humanizer
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Human-like text in one click</h1>
            <p className="text-lg text-gray-600">
              Paste AI-generated text on the left. Your natural, human-style rewrite appears on the right.
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
                      onClick={() => setHumanizeLevel('highschool')}
                      className="flex-1 min-w-[100px]"
                    >
                      High school
                    </Button>
                    <Button
                      type="button"
                      variant={humanizeLevel === 'college' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHumanizeLevel('college')}
                      className="flex-1 min-w-[100px]"
                    >
                      College
                    </Button>
                    <Button
                      type="button"
                      variant={humanizeLevel === 'graduate' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHumanizeLevel('graduate')}
                      className="flex-1 min-w-[100px]"
                    >
                      Graduate
                    </Button>
                  </div>
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
                  {wordCount > 200 && (
                    <p className="text-sm text-red-500 mt-2">
                      Free tier is limited to 200 words. Shorten your text or sign in with an active plan.
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleHumanize}
                  disabled={processing || !input.trim() || wordCount > 200}
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
