'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [premium, setPremium] = useState(false)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [processing, setProcessing] = useState(false)

  const wordCount = input.trim().split(/\s+/).filter((w) => w.length > 0).length

  const load = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    const { data: row } = await supabase
      .from('users')
      .select('current_plan, plan_expiry, subscription_status, uses_left')
      .eq('id', session.user.id)
      .single()
    setPremium(hasProHumanizeAccess(row))
    setLoading(false)
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  const handleParaphrase = async () => {
    if (!input.trim() || wordCount > PREMIUM_MAX_WORDS_PER_REQUEST) return

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
        return
      }

      setOutput(data.result)
    } catch {
      alert('Request failed. Try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!premium) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <h1 className="text-2xl font-bold mb-2 tracking-tight">Paraphraser</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Included with Pro. Start a 1-day free trial for unlimited paraphrasing plus the AI Humanizer,
          Citations, and more.
        </p>
        <div className="flex justify-center pt-2">
          <ProUpgradeButton asChild size="lg" className="min-w-[min(100%,280px)] px-8">
            <Link href="/pricing">Start for free</Link>
          </ProUpgradeButton>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center">
          <RefreshCw className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Paraphraser</h1>
          <p className="text-sm text-gray-600">Paste text · up to {PREMIUM_MAX_WORDS_PER_REQUEST} words</p>
        </div>
      </div>

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
          <div className="flex justify-between text-sm text-gray-500">
            <span>{wordCount} / {PREMIUM_MAX_WORDS_PER_REQUEST} words</span>
            <Button onClick={handleParaphrase} disabled={processing || !input.trim() || wordCount > PREMIUM_MAX_WORDS_PER_REQUEST}>
              {processing ? 'Working…' : 'Paraphrase'}
            </Button>
          </div>
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
            <div className="p-4 bg-gray-50 rounded-lg border text-sm whitespace-pre-wrap">{output}</div>
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
