'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Brain,
  CheckCircle2,
  Dna,
  Quote,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type DemoTabId = 'humanizer' | 'paraphraser' | 'citations' | 'mimic'

const HUMANIZER_ORIGINAL =
  'Albert Einstein (1879–1955) was a German-born theoretical physicist who is widely held to be one of the most influential scientists of the twentieth century. He is best known for developing the theory of relativity and for his mass–energy equivalence formula E = mc². In 1921 he received the Nobel Prize in Physics for his explanation of the photoelectric effect.'

const HUMANIZER_OUTPUT =
  'Albert Einstein was a physicist people still talk about today. Born in Germany in 1879, he reshaped how we think about space, time, and energy—you’ve probably seen his famous E = mc². His work on relativity changed physics, and in 1921 he won a Nobel Prize for helping explain how light can knock electrons loose from metal.'

const PARAPHRASE_ORIGINAL =
  'Due to the fact that the experiment was not conducted in a controlled environment, the results cannot be said to definitively support the hypothesis, and further replication will be necessary.'

const PARAPHRASE_OUTPUT =
  'Because the experiment wasn’t run in a controlled setting, the results don’t prove the hypothesis on their own. You’ll need more replications to be sure.'

const CITATIONS_ORIGINAL = `Rough notes:
- article about climate on nature site, 2023, Smith and Lee
- book: "Data Science Basics" by Chen, published 2021, Penguin
- webpage undated, WHO, vaccine safety FAQ`

const CITATIONS_OUTPUT = `Chen, J. (2021). Data science basics. Penguin.

Smith, L., & Lee, M. (2023). [Article title as it appears]. Nature. https://doi.org/10.xxxx/xxxxx

World Health Organization. (n.d.). Vaccine safety: Frequently asked questions. Retrieved April 4, 2026, from https://www.who.int/...`

const MIMIC_ORIGINAL =
  'The utilization of strategic frameworks can facilitate enhanced outcomes in organizational contexts. It is imperative that stakeholders engage in comprehensive dialogue to align objectives.'

const MIMIC_OUTPUT =
  'I’d rather we pick a simple plan and actually stick to it than keep stacking buzzwords. Let’s talk it through honestly so we’re aiming at the same thing—otherwise we’re just performing alignment.'

const TAB_META: {
  id: DemoTabId
  label: string
  sub: string
  icon: typeof Brain
  heading: string
  leftTitle: string
  leftBadge: string
  leftBadgeClass: string
  leftDotClass: string
  rightTitle: string
  rightBadge: string
  rightBadgeClass: string
  rightDotClass: string
  leftBorderClass: string
  rightBorderClass: string
  original: string
  output: string
  footerClass: string
  footerItems: readonly string[]
  ctaLabel: string
  ctaHref: string
  CtaIcon: typeof Brain
}[] = [
  {
    id: 'humanizer',
    label: 'Text Humanizer',
    sub: 'Bypass AI detection',
    icon: Brain,
    heading: 'Text Humanizer example',
    leftTitle: 'Original text',
    leftBadge: '100% AI',
    leftBadgeClass:
      'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300',
    leftDotClass: 'bg-red-500',
    rightTitle: 'Humanized text',
    rightBadge: '1% AI',
    rightBadgeClass:
      'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    rightDotClass: 'bg-emerald-500',
    leftBorderClass: 'border-red-100 dark:border-red-900/40',
    rightBorderClass: 'border-emerald-100 dark:border-emerald-900/40',
    original: HUMANIZER_ORIGINAL,
    output: HUMANIZER_OUTPUT,
    footerClass: 'text-emerald-800 dark:text-emerald-300',
    footerItems: ['Bypasses Turnitin', 'Bypasses GPTZero'] as const,
    ctaLabel: 'Try Text Humanizer',
    ctaHref: '/register?next=%2Fhumanizer',
    CtaIcon: Brain,
  },
  {
    id: 'paraphraser',
    label: 'Paraphraser',
    sub: 'Same meaning, clearer phrasing',
    icon: RefreshCw,
    heading: 'Paraphraser example',
    leftTitle: 'Original text',
    leftBadge: 'Dense draft',
    leftBadgeClass:
      'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    leftDotClass: 'bg-amber-500',
    rightTitle: 'Paraphrased text',
    rightBadge: 'Readable',
    rightBadgeClass:
      'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
    rightDotClass: 'bg-sky-500',
    leftBorderClass: 'border-amber-100 dark:border-amber-900/40',
    rightBorderClass: 'border-sky-100 dark:border-sky-900/40',
    original: PARAPHRASE_ORIGINAL,
    output: PARAPHRASE_OUTPUT,
    footerClass: 'text-sky-800 dark:text-sky-300',
    footerItems: ['Keeps your meaning', 'Adjust tone & length'] as const,
    ctaLabel: 'Try Paraphraser',
    ctaHref: '/register?next=%2Fparaphraser',
    CtaIcon: RefreshCw,
  },
  {
    id: 'citations',
    label: 'Citations',
    sub: 'APA & MLA formatting',
    icon: Quote,
    heading: 'Citations example',
    leftTitle: 'Messy sources',
    leftBadge: 'Unformatted',
    leftBadgeClass:
      'bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
    leftDotClass: 'bg-orange-500',
    rightTitle: 'Formatted citations',
    rightBadge: 'Ready to paste',
    rightBadgeClass:
      'bg-violet-50 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300',
    rightDotClass: 'bg-violet-500',
    leftBorderClass: 'border-orange-100 dark:border-orange-900/40',
    rightBorderClass: 'border-violet-100 dark:border-violet-900/40',
    original: CITATIONS_ORIGINAL,
    output: CITATIONS_OUTPUT,
    footerClass: 'text-violet-800 dark:text-violet-300',
    footerItems: ['APA & MLA styles', 'In-text + references'] as const,
    ctaLabel: 'Try Citations',
    ctaHref: '/register?next=%2Fcitation',
    CtaIcon: Quote,
  },
  {
    id: 'mimic',
    label: 'Mimic',
    sub: 'Match your writing voice',
    icon: Dna,
    heading: 'Mimic example',
    leftTitle: 'Generic draft',
    leftBadge: 'Not you',
    leftBadgeClass:
      'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    leftDotClass: 'bg-zinc-500',
    rightTitle: 'In your voice',
    rightBadge: 'Writing DNA',
    rightBadgeClass:
      'bg-fuchsia-50 text-fuchsia-800 dark:bg-fuchsia-950/60 dark:text-fuchsia-300',
    rightDotClass: 'bg-fuchsia-500',
    leftBorderClass: 'border-zinc-200 dark:border-zinc-700',
    rightBorderClass: 'border-fuchsia-100 dark:border-fuchsia-900/40',
    original: MIMIC_ORIGINAL,
    output: MIMIC_OUTPUT,
    footerClass: 'text-fuchsia-800 dark:text-fuchsia-300',
    footerItems: ['Trains on your samples', 'Sounds exactly like you'] as const,
    ctaLabel: 'Try Humanizer + Mimic',
    ctaHref: '/register?next=%2Fhumanizer',
    CtaIcon: Dna,
  },
]

