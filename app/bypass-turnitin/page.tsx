import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteUrl } from '@/lib/site-url'
import { Button } from '@/components/ui/button'
import { RecordDashboardVisit } from '@/components/record-dashboard-visit'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'AI Humanizer | Natural Text for Turnitin & AI Detection Concerns',
  description:
    'AI humanizer for students and writers: rewrite AI drafts into clearer, more human-like text. Learn how humanizing relates to Turnitin-style checks and academic integrity.',
  alternates: {
    canonical: `${siteUrl}/bypass-turnitin`,
  },
  openGraph: {
    title: 'Ladybug AI | AI Humanizer & Human-Like Rewrites',
    description:
      'Humanize AI text for natural tone. Understand Turnitin, originality, and responsible use.',
    url: `${siteUrl}/bypass-turnitin`,
  },
  keywords: [
    'ai humanizer',
    'humanize ai text',
    'bypass turnitin',
    'turnitin ai detection',
    'humanize ai',
    'ladybug ai',
  ],
}

export default function BypassTurnitinLandingPage() {
  return (
    <div className="min-h-full bg-gradient-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-black">
      <RecordDashboardVisit href="/bypass-turnitin" label="Turnitin guide" />
      <article className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-primary">
          AI Humanizer · Search-friendly guide
        </p>
        <h1 className="mt-3 text-center text-3xl font-bold leading-tight text-gray-900 dark:text-zinc-50 md:text-4xl">
          AI humanizer &amp; what people mean by &quot;bypass Turnitin&quot;
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600 dark:text-zinc-300">
          Ladybug AI is an <strong>AI humanizer</strong>: it helps you rewrite AI-assisted drafts so they
          read more naturally and clearly. Here is how that connects to{' '}
          <strong>Turnitin</strong> and similar tools, plus how to stay on the right side of your
          school&apos;s rules.
        </p>

        <div className="mt-10 space-y-8 text-gray-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">What is an AI humanizer?</h2>
            <p className="mt-3 leading-relaxed">
              An <strong>AI humanizer</strong> adjusts tone, rhythm, and word choice so text sounds less
              generic and more like thoughtful human writing. It&apos;s useful for essays, emails, and
              posts when you started from an AI draft and want a clearer, more personal voice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Turnitin, AI detection, and similarity</h2>
            <p className="mt-3 leading-relaxed">
              Turnitin and similar tools check for <strong>similarity</strong> to other sources and, in many
              setups, signals that may indicate AI-generated text. Results depend on your institution&apos;s
              settings and how you use sources. Searching for ways to &quot;<strong>bypass Turnitin</strong>
              &quot; usually means wanting text that passes those checks, but the only durable approach is{' '}
              <strong>original thinking, proper citation, and following your school&apos;s AI policy</strong>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">How Ladybug AI fits</h2>
            <p className="mt-3 leading-relaxed">
              Our <strong>humanizer</strong> focuses on readability and natural phrasing, not on sneaking past
              academic integrity rules. If your course allows AI assistance, use it transparently; if not,
              don&apos;t. We encourage you to cite sources, write your own analysis, and submit work that
              reflects your learning.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Try the AI humanizer</h2>
            <p className="mt-3 leading-relaxed">
              Paste your draft on the home page, choose a level, and get a human-like rewrite you can
              edit further. That&apos;s the same core experience people look for when they search{' '}
              <strong>ai humanizer</strong> or compare options to heavy similarity tools.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/humanizer">Open AI Humanizer</Link>
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
