/**
 * Trust strip: major AI detector brands (wordmark style, grayscale) below the humanizer hero.
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
    <section
      className="border-b border-gray-200/80 bg-white"
      aria-labelledby="humanizer-detector-logos-heading"
    >
      <div className="container mx-auto px-4 py-8 md:py-10">
        <p
          id="humanizer-detector-logos-heading"
          className="mx-auto max-w-4xl text-center text-sm leading-relaxed text-gray-600 md:text-base"
        >
          Ladybug AI Humanizer is 100% guaranteed to bypass Turnitin, GPTZero, ZeroGPT and ALL major AI
          detectors, similar to Grubby AI.
        </p>
        <ul
          className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-5 md:gap-x-10 md:gap-y-6"
          aria-label="AI detector services"
        >
          {DETECTOR_BRANDS.map(({ name }) => (
            <li key={name}>
              <span className="inline-block select-none text-[11px] font-semibold tracking-tight text-gray-500 sm:text-xs md:text-sm">
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
