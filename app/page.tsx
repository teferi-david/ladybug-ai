'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/loading-spinner'
import { UpgradeModal } from '@/components/upgrade-modal'
import { Sparkles, RefreshCw, Quote, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const [humanizerInput, setHumanizerInput] = useState('')
  const [humanizerOutput, setHumanizerOutput] = useState('')
  const [humanizerLoading, setHumanizerLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState('')

  const handleFreeTrial = async (tool: 'humanizer' | 'paraphraser' | 'citation', input: string) => {
    if (!input.trim()) return

    try {
      setHumanizerLoading(true)
      const response = await fetch(`/api/${tool}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tool === 'citation' ? input : { text: input }),
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

      setHumanizerOutput(data.result)
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setHumanizerLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transform Your Writing with{' '}
              <span className="text-primary">Ladybug AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI-powered tools to humanize text, paraphrase content, and generate citations.
              Professional writing assistance at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Powerful Writing Tools
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI Humanizer</CardTitle>
                  <CardDescription>
                    Make AI-generated text sound natural and human-like while preserving meaning.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/humanizer">
                    <Button variant="outline" className="w-full">
                      Try Humanizer
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <RefreshCw className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Paraphraser</CardTitle>
                  <CardDescription>
                    Rephrase your content for clarity and variation while maintaining context.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/paraphraser">
                    <Button variant="outline" className="w-full">
                      Try Paraphraser
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Quote className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Citation Generator</CardTitle>
                  <CardDescription>
                    Generate properly formatted APA and MLA citations instantly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/citation">
                    <Button variant="outline" className="w-full">
                      Try Citation Generator
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Free Trial Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Try It Free</h2>
            <Card>
              <CardHeader>
                <CardTitle>AI Humanizer - Free Trial</CardTitle>
                <CardDescription>
                  Try 2 free conversions per day (500 tokens each). Sign up for unlimited access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Input Text</label>
                  <Textarea
                    placeholder="Paste your AI-generated text here..."
                    className="min-h-[120px]"
                    value={humanizerInput}
                    onChange={(e) => setHumanizerInput(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => handleFreeTrial('humanizer', humanizerInput)}
                  disabled={humanizerLoading || !humanizerInput.trim()}
                  className="w-full"
                >
                  {humanizerLoading ? 'Processing...' : 'Humanize Text'}
                </Button>
                {humanizerLoading && <LoadingSpinner />}
                {humanizerOutput && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Output</label>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      {humanizerOutput}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>3-Day Trial</CardTitle>
                <div className="text-3xl font-bold text-primary">$1.49</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Perfect for trying out all features</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly</CardTitle>
                <div className="text-3xl font-bold text-primary">$15.49</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Unlimited access, billed monthly</p>
              </CardContent>
            </Card>
            <Card className="border-primary border-2">
              <CardHeader>
                <CardTitle>Annual</CardTitle>
                <div className="text-3xl font-bold text-primary">$149.49</div>
                <p className="text-sm text-gray-600">$12.49/mo equivalent</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Best value - save $36/year</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Single Use</CardTitle>
                <div className="text-3xl font-bold text-primary">$3.99</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">2,000 tokens, 24-hour access</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing">
              <Button size="lg">View Full Pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        message={upgradeMessage}
      />
    </div>
  )
}

