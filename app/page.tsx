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
  const [freeUsesRemaining, setFreeUsesRemaining] = useState(2)
  const [copied, setCopied] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const handleInputChange = (value: string) => {
    setHumanizerInput(value)
    setWordCount(countWords(value))
  }

  const handleFreeTrial = async (tool: 'humanizer' | 'paraphraser' | 'citation', input: string) => {
    if (!input.trim()) return

    const words = countWords(input)
    const maxWords = freeUsesRemaining > 0 ? 200 : 2500 // Free: 200 words, Paid: 2500 words

    // Check word limit
    if (words > maxWords) {
      if (freeUsesRemaining > 0) {
        setUpgradeMessage(`Free trial limited to 200 words. Your text has ${words} words. Upgrade for 2500 word limit.`)
      } else {
        setUpgradeMessage(`Text too long. Maximum 2500 words allowed. Your text has ${words} words.`)
      }
      setShowUpgradeModal(true)
      return
    }

    // Check if user has free uses remaining
    if (freeUsesRemaining <= 0) {
      setUpgradeMessage("You've used your 2 free trials! Upgrade for unlimited access or purchase a one-time session.")
      setShowUpgradeModal(true)
      return
    }

    try {
      setHumanizerLoading(true)
      
      // First, test if API is reachable
      console.log('Testing API health...')
      try {
        const healthResponse = await fetch('/api/health')
        if (!healthResponse.ok) {
          throw new Error(`Health check failed: ${healthResponse.status}`)
        }
        const healthData = await healthResponse.json()
        console.log('Health check result:', healthData)
        
        if (!healthData.allEnvVarsSet) {
          alert('🔧 Configuration Issue!\n\nSome environment variables are missing in Vercel.\n\nPlease check:\n1. Go to Vercel Dashboard → Settings → Environment Variables\n2. Add all required variables\n3. Redeploy your site')
          return
        }
      } catch (healthError) {
        console.error('Health check failed:', healthError)
        alert('🌐 API Not Available!\n\nThe API server is not responding.\n\nPossible causes:\n1. Site is still deploying\n2. API routes are not working\n3. Check Vercel deployment status')
        return
      }
      
      console.log('Calling main API...')
      const response = await fetch(`/api/${tool}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tool === 'citation' ? input : { text: input }),
      })

      // Check if response is ok and has content
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      // Check if response has content
      const responseText = await response.text()
      if (!responseText) {
        throw new Error('API returned empty response')
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.error('Response Text:', responseText)
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`)
      }

      // Handle different response statuses
      if (response.status === 403) {
        setUpgradeMessage(data.message)
        setShowUpgradeModal(true)
        return
      } else if (response.status === 500) {
        // Server configuration error (likely missing env variables)
        console.error('API Error Details:', data)
        
        // Show specific error messages based on the error type
        if (data.error?.includes('OpenAI API not configured')) {
          alert(`🔑 OpenAI API Key Missing!\n\nYour site needs the OpenAI API key configured in Vercel.\n\nGo to Vercel Dashboard → Your Project → Settings → Environment Variables\nAdd: OPENAI_API_KEY=sk-proj-...`)
        } else if (data.error?.includes('Database not configured')) {
          alert(`🗄️ Database Not Configured!\n\nYour site needs Supabase credentials configured in Vercel.\n\nGo to Vercel Dashboard → Your Project → Settings → Environment Variables\nAdd: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY`)
        } else if (data.error?.includes('quota exceeded')) {
          alert(`💳 OpenAI Quota Exceeded!\n\nYour OpenAI account has reached its usage limit.\n\nPlease check your OpenAI billing at platform.openai.com`)
        } else if (data.error?.includes('Invalid OpenAI API key')) {
          alert(`❌ Invalid OpenAI API Key!\n\nYour OpenAI API key is incorrect or expired.\n\nPlease check your OPENAI_API_KEY in Vercel environment variables.`)
        } else {
          alert(`⚠️ Service Error: ${data.error || 'Server configuration issue'}\n\nPlease check:\n1. Environment variables in Vercel\n2. Site has been redeployed\n3. Browser console for details`)
        }
        return
      } else if (!response.ok) {
        console.error('API Error:', response.status, data)
        alert(data.error || `Error: ${response.status} - Please check console`)
        return
      }

      setHumanizerOutput(data.result)
      setFreeUsesRemaining(prev => prev - 1)
    } catch (error) {
      console.error('Free trial error:', error)
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('🌐 Network Error!\n\nUnable to connect to the API server.\n\nPossible causes:\n1. Site is still deploying\n2. API routes are not working\n3. Check Vercel deployment status')
      } else if (error instanceof Error) {
        alert(`❌ API Error: ${error.message}\n\nPlease check:\n1. Environment variables in Vercel\n2. Site deployment status\n3. Browser console for details`)
      } else {
        alert('⚠️ Unknown Error!\n\nPlease check:\n1. Environment variables are set in Vercel\n2. Services are configured\n3. Site has been redeployed after adding env vars\n4. Browser console for details')
      }
    } finally {
      setHumanizerLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(humanizerOutput)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const highlightDifferences = (original: string, humanized: string) => {
    const originalWords = original.split(' ')
    const humanizedWords = humanized.split(' ')
    const result: JSX.Element[] = []
    
    let i = 0, j = 0
    while (i < originalWords.length && j < humanizedWords.length) {
      if (originalWords[i].toLowerCase() === humanizedWords[j].toLowerCase()) {
        result.push(<span key={`same-${i}`}>{originalWords[i]} </span>)
        i++
        j++
      } else {
        // Find the next matching word
        let found = false
        for (let k = j + 1; k < humanizedWords.length; k++) {
          if (originalWords[i].toLowerCase() === humanizedWords[k].toLowerCase()) {
            // Highlight the changed words
            for (let l = j; l < k; l++) {
              result.push(<span key={`changed-${l}`} className="bg-yellow-200 px-1 rounded">{humanizedWords[l]} </span>)
            }
            j = k
            found = true
            break
          }
        }
        if (!found) {
          result.push(<span key={`changed-${j}`} className="bg-yellow-200 px-1 rounded">{humanizedWords[j]} </span>)
          j++
        }
        i++
      }
    }
    
    // Add remaining humanized words
    while (j < humanizedWords.length) {
      result.push(<span key={`added-${j}`} className="bg-green-200 px-1 rounded">{humanizedWords[j]} </span>)
      j++
    }
    
    return result
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - SEO Optimized */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              ⭐ The Best AI Tool for Students - 100% Free Trial
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Free AI Humanizer for Students
            </h1>
            <h2 className="text-2xl md:text-3xl text-gray-700 mb-6">
              Make AI Text Sound Human | <span className="text-primary">Undetectable AI Writing</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Transform AI-generated text into natural, human-like writing instantly. 
              Perfect for essays, research papers, and assignments. No credit card required!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Try Free AI Humanizer Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#free-trial">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Test It Below ⬇️
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              ✅ Free Forever Plan Available • ✅ No Credit Card Required • ✅ 2 Free Uses Daily
            </p>
          </motion.div>
        </div>
      </section>

      {/* Student Benefits Section - NEW */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Students Love Ladybug AI
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="font-bold text-xl mb-2">Perfect for Essays</h3>
              <p className="text-gray-600">Make your AI-written essays sound natural and authentic</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="font-bold text-xl mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Humanize your text in seconds, not hours</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="font-bold text-xl mb-2">100% Free Trial</h3>
              <p className="text-gray-600">Try 2 times daily without any payment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            3 Essential AI Tools for Students
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Everything you need to ace your assignments - AI humanizer, paraphraser, and citation generator
          </p>
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
                  <CardTitle>Free AI Humanizer</CardTitle>
                  <CardDescription>
                    Transform AI-generated essays into authentic, human-like writing. Bypass AI detectors and make your work sound natural.
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
                  <CardTitle>Essay Paraphraser</CardTitle>
                  <CardDescription>
                    Rewrite your essays and papers in different words. Perfect for avoiding plagiarism and improving clarity.
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
                    Create perfect APA and MLA citations for your research papers. Save hours on bibliography formatting.
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
      <section id="free-trial" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Try Our Free AI Humanizer Now
            </h2>
            <p className="text-center text-gray-600 mb-8">
              No sign up required! Test it right here - 2 free uses per day for students
            </p>
            <div className="text-center mb-6">
              <p className="text-lg text-gray-600">
                {freeUsesRemaining > 0 
                  ? `You have ${freeUsesRemaining} free trial${freeUsesRemaining === 1 ? '' : 's'} remaining • 200 word limit`
                  : 'Free trials used up - upgrade for unlimited access!'
                }
              </p>
            </div>
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle>Free AI Humanizer - Test It Below</CardTitle>
                <CardDescription>
                  Paste your AI-generated text and watch it transform into natural, human-like writing. Perfect for students!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Input Text</label>
                    <span className="text-sm text-gray-500">
                      {wordCount} / {freeUsesRemaining > 0 ? '200' : '2500'} words
                      {wordCount > (freeUsesRemaining > 0 ? 200 : 2500) && (
                        <span className="text-red-500 ml-1">(over limit)</span>
                      )}
                    </span>
                  </div>
                  <Textarea
                    placeholder="Paste your AI-generated text here..."
                    className="min-h-[120px]"
                    value={humanizerInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    disabled={freeUsesRemaining <= 0}
                  />
                  {wordCount > (freeUsesRemaining > 0 ? 200 : 2500) && (
                    <p className="text-sm text-red-500 mt-1">
                      {freeUsesRemaining > 0 
                        ? 'Free trial limited to 200 words. Upgrade for 2500 word limit.'
                        : 'Text exceeds 2500 word limit.'
                      }
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => handleFreeTrial('humanizer', humanizerInput)}
                  disabled={
                    humanizerLoading || 
                    !humanizerInput.trim() || 
                    freeUsesRemaining <= 0 || 
                    wordCount > (freeUsesRemaining > 0 ? 200 : 2500)
                  }
                  className="w-full"
                >
                  {humanizerLoading ? 'Processing...' : 
                   freeUsesRemaining <= 0 ? 'Upgrade to Continue' : 
                   wordCount > (freeUsesRemaining > 0 ? 200 : 2500) ? 'Text Too Long' :
                   'Humanize Text'}
                </Button>
                {humanizerLoading && <LoadingSpinner />}
                {humanizerOutput && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Humanized Text (Changes Highlighted)</label>
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        {highlightDifferences(humanizerInput, humanizerOutput)}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          onClick={copyToClipboard}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {copied ? 'Copied!' : 'Copy Text'}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Humanized Text</label>
                      <div className="p-4 bg-white rounded-lg border">
                        {humanizerOutput}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SEO Content Section - NEW */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">What is an AI Humanizer?</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              An <strong>AI humanizer</strong> is a tool that transforms AI-generated text into natural, human-like writing. 
              For students using AI writing assistants like ChatGPT or other AI tools, humanizing your content is essential 
              to make your essays and assignments sound authentic and pass AI detection.
            </p>
            <h3 className="text-2xl font-bold mt-8 mb-4">Why Students Need a Free AI Humanizer</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Bypass AI Detectors:</strong> Make AI-written essays undetectable to AI detection tools</li>
              <li><strong>Sound More Natural:</strong> Transform robotic AI text into authentic student writing</li>
              <li><strong>Save Time:</strong> Edit AI content in seconds instead of rewriting manually</li>
              <li><strong>Improve Grades:</strong> Submit work that sounds genuinely human and engaging</li>
              <li><strong>100% Free:</strong> Try our AI humanizer free with no credit card required</li>
            </ul>
            <h3 className="text-2xl font-bold mt-8 mb-4">How to Use Our Free AI Humanizer</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Paste your AI-generated text into the box above</li>
              <li>Click "Humanize Text" to process your content</li>
              <li>Get natural, human-like text in seconds</li>
              <li>Copy and use in your assignments</li>
            </ol>
            <p className="mt-6">
              Unlike other AI humanizers that charge immediately, Ladybug AI offers a <strong>completely free tier</strong> for students. 
              Try it 2 times per day without any payment or sign up. Perfect for quick essay touch-ups!
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Student-Friendly Pricing</h2>
          <p className="text-center text-gray-600 mb-12">Affordable plans for students. Start free!</p>
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

