import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site-url'

const base = getSiteUrl()

export const metadata: Metadata = {
  title: 'Pricing | AI Humanizer Pro | Ladybug AI',
  description:
    'Ladybug AI Pro: unlimited AI humanizer, all levels, higher word limits. Compare plans for the best AI humanizer for students.',
  keywords: [
    'ladybug ai pricing',
    'ai humanizer pro',
    'humanizer ai subscription',
    'ladybug ai humanizer',
  ],
  alternates: {
    canonical: `${base}/pricing`,
  },
  openGraph: {
    title: 'Pricing | Ladybug AI Humanizer',
    description: 'Pro plans for unlimited AI humanizing and advanced writing tools.',
    url: `${base}/pricing`,
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
