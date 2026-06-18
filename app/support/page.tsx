import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site-url'
import { SupportPageClient } from '@/components/support-page-client'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'Support & Help Center',
  description:
    'Get help with Ladybug AI: restore access, manage or cancel your subscription, account and login help, refund policy, and contact support.',
  alternates: {
    canonical: `${siteUrl}/support`,
  },
}

export default function SupportPage() {
  return <SupportPageClient />
}
