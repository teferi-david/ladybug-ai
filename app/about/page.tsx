import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteUrl } from '@/lib/site-url'
import { Button } from '@/components/ui/button'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'About',
  description:
    'Ladybug AI helps students and writers turn AI drafts into clear, natural sounding text with our humanizer and study tools.',
  alternates: {
    canonical: `${siteUrl}/about`,
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50/80 via-white to-rose-50/30">
      <article className="container mx-auto max-w-3xl px-4 py-14 md:py-20">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-primary">About</p>
        <h1 className="mt-3 text-center text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Writing tools built for natural, confident results
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-relaxed text-gray-600">
          Ladybug AI started as a simple idea: AI can help you draft, but the words still need to sound like
          you. Our humanizer, paraphraser, and citation tools are built for real school and work workflows,
          with fair free limits and clear upgrade paths when you need more.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/">Try the humanizer</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full border-gray-200/80 bg-white/60 backdrop-blur-sm">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </article>
    </div>
  )
}
