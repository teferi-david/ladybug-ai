/**
 * Trust strip: detector guarantee + major AI detector brands (wordmark style).
 * Rendered below the YouTube short on the home humanizer flow.
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
    <div aria-labelledby="humanizer-detector-logos-heading">
      <p
        id="humanizer-detector-logos-heading"
        className="mx-auto max-w-4xl text-center text-sm leading-relaxed text-gray-700 dark:text-zinc-300 md:text-base"
      >
        Ladybug is built to align with how Turnitin, GPTZero, ZeroGPT, and similar systems evaluate text
        (in the same category as tools like Grubby AI). No product can guarantee a fixed score on every run,
        but we focus on strong, natural rewrites you can review with confidence.
      </p>
      <ul
        className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-4 md:mt-7 md:gap-x-10 md:gap-y-5"
        aria-label="AI detector services"
      >
        {DETECTOR_BRANDS.map(({ name }) => (
          <li key={name}>
            <span className="inline-block select-none text-[11px] font-semibold tracking-tight text-gray-600 dark:text-zinc-400 sm:text-xs md:text-sm">
              {name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
