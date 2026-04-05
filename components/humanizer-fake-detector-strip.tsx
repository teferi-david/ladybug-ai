'use client'

import { cn } from '@/lib/utils'

/** Decorative detector row after humanize; illustrative only, not real scores. */
export function HumanizerFakeDetectorStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-zinc-300/90 bg-zinc-50/90 p-3 text-center dark:border-zinc-600 dark:bg-zinc-900/50',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span
          className="inline-flex items-center rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-bold tracking-tight text-rose-700 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
          title="Illustration only"
        >
          Turnitin
        </span>
        <span
          className="inline-flex items-center rounded-md border border-emerald-200 bg-white px-2.5 py-1 text-xs font-bold tracking-tight text-emerald-800 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200"
          title="Illustration only"
        >
          GPTZero
        </span>
        <span
          className="inline-flex items-center rounded-md border border-violet-200 bg-white px-2.5 py-1 text-xs font-bold tracking-tight text-violet-800 shadow-sm dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-200"
          title="Illustration only"
        >
          ZeroGPT
        </span>
        <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold tabular-nums text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100">
          0% AI generated
        </span>
      </div>
    </div>
  )
}
