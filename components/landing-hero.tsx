import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { LogoMark } from '@/components/logo-mark'

/**
 * Ryne-style hero: badge, floating logo (shadow only), split headline, CTAs, trust metrics.
 * Stats use honest positioning (no fabricated “2.3M” or “99.9%” unless you have data).
 */
export function LandingHero() {
  return (
    <section className="relative px-4 pb-10 pt-4 md:pb-16 md:pt-6" aria-labelledby="landing-hero-title">
      <div className="mx-auto max-w-4xl text-center">
        {/* Small badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-md dark:border-primary/40 dark:bg-primary/20 dark:text-rose-200 md:text-sm">
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>#1 Ranked AI Humanizer</span>
        </div>

        {/* Floating logo (site asset + drop shadow only; no ring or glass circle) */}
        <div className="relative mx-auto mb-8 flex justify-center px-2">
          <LogoMark
            size={220}
            alt=""
            className="h-[min(9.5rem,42vw)] w-[min(9.5rem,42vw)] md:h-[min(12rem,36vw)] md:w-[min(12rem,36vw)]"
            priority
          />
        </div>

        <h1
          id="landing-hero-title"
          className="text-balance text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 md:text-5xl md:leading-[1.1]"
        >
          Ladybug: #1 AI Humanizer
          <span className="block bg-gradient-to-r from-primary via-rose-600 to-amber-600 bg-clip-text text-transparent md:inline md:pl-2">
            &amp; undetectable AI tools
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-gray-600 dark:text-zinc-300 md:text-lg">
          Trusted by students for natural rewrites. Free AI humanizer with fair daily limits, Paraphraser, and
          APA/MLA citations. Tuned for workflows where Turnitin and GPTZero matter. Start free, upgrade when you
          need more words and Pro modes.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/register?next=%2Fdashboard"
            className="group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-full border border-white/60 bg-white/80 px-8 py-3 text-sm font-semibold text-gray-900 shadow-[0_12px_40px_rgba(230,57,70,0.25)] backdrop-blur-xl transition hover:bg-white dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] dark:hover:bg-zinc-800"
          >
            <span
              className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-rose-400/30 via-fuchsia-400/20 to-amber-300/30 blur-xl"
              aria-hidden
            />
            <span className="relative">Try Ladybug free</span>
            <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <a
            href="#humanizer-tool"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-800/90 bg-gray-900 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 dark:border-zinc-100/20 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            View demo
          </a>
        </div>

        {/* Trust metrics (honest, Ryne-style layout) */}
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-white/50 bg-white/45 p-1 shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur-2xl dark:border-zinc-700/80 dark:bg-zinc-900/70 dark:shadow-[0_8px_40px_rgba(0,0,0,0.35)] md:mt-14">
          <div className="grid grid-cols-3 divide-x divide-gray-200/60 rounded-[1.15rem] py-5 dark:divide-zinc-700">
            <div className="px-2 text-center">
              <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-zinc-50 md:text-2xl">10,000+</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-400 md:text-xs">
                Students
              </p>
            </div>
            <div className="px-2 text-center">
              <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-zinc-50 md:text-2xl">3</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-400 md:text-xs">
                Humanizer modes
              </p>
            </div>
            <div className="px-2 text-center">
              <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-zinc-50 md:text-2xl">3+</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-400 md:text-xs">
                Writing tools
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
