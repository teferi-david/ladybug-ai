import { Star } from 'lucide-react'

export function HumanizerHero() {
  return (
    <div className="border-b border-amber-200/70 bg-gradient-to-r from-amber-50/90 via-white to-rose-50/80">
      <div className="container mx-auto px-2 py-4 text-center md:px-4 md:py-5">
        <p
          className="inline-flex max-w-full flex-nowrap items-center justify-center gap-1 whitespace-nowrap text-[9px] font-bold uppercase leading-none tracking-[0.1em] text-amber-900/90 sm:gap-1.5 sm:text-[11px] sm:tracking-[0.14em] md:text-xs md:tracking-[0.18em]"
          title="5 Star rated Humanizer by American Students"
        >
          <span className="inline-flex shrink-0 items-center gap-px" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-2.5 w-2.5 shrink-0 fill-amber-500 text-amber-500 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5"
                strokeWidth={0}
              />
            ))}
          </span>
          <span>5 Star rated Humanizer by American Students</span>
        </p>
      </div>
    </div>
  )
}
