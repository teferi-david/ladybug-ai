'use client'

import { useEffect, useRef, useState } from 'react'

/** Ladybug AI promo short — loads and plays when scrolled into view (muted autoplay for browser policy). */
const YOUTUBE_SHORT_ID = 'EyVwMoqsyQo'

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

  const embedSrc = `https://www.youtube.com/embed/${YOUTUBE_SHORT_ID}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`

  return (
    <section
      ref={sectionRef}
      className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/90 py-12 md:py-16"
      aria-labelledby="join-students-video-heading"
    >
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2
          id="join-students-video-heading"
          className="mx-auto max-w-5xl text-base font-bold leading-snug tracking-tight text-gray-900 sm:text-lg md:text-xl lg:text-2xl lg:whitespace-nowrap"
        >
          Join 10,000+ students already using the Ladybug AI humanizer tool!
        </h2>

        <div className="mx-auto mt-10 max-w-[280px] md:max-w-[320px]">
          <div
            className="relative overflow-hidden rounded-2xl bg-black shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/80"
            style={{ aspectRatio: '9 / 16' }}
          >
            {inView ? (
              <iframe
                title="Ladybug AI humanizer student video"
                src={embedSrc}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div
                className="flex h-full min-h-[420px] w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-gray-100 to-gray-200 px-4 text-center text-sm text-gray-500 md:min-h-[480px]"
                aria-hidden
              >
                <span className="font-medium text-gray-600">Short preview</span>
                <span className="text-xs">Video loads when you scroll here</span>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Unmute in the YouTube player if you want audio.
          </p>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
          From essays to research papers and last-minute drafts, Ladybug AI helps your writing read clearly
          and naturally. Try it for all your schoolwork and see why students choose Ladybug over generic AI
          text.
        </p>
      </div>
    </section>
  )
}
