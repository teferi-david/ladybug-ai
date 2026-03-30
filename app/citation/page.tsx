'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Quote, Copy } from 'lucide-react'

export default function CitationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [premium, setPremium] = useState(false)
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

  const load = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    const { data: row } = await supabase.from('users').select('current_plan, plan_expiry').eq('id', session.user.id).single()
    setPremium(hasProHumanizeAccess(row))
    setLoading(false)
  }, [router])

  useEffect(() => {
    load()
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
        return
      }

      setOutput(data.result)
    } catch {
      alert('Request failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!premium) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <h1 className="text-2xl font-bold mb-2">Citation generator</h1>
        <p className="text-gray-600 mb-6">APA & MLA — Pro feature.</p>
        <Link href="/pricing">
          <Button size="lg">Upgrade to Pro</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center">
          <Quote className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Citations</h1>
          <p className="text-sm text-gray-600">APA or MLA — copy into your paper</p>
        </div>
      </div>

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

          <Button onClick={handleGenerate} disabled={processing} className="w-full">
            {processing ? 'Generating…' : 'Generate citation'}
          </Button>
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
            <div className="p-4 bg-gray-50 rounded-lg border text-sm whitespace-pre-wrap">{output}</div>
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
