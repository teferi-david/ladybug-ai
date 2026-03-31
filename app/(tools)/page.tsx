import type { Metadata } from 'next'
import { HomePageClient } from '@/components/home-page-client'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'AI Humanizer — Humanizer AI & Ladybug AI Humanizer',
  description:
    'Ladybug AI humanizer: humanizer AI that rewrites AI text to sound natural. Free AI humanizer for students — paste text, get human-like output.',
  alternates: {
    canonical: getSiteUrl(),
  },
  openGraph: {
    title: 'Ladybug AI — AI Humanizer & Humanizer AI',
    description:
      'Humanizer AI and Ladybug AI humanizer: natural rewrites for AI-generated text. Try free.',
    url: getSiteUrl(),
  },
}

export default function HomePage() {
  return <HomePageClient />
}
