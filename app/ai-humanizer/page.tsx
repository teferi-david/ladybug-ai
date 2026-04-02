import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteUrl } from '@/lib/site-url'
import { Button } from '@/components/ui/button'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'AI Humanizer — Free Humanizer AI for Natural, Human-Like Text',
  description:
    'Ladybug AI humanizer: the AI humanizer tool to humanize AI text — paste drafts, get clearer, more human-like rewrites. Try the humanizer AI free tier.',
  alternates: {
    canonical: `${siteUrl}/ai-humanizer`,
  },
  openGraph: {
    title: 'AI Humanizer — Ladybug AI Humanizer & Humanizer AI',
    description:
      'Humanizer AI for natural rewrites. Humanize AI content in one place.',
    url: `${siteUrl}/ai-humanizer`,
  },
  keywords: [
    'ai humanizer',
    'humanizer ai',
    'humanize ai text',
    'humanize ai',
    'ladybug ai humanizer',
    'ai to human text',
  ],
}

export default function AiHumanizerLandingPage() {
  return (
    <div className="min-h-full bg-gradient-to-b from-white to-gray-50">
      <article className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-primary">
          AI Humanizer
        </p>
        <h1 className="mt-3 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          AI humanizer &amp; humanizer AI — natural rewrites for AI-generated text
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600">
          <strong>Ladybug AI</strong> is an <strong>AI humanizer</strong>: paste text from ChatGPT or other
          assistants and get output that reads more like real human writing — clearer flow, fewer robotic
          patterns, same core ideas.
        </p>

        <div className="mt-10 space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-gray-900">What does an AI humanizer do?</h2>
            <p className="mt-3 leading-relaxed">
              A <strong>humanizer AI</strong> rewrites machine-sounding lines into natural language. It
              helps with school papers, blog posts, emails, and anywhere you want your draft to feel less
              generic — always review and cite sources yourself when required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">Try the humanizer</h2>
            <p className="mt-3 leading-relaxed">
              The main tool lives on the home page: paste your text, pick a level (including Academic /
              Turnitin), and run <strong>Humanize</strong>. Free tier includes daily limits and a per-run word
              cap; a 1-day Pro trial adds higher word caps, unlimited runs, plus Paraphraser and Citations.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/">Open AI humanizer</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">Start for free</Link>
              </Button>
            </div>
          </section>
        </div>
      </article>
    </div>
  )
}
