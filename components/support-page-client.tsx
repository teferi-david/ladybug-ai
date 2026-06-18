'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { RefreshSubscriptionButton } from '@/components/refresh-subscription-button'
import { CreditCard, KeyRound, LifeBuoy, RefreshCw, Receipt, ExternalLink } from 'lucide-react'

const SUPPORT_EMAIL = 'teferi.business@gmail.com'

export function SupportPageClient() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!cancelled) setSignedIn(Boolean(session?.user))
    })()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(Boolean(session?.user)))
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  async function openBillingPortal() {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setPortalError('Please sign in first to manage your billing.')
        return
      }
      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPortalError(data.message || data.error || 'Could not open the billing portal.')
        return
      }
      if (data.url) window.location.href = data.url
    } catch {
      setPortalError('Network error. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-black">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
            <LifeBuoy className="h-4 w-4" aria-hidden /> Support &amp; Help Center
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900 dark:text-zinc-50 md:text-4xl">
            How can we help?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-zinc-300">
            Most issues can be solved right here in a few clicks. Email us only if these options don&apos;t
            resolve it.
          </p>
        </div>

        <div className="mt-10 space-y-5">
          {/* Paid but no access */}
          <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-zinc-50">
              <RefreshCw className="h-5 w-5 text-violet-600" aria-hidden />
              I paid but don&apos;t have access
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-zinc-300">
              If the site shows you as Free even though you subscribed, re-sync your subscription from Stripe.
              This restores access right away in most cases.
            </p>
            {signedIn ? (
              <RefreshSubscriptionButton className="mt-4" />
            ) : (
              <div className="mt-4">
                <Button asChild variant="outline">
                  <Link href="/login?next=/support">Sign in to re-sync</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Manage / cancel subscription */}
          <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-zinc-50">
              <CreditCard className="h-5 w-5 text-violet-600" aria-hidden />
              Manage or cancel my subscription
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-zinc-300">
              Update your card, view invoices, or cancel future billing in the secure Stripe portal.
              Cancelling stops the next charge — you keep access until your current period ends.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {signedIn ? (
                <Button type="button" onClick={openBillingPortal} disabled={portalLoading} className="gap-2">
                  {portalLoading ? 'Opening…' : 'Manage subscription'}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/login?next=/support">Sign in to manage billing</Link>
                </Button>
              )}
              <Button asChild variant="ghost">
                <Link href="/settings">Open Settings</Link>
              </Button>
            </div>
            {portalError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{portalError}</p>
            )}
          </section>

          {/* Refunds */}
          <section
            id="refunds"
            className="scroll-mt-24 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-zinc-50">
              <Receipt className="h-5 w-5 text-amber-600" aria-hidden />
              Refunds
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
              All subscription payments are <strong>final and non-refundable</strong>. Ladybug AI offers a
              low-cost 1-day trial so you can evaluate the service before recurring billing begins. When the
              trial ends, your subscription starts and your payment method is charged. Because your account
              keeps full access to the service after the trial, these charges are considered payment for
              services rendered and are not eligible for refunds.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
              To avoid being charged for a period you don&apos;t want, <strong>cancel before your next billing
              date</strong> using <span className="font-medium">Manage subscription</span> above. Cancelling
              stops future charges while keeping access until the current period ends.
            </p>
          </section>

          {/* Account & login */}
          <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-zinc-50">
              <KeyRound className="h-5 w-5 text-violet-600" aria-hidden />
              Account &amp; login help
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600 dark:text-zinc-300">
              <li>
                <span className="font-medium text-gray-900 dark:text-zinc-100">Forgot your password?</span>{' '}
                <Link href="/forgot-password" className="text-primary underline underline-offset-4">
                  Reset it here
                </Link>
                .
              </li>
              <li>
                <span className="font-medium text-gray-900 dark:text-zinc-100">Can&apos;t sign in?</span> Make
                sure you&apos;re using the same email (and Google vs. password method) you signed up with.
              </li>
              <li>
                <span className="font-medium text-gray-900 dark:text-zinc-100">
                  Subscribed with a different email?
                </span>{' '}
                Email us from both addresses so we can link them.
              </li>
            </ul>
          </section>

          {/* How billing works */}
          <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
              How the trial &amp; billing work
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-zinc-300">
              You start with a low-cost 1-day trial that unlocks higher word limits, unlimited runs, and the
              Paraphraser and Citations tools. When the trial ends, your chosen plan begins and you&apos;re
              billed automatically until you cancel. See{' '}
              <Link href="/pricing" className="text-primary underline underline-offset-4">
                Pricing
              </Link>{' '}
              for current plans.
            </p>
          </section>

          {/* Contact — kept intentionally subtle so self-service comes first */}
          <div className="pt-2 text-center">
            {!showEmail ? (
              <button
                type="button"
                onClick={() => setShowEmail(true)}
                className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 dark:text-zinc-600 dark:hover:text-zinc-400"
              >
                Still need help?
              </button>
            ) : (
              <p className="text-[11px] leading-relaxed text-gray-400 dark:text-zinc-600">
                Email{' '}
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Ladybug%20AI%20support`}
                  className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-zinc-400"
                >
                  {SUPPORT_EMAIL}
                </a>{' '}
                with your account email and a short description.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
