'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'

const MINIMAL_CHROME_PREFIXES = ['/login', '/register', '/forgot-password']

function isMinimalAuthChrome(pathname: string): boolean {
  return MINIMAL_CHROME_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

/**
 * Hides top nav and footer on auth flows for a simple full screen sign in.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const minimal = isMinimalAuthChrome(pathname)

  if (minimal) {
    return (
      <div className="flex min-h-[100dvh] flex-1 flex-col bg-background">{children}</div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Slow-moving red / rose ambient layer (liquid glass site background) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/95 via-white to-amber-50/40 dark:from-zinc-950 dark:via-black dark:to-zinc-950" />
        <div className="ambient-orb ambient-orb-1 absolute -left-1/4 top-0 h-[min(70vh,600px)] w-[min(90vw,700px)] rounded-full bg-gradient-to-br from-rose-400/35 via-rose-300/25 to-transparent blur-3xl dark:from-violet-900/25 dark:via-rose-900/15 dark:to-transparent" />
        <div className="ambient-orb ambient-orb-2 absolute -right-1/4 bottom-0 h-[min(60vh,520px)] w-[min(85vw,640px)] rounded-full bg-gradient-to-tl from-rose-500/30 via-primary/20 to-amber-200/20 blur-3xl dark:from-primary/15 dark:via-zinc-900/40 dark:to-transparent" />
        <div className="ambient-orb ambient-orb-3 absolute left-1/3 top-1/2 h-[min(50vh,420px)] w-[min(70vw,500px)] -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-300/20 to-fuchsia-300/15 blur-3xl dark:opacity-40" />
      </div>

      <Navbar />
      <main className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</main>
      <footer className="relative z-10 border-t border-white/40 bg-white/40 py-6 text-center backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/60">
        <p className="text-xs text-gray-500 dark:text-zinc-500">
          Contact:{' '}
          <a
            href="mailto:teferi.business@gmail.com"
            className="font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-white"
          >
            teferi.business@gmail.com
          </a>
        </p>
      </footer>
    </div>
  )
}
