'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import { ArrowRight, BookOpen, ChevronDown, Menu, Quote, RefreshCw, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoMark } from '@/components/logo-mark'

const toolsItems = [
  { href: '/', label: 'AI Humanizer', description: 'Humanize AI text', icon: Sparkles },
  { href: '/paraphraser', label: 'Paraphraser', description: 'Rephrase with clarity', icon: RefreshCw },
  { href: '/citation', label: 'Citations', description: 'APA & MLA', icon: Quote },
  { href: '/bypass-turnitin', label: 'Turnitin guide', description: 'Detection & integrity', icon: BookOpen },
] as const

function NavLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  const pathname = usePathname() ?? ''
  const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
  return (
    <Link
      href={href}
      className={cn(
        'text-xs font-medium text-gray-700 transition-colors hover:text-gray-900 lg:text-sm',
        active && 'text-primary',
        className
      )}
    >
      {children}
    </Link>
  )
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (!session?.user) {
        setIsPremium(false)
        return
      }
      const { data: row } = await supabase
        .from('users')
        .select('current_plan, plan_expiry, subscription_status, uses_left')
        .eq('id', session.user.id)
        .single()
      setIsPremium(hasProHumanizeAccess(row))
    }

    load()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const showPricingCta = !user || !isPremium

  return (
    <header className="sticky top-0 z-50 flex justify-center px-3 pt-3 md:px-4 md:pt-4">
      <div className="liquid-glass-nav mx-auto flex w-full max-w-[min(40rem,calc(100%-1.5rem))] items-center justify-between gap-2 rounded-full border border-white/55 bg-white/50 px-2.5 py-1.5 shadow-[0_8px_40px_rgba(230,57,70,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl sm:px-4 sm:py-2">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-lg p-0.5 ring-offset-2 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <div className="relative flex h-8 w-8 items-center justify-center sm:h-9 sm:w-9">
            <LogoMark size={40} className="h-full w-full" priority />
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex md:gap-1 lg:gap-4" aria-label="Main">
          <NavLink href="/about">About</NavLink>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-1 text-xs font-medium text-gray-700 outline-none transition-colors hover:bg-black/[0.04] hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=open]:bg-black/[0.05] lg:text-sm'
              )}
            >
              Tools
              <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[14rem]">
              {toolsItems.map(({ href, label, description, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href} className="flex cursor-pointer items-start gap-3 py-2.5">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-900">{label}</span>
                      <span className="text-xs font-normal text-gray-500">{description}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/ai-humanizer">Blog</NavLink>

          {user ? (
            <div className="ml-1 flex items-center gap-1.5 border-l border-gray-200/80 pl-3 lg:ml-3 lg:gap-2 lg:pl-4">
              {showPricingCta && (
                <ProUpgradeButton asChild size="sm" className="min-h-8 rounded-full px-3 text-[11px] shadow-sm lg:min-h-9 lg:px-4 lg:text-xs">
                  <Link href="/pricing">Start for free</Link>
                </ProUpgradeButton>
              )}
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="h-8 rounded-full px-2 text-xs text-gray-700 lg:h-9">
                  Settings
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full border-gray-200/80 px-2 text-xs lg:h-9"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="ml-1 flex items-center gap-1.5 border-l border-gray-200/80 pl-3 lg:ml-3 lg:gap-2 lg:pl-4">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 rounded-full px-2 text-xs text-gray-700 lg:h-9">
                  Login
                </Button>
              </Link>
              <Link
                href="/register"
                className="inline-flex h-8 min-h-0 items-center gap-1 rounded-full border border-white/60 bg-white/70 px-3 text-[11px] font-semibold text-gray-900 shadow-sm backdrop-blur-sm transition hover:bg-white lg:h-9 lg:gap-1.5 lg:px-4 lg:text-xs"
              >
                Get started
                <ArrowRight className="h-3 w-3 lg:h-3.5 lg:w-3.5" aria-hidden />
              </Link>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {!user && (
            <Link
              href="/register"
              className="inline-flex min-h-9 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Start
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="liquid-glass-nav mx-auto mt-2 w-full max-w-[min(40rem,calc(100%-1.5rem))] rounded-2xl border border-white/50 bg-white/70 p-4 shadow-xl backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/about"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-black/[0.04]"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Tools</p>
            {toolsItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl px-3 py-2.5 text-sm text-gray-800 hover:bg-black/[0.04]"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/pricing"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-black/[0.04]"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/ai-humanizer"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-black/[0.04]"
              onClick={() => setMobileOpen(false)}
            >
              Blog
            </Link>
            <div className="mt-2 border-t border-gray-200/80 pt-3">
              {user ? (
                <>
                  {showPricingCta && (
                    <Link
                      href="/pricing"
                      className="mb-2 block rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                      onClick={() => setMobileOpen(false)}
                    >
                      Start for free
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    className="block rounded-xl px-3 py-2.5 text-sm hover:bg-black/[0.04]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm hover:bg-black/[0.04]"
                    onClick={() => {
                      setMobileOpen(false)
                      void handleSignOut()
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block rounded-xl px-3 py-2.5 text-sm hover:bg-black/[0.04]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
