import type { Metadata } from 'next'
import { AdminRestoreAccessClient } from '@/components/admin-restore-access-client'

export const metadata: Metadata = {
  title: 'Restore access (admin)',
  description: 'Owner tool to restore a customer’s paid access.',
  robots: { index: false, follow: false },
}

export default function AdminRestoreAccessPage() {
  return <AdminRestoreAccessClient />
}
