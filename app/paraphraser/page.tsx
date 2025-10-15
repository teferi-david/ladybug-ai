'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/loading-spinner'
import { UpgradeModal } from '@/components/upgrade-modal'
import { RefreshCw } from 'lucide-react'

export default function ParaphraserPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    setUser(session.user)
    setLoading(false)
  }

  const handleParaphrase = async () => {
    if (!input.trim()) return

    setProcessing(true)
    setOutput('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('/api/paraphrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: input }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          setUpgradeMessage(data.message)
          setShowUpgradeModal(true)
        } else {
          alert(data.error || 'An error occurred')
        }
        return
      }

      setOutput(data.result)
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Paraphraser</h1>
              <p className="text-gray-600">Rephrase your content for clarity and variation</p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <CardDescription>Paste the text you want to paraphrase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your text here..."
              className="min-h-[200px]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {input.length} characters
              </span>
              <Button onClick={handleParaphrase} disabled={processing || !input.trim()}>
                {processing ? 'Paraphrasing...' : 'Paraphrase Text'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {processing && <LoadingSpinner />}

        {output && (
          <Card>
            <CardHeader>
              <CardTitle>Paraphrased Output</CardTitle>
              <CardDescription>Your rephrased text</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg border whitespace-pre-wrap">
                {output}
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  navigator.clipboard.writeText(output)
                  alert('Copied to clipboard!')
                }}
              >
                Copy to Clipboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        message={upgradeMessage}
      />
    </div>
  )
}

