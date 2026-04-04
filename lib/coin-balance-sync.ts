/**
 * Keeps the navbar coin counter in sync with tool pages that fetch usage from the API
 * (same balance as Supabase users.coin_balance for non-Pro accounts).
 */
export const COIN_BALANCE_UPDATED_EVENT = 'ladybug:coin-balance-updated'

export type CoinBalanceUpdatedDetail = { balance: number }

export function broadcastCoinBalanceUpdated(balance: number | null | undefined): void {
  if (typeof window === 'undefined') return
  if (typeof balance !== 'number' || !Number.isFinite(balance)) return
  window.dispatchEvent(
    new CustomEvent<CoinBalanceUpdatedDetail>(COIN_BALANCE_UPDATED_EVENT, {
      detail: { balance },
    })
  )
}
