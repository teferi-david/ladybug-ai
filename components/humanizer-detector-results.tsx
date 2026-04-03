'use client'

import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DETECTOR_TABS = [
  {
    id: 'gptzero',
    label: 'GPTZero',
    src: '/images/detector-results/gptzero.png',
    alt: 'GPTZero scan showing human-written result for Ladybug AI humanized text',
  },
  {
    id: 'zerogpt',
    label: 'ZeroGPT',
    src: '/images/detector-results/zerogpt.png',
    alt: 'ZeroGPT detector showing human-written result for Ladybug AI humanized text',
  },
  {
    id: 'turnitin',
    label: 'Turnitin',
    src: '/images/detector-results/turnitin.png',
    alt: 'Turnitin AI Writing report showing 0% AI-generated text',
  },
  {
    id: 'originality',
    label: 'Originality AI',
    src: '/images/detector-results/originality-ai.png',
    alt: 'Originality.ai scan showing 100% original, 0% AI detection',
  },
] as const

export function HumanizerDetectorResults() {
  return (
    <section className="border-b border-gray-100 bg-white dark:border-zinc-800 dark:bg-zinc-950" aria-labelledby="detector-results-heading">
      <div className="container mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-8 text-center">
          <h2
            id="detector-results-heading"
            className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 md:text-2xl"
          >
            What scans can look like after humanizing
          </h2>
          <p className="mt-2 text-sm text-gray-600 md:text-base">
            Pick a detector. These sample screenshots reflect humanized text; results vary by detector version
            and input.
          </p>
        </div>

        <Tabs defaultValue="gptzero" className="w-full">
          <TabsList
            className="grid h-auto w-full grid-cols-2 gap-2 bg-muted/60 p-2 sm:grid-cols-4"
            aria-label="Choose detector result"
          >
            {DETECTOR_TABS.map(({ id, label }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="min-h-[2.75rem] px-4 py-2 text-sm data-[state=active]:shadow-sm sm:flex-1 lg:flex-none"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {DETECTOR_TABS.map(({ id, src, alt }) => (
            <TabsContent key={id} value={id} className="mt-6 outline-none">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50/80 shadow-sm ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-white/10">
                <Image
                  src={src}
                  alt={alt}
                  width={1200}
                  height={780}
                  className="h-auto w-full object-contain"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority={id === 'gptzero'}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
