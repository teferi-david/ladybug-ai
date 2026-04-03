/**
 * User-chosen humanizer focus (stored client-side; sent with each humanize request).
 */
export type HumanizePriority = 'detector_ready' | 'natural_voice' | 'clear_concise' | 'balanced'

export const HUMANIZE_PRIORITIES: readonly {
  id: HumanizePriority
  title: string
  description: string
}[] = [
  {
    id: 'detector_ready',
    title: 'Academic and detector aware',
    description:
      'Prioritize clarity, formal structure, and phrasing that reads like careful student work.',
  },
  {
    id: 'natural_voice',
    title: 'Natural, conversational voice',
    description: 'Prioritize warmth and flow so the text sounds like someone explaining ideas in person.',
  },
  {
    id: 'clear_concise',
    title: 'Clear and concise',
    description: 'Prioritize short sentences, direct wording, and easy scanning.',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'Blend academic tone with natural rhythm. A solid default for most drafts.',
  },
] as const

export const PRIORITY_STORAGE_KEY = 'ladybug-humanizer-priority'
export const PRIORITY_SET_KEY = 'ladybug-humanizer-priority-ack'
export const WRITING_DNA_STORAGE_KEY = 'ladybug-writing-dna-samples'

export function getStoredPriority(): HumanizePriority | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(PRIORITY_STORAGE_KEY)
  if (!raw) return null
  const ok = HUMANIZE_PRIORITIES.some((p) => p.id === raw)
  return ok ? (raw as HumanizePriority) : null
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
