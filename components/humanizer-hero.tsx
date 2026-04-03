export function HumanizerHero() {
  return (
    <div className="relative overflow-hidden border-b border-white/20">
      {/* Hero background glow (Ryne-style soft blobs + liquid glass vibe) */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/90 via-white to-rose-50/40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[min(28rem,80vw)] w-[min(42rem,95vw)] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-400/35 via-rose-300/40 to-amber-300/35 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-[10%] h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-[5%] h-56 w-56 rounded-full bg-violet-400/20 blur-3xl"
        aria-hidden
      />

      <div className="container relative mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto flex max-w-3xl justify-center">
          {/* Frosted bubble */}
          <div className="liquid-glass-bubble rounded-[2rem] px-8 py-4 shadow-[0_12px_48px_rgba(0,0,0,0.08)] md:px-12 md:py-5">
            <p className="text-center text-sm font-semibold tracking-tight text-gray-900 md:text-base">
              #1 Ranked AI Humanizer
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
