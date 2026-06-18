'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/loading-spinner'
import { cn } from '@/lib/utils'

type ConsideredSubscription = {
  id: string
  status: string
  periodEnd: string
  customer: string | null
  planKey: string
  hadUserMetadata: boolean
}

type RestoreResult = {
  ok: boolean
  changed: boolean
  message: string
  email: string | null
  plan: string | null
  planExpiry: string | null
  subscriptionStatus: string | null
  matchedSubscriptionId: string | null
  consideredSubscriptions: ConsideredSubscription[]
}

const GRANT_PLANS = [
  { value: 'unlimited_annual', label: 'Unlimited (annual)' },
  { value: 'unlimited_monthly', label: 'Unlimited (monthly)' },
  { value: 'basic_annual', label: 'Basic (annual)' },
  { value: 'basic_monthly', label: 'Basic (monthly)' },
] as const

type Action = 'inspect' | 'restore' | 'grant'

function fmt(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
}

export function AdminRestoreAccessClient() {
  const [ready, setReady] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [grantPlan, setGrantPlan] = useState<string>(GRANT_PLANS[0].value)
  const [grantDays, setGrantDays] = useState<number>(365)
  const [busy, setBusy] = useState<Action | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RestoreResult | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      setSignedIn(Boolean(session?.user))
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function run(action: Action) {
    setBusy(action)
    setError(null)
    setResult(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setError('Please sign in again.')
        return
      }

      const payload: Record<string, unknown> = { email: email.trim(), action }
      if (action === 'grant') {
        payload.plan = grantPlan
        payload.days = grantDays
      }

      const res = await fetch('/api/admin/restore-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status}).`)
        return
      }
      setResult(data as RestoreResult)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  if (!ready) return <LoadingSpinner />

  if (!signedIn) {
    return (
      <div className="min-h-screen px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Admin sign-in required</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
            Sign in with an authorized owner account to use this tool.
          </p>
          <Link
            href="/login?next=/admin/restore-access"
            className="mt-4 inline-block rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'
  const btnClass =
    'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <div className="min-h-screen px-4 py-10 md:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
          Restore customer access
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
          Enter a customer&apos;s email. <strong>Look up</strong> is read-only.{' '}
          <strong>Restore from Stripe</strong> re-reads their subscription and grants access if it&apos;s active.
          Use <strong>manual grant</strong> only when you know they paid but Stripe can&apos;t confirm it.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <label className="block text-sm font-medium text-gray-900 dark:text-zinc-100" htmlFor="cust-email">
            Customer email
          </label>
          <input
            id="cust-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
            className={cn(inputClass, 'mt-2')}
            autoComplete="off"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => run('inspect')}
              disabled={busy !== null || !email.trim()}
              className={cn(btnClass, 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100')}
            >
              {busy === 'inspect' ? 'Looking up…' : 'Look up (read-only)'}
            </button>
            <button
              type="button"
              onClick={() => run('restore')}
              disabled={busy !== null || !email.trim()}
              className={cn(btnClass, 'bg-violet-600 text-white hover:bg-violet-700')}
            >
              {busy === 'restore' ? 'Restoring…' : 'Restore from Stripe'}
            </button>
          </div>
        </div>

        <details className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
          <summary className="cursor-pointer text-sm font-semibold text-amber-900 dark:text-amber-300">
            Manual grant (override) — use with care
          </summary>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200/80">
            Grants a plan for a fixed number of days regardless of Stripe. Use only when you&apos;ve verified
            payment another way.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-amber-900 dark:text-amber-300" htmlFor="grant-plan">
                Plan
              </label>
              <select
                id="grant-plan"
                value={grantPlan}
                onChange={(e) => setGrantPlan(e.target.value)}
                className={cn(inputClass, 'mt-1')}
              >
                {GRANT_PLANS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-amber-900 dark:text-amber-300" htmlFor="grant-days">
                Days
              </label>
              <input
                id="grant-days"
                type="number"
                min={1}
                max={3650}
                value={grantDays}
                onChange={(e) => setGrantDays(Number(e.target.value))}
                className={cn(inputClass, 'mt-1')}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => run('grant')}
            disabled={busy !== null || !email.trim()}
            className={cn(btnClass, 'mt-3 bg-amber-600 text-white hover:bg-amber-700')}
          >
            {busy === 'grant' ? 'Granting…' : 'Grant manually'}
          </button>
        </details>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p
              className={cn(
                'text-sm font-medium',
                result.changed
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-gray-900 dark:text-zinc-100'
              )}
            >
              {result.message}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-gray-500 dark:text-zinc-500">Email</dt>
                <dd className="text-gray-900 dark:text-zinc-100">{result.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-zinc-500">Plan</dt>
                <dd className="text-gray-900 dark:text-zinc-100">{result.plan ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-zinc-500">Status</dt>
                <dd className="text-gray-900 dark:text-zinc-100">{result.subscriptionStatus ?? '—'}</dd>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-gray-500 dark:text-zinc-500">Access until</dt>
                <dd className="text-gray-900 dark:text-zinc-100">{fmt(result.planExpiry)}</dd>
              </div>
            </dl>

            <h2 className="mt-5 text-sm font-semibold text-gray-900 dark:text-zinc-100">
              Stripe subscriptions found ({result.consideredSubscriptions.length})
            </h2>
            {result.consideredSubscriptions.length === 0 ? (
              <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
                None found for this customer (by stored id or email).
              </p>
            ) : (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-gray-500 dark:text-zinc-500">
                    <tr>
                      <th className="py-1 pr-3 font-medium">Subscription</th>
                      <th className="py-1 pr-3 font-medium">Status</th>
                      <th className="py-1 pr-3 font-medium">Plan</th>
                      <th className="py-1 pr-3 font-medium">Period end</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.consideredSubscriptions.map((s) => (
                      <tr
                        key={s.id}
                        className={cn(
                          'border-t border-gray-100 dark:border-zinc-800',
                          s.id === result.matchedSubscriptionId && 'bg-emerald-50/60 dark:bg-emerald-950/20'
                        )}
                      >
                        <td className="py-1 pr-3 font-mono text-gray-700 dark:text-zinc-300">{s.id}</td>
                        <td className="py-1 pr-3 text-gray-900 dark:text-zinc-100">{s.status}</td>
                        <td className="py-1 pr-3 text-gray-900 dark:text-zinc-100">{s.planKey}</td>
                        <td className="py-1 pr-3 text-gray-700 dark:text-zinc-300">{fmt(s.periodEnd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
