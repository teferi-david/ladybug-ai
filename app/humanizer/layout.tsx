import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Humanizer',
  description: 'Humanize AI drafts with modes, priorities, and optional Writing DNA.',
}

export default function HumanizerLayout({ children }: { children: React.ReactNode }) {
  return children
}
