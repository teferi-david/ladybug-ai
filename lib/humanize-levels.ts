/** Humanize modes: Basic + Advanced are free (daily limits apply); Academic is paid-only. */
export type HumanizeLevel = 'basic' | 'advanced' | 'academic'

export const HUMANIZE_LEVELS: readonly HumanizeLevel[] = ['basic', 'advanced', 'academic']

/** Backward compatibility for older clients sending legacy level names. */
const LEGACY_TO_LEVEL: Record<string, HumanizeLevel> = {
  basic: 'basic',
  advanced: 'advanced',
  academic: 'academic',
  highschool: 'basic',
  college: 'advanced',
  graduate: 'academic',
}

export function normalizeHumanizeLevel(raw: string | undefined): HumanizeLevel | null {
  if (!raw || typeof raw !== 'string') return null
  return LEGACY_TO_LEVEL[raw] ?? null
}

/** Only Academic (Turnitin) requires a paid plan. */
export function isProOnlyHumanizeLevel(level: HumanizeLevel): boolean {
  return level === 'academic'
}
