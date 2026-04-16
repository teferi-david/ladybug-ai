import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteUrl } from '@/lib/site-url'
import { Button } from '@/components/ui/button'
import { TRIAL_START_PRICE_USD } from '@/lib/stripe-plans'
import { RecordDashboardVisit } from '@/components/record-dashboard-visit'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'AI Humanizer | Free Humanizer AI for Natural, Human-Like Text',
  description:
    'Ladybug AI humanizer helps you humanize AI text. Paste a draft, get clearer, more human sounding rewrites. Try the free tier.',
  alternates: {
    canonical: `${siteUrl}/ai-humanizer`,
  },
  openGraph: {
    title: 'AI Humanizer | Ladybug AI Humanizer & Humanizer AI',
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
    <div className="min-h-full bg-gradient-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-black">
      <RecordDashboardVisit href="/ai-humanizer" label="Blog" />
      <article className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-primary">
          AI Humanizer
        </p>
        <h1 className="mt-3 text-center text-3xl font-bold leading-tight text-gray-900 dark:text-zinc-50 md:text-4xl">
          AI humanizer and humanizer AI: natural rewrites for AI generated text
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600 dark:text-zinc-300">
          <strong>Ladybug AI</strong> is an <strong>AI humanizer</strong>. Paste text from ChatGPT or other
          assistants and get output that reads more like you wrote it: clearer flow, fewer robotic patterns,
          same core ideas.
        </p>

        <div className="mt-10 space-y-8 text-gray-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">What does an AI humanizer do?</h2>
            <p className="mt-3 leading-relaxed">
              A <strong>humanizer AI</strong> rewrites machine-sounding lines into natural language. It
              helps with school papers, blog posts, emails, and anywhere you want your draft to feel less
              generic. Still review it and cite sources when your teacher cares.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Try the humanizer</h2>
            <p className="mt-3 leading-relaxed">
              The main tool lives on the home page: paste your text, pick a level (including Academic /
              Turnitin), and run <strong>Humanize</strong>. Free tier includes daily limits and a per-run word
              cap; a 1 day Trial adds higher word caps, unlimited runs, plus Paraphraser and Citations.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/humanizer">Open AI humanizer</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">{`Start trial ($${TRIAL_START_PRICE_USD.toFixed(2)})`}</Link>
              </Button>
            </div>
          </section>
        </div>
      </article>
    </div>
  )
}
