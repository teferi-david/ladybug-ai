'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Tone = 'ok' | 'warn' | 'error'

type Props = {
  className?: string
  /** Called after a successful refresh with whether the account now has paid access. */
  onRefreshed?: (hasAccess: boolean) => void
}

/**
 * Lets a signed-in user re-sync their own plan from Stripe — for when they paid but the site still
 * shows them as free (e.g. a renewal/trial webhook was missed).
 */
export function RefreshSubscriptionButton({ className, onRefreshed }: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [tone, setTone] = useState<Tone | null>(null)

  async function handleClick() {
    setLoading(true)
    setMessage(null)
    setTone(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setMessage('Please sign in again.')
        setTone('error')
        return
      }

      const res = await fetch('/api/stripe/refresh-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setMessage(data.error || 'Could not refresh right now. Please try again shortly.')
        setTone('error')
        return
      }

      setMessage(data.message || 'Subscription refreshed.')
      setTone(data.hasAccess ? 'ok' : 'warn')
      onRefreshed?.(Boolean(data.hasAccess))
    } catch {
      setMessage('Network error. Please try again.')
      setTone('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={cn(
          'inline-flex w-fit items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 shadow-sm transition',
          'hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60',
          'dark:border-violet-900 dark:bg-zinc-950 dark:text-violet-300 dark:hover:bg-violet-950/40'
        )}
      >
        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden />
        {loading ? 'Checking your subscription…' : 'Refresh subscription status'}
      </button>
      {message && (
        <p
          className={cn(
            'text-sm',
            tone === 'ok' && 'text-emerald-700 dark:text-emerald-400',
            tone === 'warn' && 'text-amber-700 dark:text-amber-400',
            tone === 'error' && 'text-red-600 dark:text-red-400'
          )}
        >
          {message}
        </p>
      )}
    </div>
  )
}
