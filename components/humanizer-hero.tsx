import { HumanizerDetectorLogos } from '@/components/humanizer-detector-logos'

export function HumanizerHero() {
  return (
    <div className="border-b border-amber-200/70 bg-gradient-to-r from-amber-50/90 via-white to-rose-50/80">
      <div className="container mx-auto px-4 py-5 text-center md:py-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-900/90 md:text-xs">
          #1 AI Humanizer on the Internet
        </p>
        <HumanizerDetectorLogos />
      </div>
    </div>
  )
}
