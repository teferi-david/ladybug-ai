'use client'

import Link from 'next/link'
import { Brain, CheckCircle2, Feather, MessageCircle, ScrollText } from 'lucide-react'
import { cn } from '@/lib/utils'

const ORIGINAL =
  'Albert Einstein (1879–1955) was a German-born theoretical physicist who is widely held to be one of the most influential scientists of the twentieth century. He is best known for developing the theory of relativity and for his mass–energy equivalence formula E = mc². In 1921 he received the Nobel Prize in Physics for his explanation of the photoelectric effect.'

const HUMANIZED =
  'Albert Einstein was a physicist people still talk about today. Born in Germany in 1879, he reshaped how we think about space, time, and energy—you’ve probably seen his famous E = mc². His work on relativity changed physics, and in 1921 he won a Nobel Prize for helping explain how light can knock electrons loose from metal.'

const tabs = [
  { id: 'humanizer', label: 'Text Humanizer', sub: 'Bypass AI Detection', icon: Brain, active: true },
  { id: 'chat', label: 'Ladybug Chat', sub: 'Smart study assistant', icon: MessageCircle, active: false },
  { id: 'essay', label: 'Essay Composer', sub: 'Research & write essays', icon: Feather, active: false },
  { id: 'lecture', label: 'Lecture Lab', sub: 'Lectures to study material', icon: ScrollText, active: false },
] as const

/**
 * Static marketing comparison for logged-out visitors (no API calls).
 */
export function HumanizerDemoExample() {
  return (
    <section
      id="humanizer-tool"
      className="relative py-8 md:py-12"
      aria-labelledby="humanizer-demo-heading"
    >
      <div className="container mx-auto max-w-5xl px-4">
        <div className="rounded-[2rem] border border-violet-200/80 bg-gradient-to-br from-violet-100/90 via-white to-fuchsia-50/80 p-4 shadow-[0_20px_60px_rgba(139,92,246,0.12)] dark:border-violet-500/30 dark:from-zinc-900 dark:via-zinc-950 dark:to-violet-950/40 dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] md:p-8">
          <h2 id="humanizer-demo-heading" className="sr-only">
            Text Humanizer example
          </h2>

          {/* Tool tabs (visual only for guests) */}
          <div className="mb-8 flex flex-wrap justify-center gap-2 border-b border-violet-100/80 pb-4 md:gap-4">
            {tabs.map((t) => {
              const Icon = t.icon
              return (
                <div
                  key={t.id}
                  className={cn(
                    'flex min-w-[140px] flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-center sm:min-w-[160px]',
                    t.active &&
                      'bg-white/80 shadow-sm ring-1 ring-violet-200/80 dark:bg-zinc-800/90 dark:ring-violet-500/40'
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      t.active ? 'text-violet-800 dark:text-violet-200' : 'text-gray-600 dark:text-zinc-400'
                    )}
                  >
                    {t.label}
                  </span>
                  <span className="text-[11px] leading-tight text-gray-500 dark:text-zinc-500">{t.sub}</span>
                </div>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-red-100 bg-white/90 p-4 shadow-sm dark:border-red-900/40 dark:bg-zinc-900/80">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-zinc-50">
                  <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
                  Original text
                </div>
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                  100% AI
                </span>
              </div>
              <p className="min-h-[180px] flex-1 rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm leading-relaxed text-gray-700 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-200">
                {ORIGINAL}
              </p>
            </div>

            <div className="flex flex-col rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-zinc-900/80">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-zinc-50">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                  Humanized text
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  1% AI
                </span>
              </div>
              <p className="min-h-[180px] flex-1 rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm leading-relaxed text-gray-700 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-200">
                {HUMANIZED}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              Bypasses Turnitin
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              Bypasses GPTZero
            </span>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/register?next=%2Fdashboard"
              className="group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-full border border-violet-200 bg-white px-10 py-3 text-sm font-semibold text-violet-900 shadow-[0_12px_40px_rgba(139,92,246,0.35)] transition hover:bg-violet-50 dark:border-violet-500/40 dark:bg-zinc-900 dark:text-violet-100 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] dark:hover:bg-violet-950/80"
            >
              <Brain className="h-5 w-5 text-violet-700 dark:text-violet-300" aria-hidden />
              <span>Try Text Humanizer</span>
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500 dark:text-zinc-400">
            Sign up free to use every tool. This page shows a sample only.
          </p>
        </div>
      </div>
    </section>
  )
}
