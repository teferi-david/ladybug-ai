/**
 * Last tools opened from the dashboard (and tool pages), stored in localStorage.
 */

export const DASHBOARD_RECENTS_KEY = 'ladybug-dashboard-recents-v1'
export const DASHBOARD_RECENTS_UPDATED_EVENT = 'ladybug:dashboard-recents-updated'

export type DashboardRecent = {
  href: string
  label: string
  visitedAt: number
}

const MAX_RECENTS = 5

export function recordToolVisit(href: string, label: string): void {
  if (typeof window === 'undefined') return
  try {
    const prev = getRecentVisits()
    const rest = prev.filter((r) => r.href !== href)
    const next: DashboardRecent[] = [{ href, label, visitedAt: Date.now() }, ...rest].slice(0, MAX_RECENTS)
    localStorage.setItem(DASHBOARD_RECENTS_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(DASHBOARD_RECENTS_UPDATED_EVENT))
  } catch {
    /* ignore quota or private mode */
  }
}

export function getRecentVisits(): DashboardRecent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(DASHBOARD_RECENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((x): x is DashboardRecent => {
        if (!x || typeof x !== 'object') return false
        const o = x as Record<string, unknown>
        return (
          typeof o.href === 'string' &&
          typeof o.label === 'string' &&
          typeof o.visitedAt === 'number' &&
          o.href.startsWith('/')
        )
      })
      .slice(0, MAX_RECENTS)
  } catch {
    return []
  }
}

export function formatRecentTime(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
