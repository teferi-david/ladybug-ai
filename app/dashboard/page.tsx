'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Sparkles, RefreshCw, Quote, Calendar, Zap, Clock } from 'lucide-react'
import Link from 'next/link'
import { getRemainingWords, isPlanActive, getPlanDetails } from '@/lib/user-plans'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/login')
      }
      setLoading(false)
    }
    getUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const plan = getPlanDetails(user.current_plan || 'free')
  const isActive = isPlanActive(user)
  const remainingWords = getRemainingWords(user)
  const wordsUsed = (user.words_used || 0)
  const totalWords = plan?.wordLimit || 0
  const usagePercentage = totalWords > 0 ? (wordsUsed / totalWords) * 100 : 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.email}</p>
          </div>

          {/* Plan Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{plan?.description || 'Free Plan'}</h3>
                  {isActive && user.plan_expiry && (
                    <p className="text-sm text-gray-600">
                      Expires: {formatDate(user.plan_expiry)}
                    </p>
                  )}
                </div>
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              {isActive && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Words Used</span>
                    <span>{wordsUsed.toLocaleString()} / {totalWords.toLocaleString()}</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {remainingWords.toLocaleString()} words remaining
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Tools */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Humanizer</CardTitle>
                <CardDescription>
                  Transform AI text into natural, human-like writing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/humanizer">
                  <Button className="w-full" disabled={!isActive}>
                    {isActive ? 'Use Humanizer' : 'Upgrade Required'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Paraphraser</CardTitle>
                <CardDescription>
                  Rewrite text in different words while keeping the meaning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/paraphraser">
                  <Button className="w-full" disabled={!isActive}>
                    {isActive ? 'Use Paraphraser' : 'Upgrade Required'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Quote className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Citation Generator</CardTitle>
                <CardDescription>
                  Create perfect APA and MLA citations for your research
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/citation">
                  <Button className="w-full" disabled={!isActive}>
                    {isActive ? 'Use Citation Generator' : 'Upgrade Required'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Plan Actions */}
          {!isActive && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Upgrade Your Plan</CardTitle>
                <CardDescription>
                  Get unlimited access to all AI tools with a premium plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/pricing">
                  <Button size="lg" className="w-full">
                    View Plans & Pricing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Usage History */}
          {isActive && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Usage History
                </CardTitle>
                <CardDescription>
                  Track your AI tool usage and remaining words
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Words Used This Period</span>
                    <span className="font-semibold">{wordsUsed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Words Remaining</span>
                    <span className="font-semibold text-primary">{remainingWords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan Expires</span>
                    <span className="font-semibold">
                      {user.plan_expiry ? formatDate(user.plan_expiry) : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}