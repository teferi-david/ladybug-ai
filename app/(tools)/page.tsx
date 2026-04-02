import type { Metadata } from 'next'
import { HomePageClient } from '@/components/home-page-client'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  /** Avoids root `template: '%s | Ladybug AI'` doubling the brand name. */
  title: { absolute: 'Undetectable AI Humanizer: Ladybug AI' },
  description:
    'Ladybug AI humanizer: humanizer AI that rewrites AI text to sound natural. Free AI humanizer for students — paste text, get human-like output.',
  verification: {
    google: 'qvADDwV66FQYyjM9peClKgzJiRefSJ-3I-7-hFJ_EnI',
  },
  alternates: {
    canonical: getSiteUrl(),
  },
  openGraph: {
    title: 'Undetectable AI Humanizer: Ladybug AI',
    description:
      'Humanizer AI and Ladybug AI humanizer: natural rewrites for AI-generated text. Try free.',
    url: getSiteUrl(),
  },
}

export default function HomePage() {
  return <HomePageClient />
}
