'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/loading-spinner'
import { UpgradeModal } from '@/components/upgrade-modal'
import { Quote } from 'lucide-react'

export default function CitationPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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

  const handleGenerate = async () => {
    setProcessing(true)
    setOutput('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('/api/citation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: citationType,
          ...formData,
        }),
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
              <Quote className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Citation Generator</h1>
              <p className="text-gray-600">Generate properly formatted APA and MLA citations</p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Citation Information</CardTitle>
            <CardDescription>Fill in the details to generate your citation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={citationType} onValueChange={(v) => setCitationType(v as 'apa' | 'mla')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="apa">APA Format</TabsTrigger>
                <TabsTrigger value="mla">MLA Format</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="John Doe"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Article or Book Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
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
                  placeholder="Publisher Name"
                  value={formData.publisher}
                  onChange={(e) => handleInputChange('publisher', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL (Optional)</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessDate">Access Date (Optional)</Label>
                <Input
                  id="accessDate"
                  placeholder="January 1, 2024"
                  value={formData.accessDate}
                  onChange={(e) => handleInputChange('accessDate', e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={processing} className="w-full">
              {processing ? 'Generating...' : 'Generate Citation'}
            </Button>
          </CardContent>
        </Card>

        {processing && <LoadingSpinner />}

        {output && (
          <Card>
            <CardHeader>
              <CardTitle>{citationType.toUpperCase()} Citation</CardTitle>
              <CardDescription>Your formatted citation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg border">
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

