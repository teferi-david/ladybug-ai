/**
 * Trust strip: major AI detector brands (wordmark style) below the #1 hero line.
 */
/** Display strings mirror common brand styling (case as typically shown). */
const DETECTOR_BRANDS = [
  { name: 'Originality.ai' },
  { name: 'COPYLEAKS' },
  { name: 'writefull' },
  { name: 'ZeroGPT' },
  { name: 'AISEO' },
  { name: 'Content at Scale' },
  { name: 'GPTZero' },
  { name: 'turnitin' },
  { name: 'winston ai' },
] as const

export function HumanizerDetectorLogos() {
  return (
    <div
      className="mt-5 border-t border-amber-200/60 pt-6 md:mt-6 md:pt-7"
      aria-labelledby="humanizer-detector-logos-heading"
    >
      <p
        id="humanizer-detector-logos-heading"
        className="mx-auto max-w-4xl text-center text-sm leading-relaxed text-gray-700 md:text-base"
      >
        Ladybug AI Humanizer is 100% guaranteed to bypass Turnitin, GPTZero, ZeroGPT and ALL major AI
        detectors, similar to Grubby AI.
      </p>
      <ul
        className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-4 md:mt-7 md:gap-x-10 md:gap-y-5"
        aria-label="AI detector services"
      >
        {DETECTOR_BRANDS.map(({ name }) => (
          <li key={name}>
            <span className="inline-block select-none text-[11px] font-semibold tracking-tight text-gray-600 sm:text-xs md:text-sm">
              {name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
