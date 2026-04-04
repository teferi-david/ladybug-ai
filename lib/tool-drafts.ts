/**
 * Persist in-progress tool work so users can continue from the dashboard Recents section.
 */

import { normalizeHumanizeLevel, type HumanizeLevel } from '@/lib/humanize-levels'
import type { HumanizePriority } from '@/lib/humanizer-priority'

const HUMANIZER_KEY = 'ladybug-draft-humanizer-v1'
const PARAPHRASE_KEY = 'ladybug-draft-paraphraser-v1'
const CITATION_KEY = 'ladybug-draft-citation-v1'

export type HumanizerDraft = {
  input: string
  output: string
  humanizeLevel: HumanizeLevel
  priority: HumanizePriority
  updatedAt: number
}

export type ParaphraseDraft = {
  input: string
  output: string
  updatedAt: number
}

export type CitationFormData = {
  author: string
  title: string
  year: string
  publisher: string
  url: string
  accessDate: string
}

export type CitationDraft = {
  citationType: 'apa' | 'mla'
  formData: CitationFormData
  output: string
  updatedAt: number
}

function clip(s: string, max = 80): string | null {
  const t = s.trim().replace(/\s+/g, ' ')
  if (!t) return null
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

function isPriority(s: string): s is HumanizePriority {
  return s === 'balanced' || s === 'stealth'
}

export function loadHumanizerDraft(): HumanizerDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(HUMANIZER_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as Record<string, unknown>
    if (typeof o.input !== 'string' || typeof o.output !== 'string') return null
    const levelRaw = typeof o.humanizeLevel === 'string' ? o.humanizeLevel : 'basic'
    const level = normalizeHumanizeLevel(levelRaw) ?? 'basic'
    const pr = typeof o.priority === 'string' && isPriority(o.priority) ? o.priority : 'balanced'
    return {
      input: o.input,
      output: o.output,
      humanizeLevel: level,
      priority: pr,
      updatedAt: typeof o.updatedAt === 'number' ? o.updatedAt : Date.now(),
    }
  } catch {
    return null
  }
}

export function saveHumanizerDraft(draft: Omit<HumanizerDraft, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    const payload: HumanizerDraft = { ...draft, updatedAt: Date.now() }
    localStorage.setItem(HUMANIZER_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function humanizerDraftPreview(): string | null {
  const d = loadHumanizerDraft()
  if (!d) return null
  return clip(d.input) || clip(d.output)
}

export function loadParaphraseDraft(): ParaphraseDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PARAPHRASE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as Record<string, unknown>
    if (typeof o.input !== 'string' || typeof o.output !== 'string') return null
    return {
      input: o.input,
      output: o.output,
      updatedAt: typeof o.updatedAt === 'number' ? o.updatedAt : Date.now(),
    }
  } catch {
    return null
  }
}

export function saveParaphraseDraft(draft: Omit<ParaphraseDraft, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    const payload: ParaphraseDraft = { ...draft, updatedAt: Date.now() }
    localStorage.setItem(PARAPHRASE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function paraphraseDraftPreview(): string | null {
  const d = loadParaphraseDraft()
  if (!d) return null
  return clip(d.input) || clip(d.output)
}

export function loadCitationDraft(): CitationDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CITATION_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as Record<string, unknown>
    const citationType = o.citationType === 'mla' ? 'mla' : 'apa'
    const fd = o.formData as Record<string, unknown> | undefined
    if (!fd || typeof fd !== 'object') return null
    const formData: CitationFormData = {
      author: typeof fd.author === 'string' ? fd.author : '',
      title: typeof fd.title === 'string' ? fd.title : '',
      year: typeof fd.year === 'string' ? fd.year : '',
      publisher: typeof fd.publisher === 'string' ? fd.publisher : '',
      url: typeof fd.url === 'string' ? fd.url : '',
      accessDate: typeof fd.accessDate === 'string' ? fd.accessDate : '',
    }
    return {
      citationType,
      formData,
      output: typeof o.output === 'string' ? o.output : '',
      updatedAt: typeof o.updatedAt === 'number' ? o.updatedAt : Date.now(),
    }
  } catch {
    return null
  }
}

export function saveCitationDraft(draft: Omit<CitationDraft, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    const payload: CitationDraft = { ...draft, updatedAt: Date.now() }
    localStorage.setItem(CITATION_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function citationDraftPreview(): string | null {
  const d = loadCitationDraft()
  if (!d) return null
  return clip(d.formData.title) || clip(d.formData.author) || clip(d.output)
}

export function draftPreviewForHref(href: string): string | null {
  switch (href) {
    case '/humanizer':
      return humanizerDraftPreview()
    case '/paraphraser':
      return paraphraseDraftPreview()
    case '/citation':
      return citationDraftPreview()
    default:
      return null
  }
}
