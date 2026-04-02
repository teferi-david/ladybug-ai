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
 * Hides top nav and footer on auth flows for a focused, full-screen experience (Apple-style sign-in).
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
      <footer className="border-t border-gray-100 bg-white py-4 text-center">
        <p className="text-xs text-gray-500">
          Contact us:{' '}
          <a
            href="mailto:teferi.business@gmail.com"
            className="text-gray-600 underline underline-offset-2 hover:text-gray-900"
          >
            teferi.business@gmail.com
          </a>
        </p>
      </footer>
    </>
  )
}
