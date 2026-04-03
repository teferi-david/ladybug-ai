/**
 * User-chosen humanizer focus (stored client-side; sent with each humanize request).
 */
export type HumanizePriority = 'balanced' | 'stealth'

export const HUMANIZE_PRIORITIES: readonly {
  id: HumanizePriority
  title: string
  description: string
}[] = [
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'Natural rhythm with clear structure—good default for most drafts.',
  },
  {
    id: 'stealth',
    title: 'Stealth',
    description: 'Stronger emphasis on varied phrasing and lower “AI-like” patterns for detector-style checks.',
  },
] as const

const LEGACY_IDS = new Set([
  'detector_ready',
  'natural_voice',
  'clear_concise',
])

export const PRIORITY_STORAGE_KEY = 'ladybug-humanizer-priority'
export const PRIORITY_SET_KEY = 'ladybug-humanizer-priority-ack'
export const WRITING_DNA_STORAGE_KEY = 'ladybug-writing-dna-samples'

export function getStoredPriority(): HumanizePriority | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(PRIORITY_STORAGE_KEY)
  if (!raw) return null
  if (raw === 'balanced' || raw === 'stealth') return raw
  if (LEGACY_IDS.has(raw)) return 'balanced'
  return null
}

export function getStoredWritingDna(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(WRITING_DNA_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
  } catch {
    return []
  }
}

export function setStoredPriority(p: HumanizePriority) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PRIORITY_STORAGE_KEY, p)
  localStorage.setItem(PRIORITY_SET_KEY, '1')
}

export function hasCompletedPriorityOnboarding(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(PRIORITY_SET_KEY) === '1'
}

export function setStoredWritingDna(samples: string[]) {
  if (typeof window === 'undefined') return
  const trimmed = samples.map((s) => s.trim()).filter(Boolean).slice(0, 8)
  localStorage.setItem(WRITING_DNA_STORAGE_KEY, JSON.stringify(trimmed))
}
