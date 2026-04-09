'use client'

import { useEffect, useRef, useState } from 'react'

/** Ladybug AI promo shorts: load when scrolled into view (muted autoplay for browser policy). */
const TEF_PROMO_SHORT_ID = 'EyVwMoqsyQo' as const
/** Left-to-right on desktop: newest short, then Teferi's, then the other promo. */
const YOUTUBE_SHORT_IDS = ['QUNeEr9qNvQ', TEF_PROMO_SHORT_ID, 'WAzcIw23xPE'] as const

function embedUrl(id: string) {
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`
}

export function JoinStudentsVideoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
        }
      },
      { threshold: 0.28, rootMargin: '80px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="demo"
      ref={sectionRef}
      className="border-t border-white/30 bg-white/30 py-12 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/50 md:py-16"
      aria-labelledby="join-students-video-heading"
    >
      <div className="container mx-auto max-w-5xl px-4 text-center">
        <h2
          id="join-students-video-heading"
          className="mx-auto max-w-5xl text-base font-bold leading-snug tracking-tight text-gray-900 dark:text-zinc-50 sm:text-lg md:text-xl lg:text-2xl"
        >
          Join the 1.4M+ students who use Ladybug to Bypass AI detectors!
        </h2>

        <div className="mx-auto mt-10 flex w-full max-w-6xl flex-wrap items-center justify-center gap-6 md:gap-8 lg:flex-nowrap lg:gap-10">
          {YOUTUBE_SHORT_IDS.map((id, index) => (
            <div
              key={id}
              className="mx-auto w-full max-w-[280px] shrink-0 sm:max-w-[300px] md:mx-0 md:max-w-[300px] lg:max-w-[320px]"
            >
              <div
                className="relative mx-auto overflow-hidden rounded-2xl bg-black shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/80 dark:ring-zinc-700"
                style={{ aspectRatio: '9 / 16' }}
              >
                {inView ? (
                  <iframe
                    title={`Ladybug AI promo short ${index + 1}`}
                    src={embedUrl(id)}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div
                    className="flex h-full min-h-[420px] w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-gray-100 to-gray-200 px-4 text-center text-sm text-gray-500 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-400 md:min-h-[480px]"
                    aria-hidden
                  >
                    <span className="font-medium text-gray-600 dark:text-zinc-300">Short preview</span>
                    <span className="text-xs dark:text-zinc-500">Video loads when you scroll here</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-4 max-w-2xl text-xs text-gray-500 dark:text-zinc-400">
          Unmute in the YouTube player if you want audio.
        </p>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-zinc-300 md:text-lg">
          Essays, research papers, panic drafts at midnight. Ladybug nudges your writing so it reads clear and
          human instead of copy pasted from a chatbot. See why people pick it over yet another generic AI
          wall of text.
        </p>
      </div>
    </section>
  )
}
