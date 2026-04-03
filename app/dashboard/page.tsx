import type { Metadata } from 'next'
import { DashboardPageClient } from '@/components/dashboard-page-client'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Open Ladybug AI tools from your dashboard.',
}

export default function DashboardPage() {
  return <DashboardPageClient />
}
