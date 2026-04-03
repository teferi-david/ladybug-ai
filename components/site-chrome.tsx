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
    <>
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      <footer className="border-t border-white/40 bg-gradient-to-b from-white/50 to-slate-50/60 py-6 text-center backdrop-blur-md">
        <p className="text-xs text-gray-500">
          Contact:{' '}
          <a
            href="mailto:teferi.business@gmail.com"
            className="font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900"
          >
            teferi.business@gmail.com
          </a>
        </p>
      </footer>
    </>
  )
}
