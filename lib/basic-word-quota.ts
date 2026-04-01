import { supabaseServer } from '@/lib/supabaseServer'
import { BASIC_YEARLY_WORD_CAP, isBasicPlanKey } from '@/lib/stripe-plans'
import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

const MS_PER_DAY = 24 * 60 * 60 * 1000
const ROLLING_YEAR_MS = 365 * MS_PER_DAY

function needsYearReset(user: UserRow): boolean {
  const start = user.basic_words_year_start
  if (!start) return false
  return Date.now() - new Date(start).getTime() >= ROLLING_YEAR_MS
}

/**
 * Ensures rolling 365-day window is applied (Basic only). Mutates DB when period rolls over.
 */
export async function ensureBasicYearReset(userId: string, row: UserRow): Promise<UserRow> {
  if (!isBasicPlanKey(row.current_plan)) return row

  if (!row.basic_words_year_start) {
    const now = new Date().toISOString()
    await supabaseServer
      .from('users')
      .update({
        basic_words_year_start: now,
        basic_words_yearly_used: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
    return { ...row, basic_words_year_start: now, basic_words_yearly_used: 0 }
  }

  if (needsYearReset(row)) {
    const now = new Date().toISOString()
    await supabaseServer
      .from('users')
      .update({
        basic_words_year_start: now,
        basic_words_yearly_used: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
    return { ...row, basic_words_year_start: now, basic_words_yearly_used: 0 }
  }

  return row
}

export function countWords(text: string): number {
  const t = text.trim()
  if (!t) return 0
  return t.split(/\s+/).filter((w) => w.length > 0).length
}

/** Sum word counts from string fields (e.g. citation form). */
export function countWordsFromRecord(obj: Record<string, unknown>): number {
  let n = 0
  for (const v of Object.values(obj)) {
    if (typeof v === 'string') n += countWords(v)
  }
  return n
}

export async function checkBasicWordQuota(
  userId: string,
  row: UserRow,
  wordCount: number
): Promise<{ ok: true; row: UserRow } | { ok: false; message: string; remaining: number }> {
  if (!isBasicPlanKey(row.current_plan)) {
    return { ok: true, row }
  }

  const fresh = await ensureBasicYearReset(userId, row)
  const used = fresh.basic_words_yearly_used ?? 0
  const remaining = Math.max(0, BASIC_YEARLY_WORD_CAP - used)

  if (used + wordCount > BASIC_YEARLY_WORD_CAP) {
    return {
      ok: false,
      message: `Your Basic plan includes up to ${BASIC_YEARLY_WORD_CAP.toLocaleString()} words per year. Upgrade to Unlimited for no word cap.`,
      remaining,
    }
  }

  return { ok: true, row: fresh }
}

export async function incrementBasicWordsUsed(userId: string, wordCount: number): Promise<void> {
  const { data: row } = await supabaseServer.from('users').select('*').eq('id', userId).maybeSingle()
  if (!row || !isBasicPlanKey(row.current_plan)) return

  const fresh = await ensureBasicYearReset(userId, row)
  const next = (fresh.basic_words_yearly_used ?? 0) + wordCount

  await supabaseServer
    .from('users')
    .update({
      basic_words_yearly_used: next,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
}
