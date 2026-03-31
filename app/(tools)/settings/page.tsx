import type { Metadata } from 'next'
import { SettingsPageClient } from '@/components/settings-page-client'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Account, plan, and billing settings for Ladybug AI.',
}

export default function SettingsPage() {
  return <SettingsPageClient />
}