/**
 * Static marketing comparison for logged-out visitors (no API calls).
 */
export function HumanizerDemoExample() {
  const [activeId, setActiveId] = useState<DemoTabId>('humanizer')
  const active = TAB_META.find((t) => t.id === activeId) ?? TAB_META[0]
  const CtaIcon = active.CtaIcon

  return (
    <section
      id="humanizer-tool"
      className="relative py-8 md:py-12"
      aria-labelledby="humanizer-demo-heading"
    >
      <div className="container mx-auto max-w-5xl px-4">
        <div className="rounded-[2rem] border border-violet-200/80 bg-gradient-to-br from-violet-100/90 via-white to-fuchsia-50/80 p-4 shadow-[0_20px_60px_rgba(139,92,246,0.12)] dark:border-violet-500/30 dark:from-zinc-900 dark:via-zinc-950 dark:to-violet-950/40 dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] md:p-8">
          <h2 id="humanizer-demo-heading" className="sr-only">
            {active.heading}
          </h2>

          <div
            className="mb-8 flex flex-wrap justify-center gap-2 border-b border-violet-100/80 pb-4 md:gap-4"
            role="tablist"
            aria-label="Tool examples"
          >
            {TAB_META.map((t) => {
              const Icon = t.icon
              const isActive = t.id === activeId
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`demo-tab-${t.id}`}
                  aria-controls={`demo-panel-${t.id}`}
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    'flex min-w-[140px] flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-center transition sm:min-w-[160px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950',
                    isActive &&
                      'bg-white/80 shadow-sm ring-1 ring-violet-200/80 dark:bg-zinc-800/90 dark:ring-violet-500/40'
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      isActive
                        ? 'text-violet-800 dark:text-violet-200'
                        : 'text-gray-600 dark:text-zinc-400'
                    )}
                  >
                    {t.label}
                  </span>
                  <span className="text-[11px] leading-tight text-gray-500 dark:text-zinc-500">
                    {t.sub}
                  </span>
                </button>
              )
            })}
          </div>

          <div
            role="tabpanel"
            id={`demo-panel-${active.id}`}
            aria-labelledby={`demo-tab-${active.id}`}
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div
                className={cn(
                  'flex flex-col rounded-2xl border bg-white/90 p-4 shadow-sm dark:bg-zinc-900/80',
                  active.leftBorderClass
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-zinc-50">
                    <span
                      className={cn('h-2 w-2 rounded-full', active.leftDotClass)}
                      aria-hidden
                    />
                    {active.leftTitle}
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      active.leftBadgeClass
                    )}
                  >
                    {active.leftBadge}
                  </span>
                </div>
                <p className="min-h-[180px] flex-1 whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm leading-relaxed text-gray-700 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-200">
                  {active.original}
                </p>
              </div>

              <div
                className={cn(
                  'flex flex-col rounded-2xl border bg-white/90 p-4 shadow-sm dark:bg-zinc-900/80',
                  active.rightBorderClass
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-zinc-50">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        active.rightDotClass
                      )}
                      aria-hidden
                    />
                    {active.rightTitle}
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      active.rightBadgeClass
                    )}
                  >
                    {active.rightBadge}
                  </span>
                </div>
                <p className="min-h-[180px] flex-1 whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm leading-relaxed text-gray-700 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-200">
                  {active.output}
                </p>
              </div>
            </div>

            <div
              className={cn(
                'mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium',
                active.footerClass
              )}
            >
              {active.footerItems.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    className="h-3.5 w-3.5 shrink-0 opacity-90"
                    aria-hidden
                  />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href={active.ctaHref}
                className="group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-full border border-violet-200 bg-white px-10 py-3 text-sm font-semibold text-violet-900 shadow-[0_12px_40px_rgba(139,92,246,0.35)] transition hover:bg-violet-50 dark:border-violet-500/40 dark:bg-zinc-900 dark:text-violet-100 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] dark:hover:bg-violet-950/80"
              >
                <CtaIcon
                  className="h-5 w-5 text-violet-700 dark:text-violet-300"
                  aria-hidden
                />
                <span>{active.ctaLabel}</span>
              </Link>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500 dark:text-zinc-400">
            Sign up free to use every tool. This page shows a sample only.
          </p>
        </div>
      </div>
    </section>
  )
}
