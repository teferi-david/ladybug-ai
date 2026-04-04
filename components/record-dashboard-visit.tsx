'use client'

import { useEffect } from 'react'
import { recordToolVisit } from '@/lib/dashboard-recents'

/** Call from server-rendered pages to register a dashboard "recent" when the user lands here. */
export function RecordDashboardVisit({ href, label }: { href: string; label: string }) {
  useEffect(() => {
    recordToolVisit(href, label)
  }, [href, label])
  return null
}
