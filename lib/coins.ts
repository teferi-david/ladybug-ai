import { supabaseAdmin } from '@/lib/supabase/server'

export type DeductCoinsResult =
  | { ok: true; balanceAfter: number }
  | { ok: false; reason: 'insufficient' | 'error'; balance: number }

/**
 * Deduct word credits (1 coin = 1 word).
 */
export async function tryDeductCoins(userId: string, wordCount: number): Promise<DeductCoinsResult> {
  if (wordCount <= 0) {
    const { data: row } = await supabaseAdmin.from('users').select('coin_balance').eq('id', userId).maybeSingle()
    const bal = (row as { coin_balance?: number } | null)?.coin_balance ?? 0
    return { ok: true, balanceAfter: bal }
  }
  // RPC types live in DB migration; cast until Supabase types are regenerated.
  const { data, error } = await (supabaseAdmin as unknown as { rpc: (n: string, a: object) => Promise<{ data: unknown; error: { message: string } | null }> }).rpc(
    'try_deduct_coins',
    {
      p_user_id: userId,
      p_amount: wordCount,
    }
  )
  if (error) {
    console.error('try_deduct_coins:', error)
    return { ok: false, reason: 'error', balance: 0 }
  }
  const n = typeof data === 'number' ? data : Number(data)
  if (n === -1) {
    const { data: row } = await supabaseAdmin.from('users').select('coin_balance').eq('id', userId).maybeSingle()
    const bal = row && typeof row === 'object' && 'coin_balance' in row ? Number((row as { coin_balance: number }).coin_balance) : 0
    return { ok: false, reason: 'insufficient', balance: bal }
  }
  return { ok: true, balanceAfter: n }
}

export async function refundCoins(userId: string, wordCount: number): Promise<void> {
  if (wordCount <= 0) return
  const { error } = await (supabaseAdmin as unknown as { rpc: (n: string, a: object) => Promise<{ error: { message: string } | null }> }).rpc(
    'refund_coins',
    {
      p_user_id: userId,
      p_amount: wordCount,
    }
  )
  if (error) {
    console.error('refund_coins:', error)
  }
}

export function insufficientCoinsMessage(balance: number, needed: number): string {
  return `Not enough coins. This run needs ${needed} coins (1 per word). You have ${balance}. Upgrade on the Pricing page for unlimited Pro access.`
}
