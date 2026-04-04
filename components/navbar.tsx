'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  CircleDollarSign,
  HelpCircle,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Quote,
  RefreshCw,
  Settings,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { COIN_BALANCE_UPDATED_EVENT, type CoinBalanceUpdatedDetail } from '@/lib/coin-balance-sync'
import { LogoMark } from '@/components/logo-mark'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

const toolsItems = [
  { href: '/humanizer', label: 'AI Humanizer', description: 'Humanize AI text', icon: Sparkles },
  { href: '/paraphraser', label: 'Paraphraser', description: 'Rephrase with clarity', icon: RefreshCw },
  { href: '/citation', label: 'Citations', description: 'APA & MLA', icon: Quote },
  { href: '/bypass-turnitin', label: 'Turnitin guide', description: 'Detection & integrity', icon: BookOpen },
] as const

function NavAccountProfileHeader({
  displayName,
  email,
  isPremium,
  coinBalance,
}: {
  displayName: string
  email: string | undefined
  isPremium: boolean
  coinBalance: number | null
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
        aria-hidden
      >
        {(displayName[0] || '?').toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-foreground">{displayName}</span>
          {!isPremium && coinBalance !== null && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" aria-hidden />
              {coinBalance}
            </span>
          )}
          {isPremium && (
            <span className="rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-700 dark:text-violet-300">
              Pro
            </span>
          )}
        </div>
        {email ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{email}</p> : null}
      </div>
    </div>
  )
}

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
        'inline-flex h-7 max-h-7 items-center text-xs font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-zinc-300 dark:hover:text-white lg:h-8 lg:max-h-8 lg:text-sm',
        active && 'text-primary dark:text-primary',
        className
      )}
    >
      {children}
    </Link>
  )
}

function useHoverDropdownMenu() {
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const openMenu = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setOpen(true)
  }, [])

  const scheduleClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => setOpen(false), 140)
  }, [])

  return { open, setOpen, openMenu, scheduleClose }
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [coinBalance, setCoinBalance] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const userMenu = useHoverDropdownMenu()

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (!session?.user) {
        setIsPremium(false)
        setCoinBalance(null)
        return
      }
      const { data: row } = await supabase
        .from('users')
        .select('current_plan, plan_expiry, subscription_status, uses_left, coin_balance')
        .eq('id', session.user.id)
        .single()
      const profile = row as UserRow | null
      setIsPremium(profile ? hasProHumanizeAccess(profile) : false)
      setCoinBalance(profile && typeof profile.coin_balance === 'number' ? profile.coin_balance : null)
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
    const onCoinsUpdated = (e: Event) => {
      const ce = e as CustomEvent<CoinBalanceUpdatedDetail>
      if (typeof ce.detail?.balance === 'number') {
        setCoinBalance(ce.detail.balance)
      }
    }
    window.addEventListener(COIN_BALANCE_UPDATED_EVENT, onCoinsUpdated)
    return () => window.removeEventListener(COIN_BALANCE_UPDATED_EVENT, onCoinsUpdated)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const showPricingCta = !user || !isPremium

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Signed in'

  return (
    <header className="sticky top-0 z-50 flex justify-center px-3 pt-3 md:px-4 md:pt-4">
      <div
        className={cn(
          'mx-auto',
          user
            ? 'flex w-full max-w-[min(43.5rem,calc(100%-1.5rem))] items-center gap-2 md:gap-2.5'
            : 'w-full max-w-[min(40rem,calc(100%-1.5rem))]'
        )}
      >
        <div
          className={cn(
            'liquid-glass-nav flex items-center justify-between gap-2 rounded-full border border-white/55 bg-white/50 px-2.5 py-[0.3125rem] shadow-[0_8px_40px_rgba(230,57,70,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/75 dark:shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] sm:px-4 sm:py-1',
            user ? 'min-w-0 flex-1' : 'w-full'
          )}
        >
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-lg p-0.5 ring-offset-2 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <div className="relative flex h-7 w-7 items-center justify-center sm:h-8 sm:w-8">
            <LogoMark size={40} className="h-full w-full" priority />
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex md:gap-1 lg:gap-4" aria-label="Main">
          {user && <NavLink href="/dashboard">Dashboard</NavLink>}
          <NavLink href="/about">About</NavLink>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'inline-flex h-7 max-h-7 items-center gap-0.5 rounded-full px-2 text-xs font-medium text-gray-700 outline-none transition-colors hover:bg-black/[0.04] hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 data-[state=open]:bg-black/[0.05] dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:hover:text-white lg:h-8 lg:max-h-8 lg:px-2.5 lg:text-sm'
              )}
            >
              Tools
              <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[14rem] dark:border-zinc-800 dark:bg-zinc-950">
              {toolsItems.map(({ href, label, description, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href} className="flex cursor-pointer items-start gap-3 py-2.5">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-900 dark:text-zinc-100">{label}</span>
                      <span className="text-xs font-normal text-gray-500 dark:text-zinc-500">{description}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/ai-humanizer">Blog</NavLink>

          {user ? (
            <div className="ml-1 flex h-7 max-h-7 items-center gap-1 border-l border-gray-200/80 pl-2 dark:border-zinc-700 lg:ml-2 lg:h-8 lg:max-h-8 lg:gap-1.5 lg:pl-3">
              {showPricingCta && (
                <ProUpgradeButton
                  asChild
                  className="h-7 max-h-7 min-h-0 shrink-0 rounded-full px-2.5 py-0 text-[10px] leading-none lg:h-8 lg:max-h-8 lg:min-h-8 lg:px-3 lg:text-[11px] xl:px-4 xl:text-xs"
                >
                  <Link href="/pricing">Start for free</Link>
                </ProUpgradeButton>
              )}
              <ThemeToggle className="h-7 w-7 max-h-7 shrink-0 rounded-full text-gray-700 dark:text-zinc-200 lg:h-8 lg:w-8 lg:max-h-8" />
            </div>
          ) : (
            <div className="ml-1 flex items-center gap-1.5 border-l border-gray-200/80 pl-3 lg:ml-3 lg:gap-2 lg:pl-4 dark:border-zinc-700">
              <ThemeToggle className="h-8 w-8 shrink-0 rounded-full" />
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 rounded-full px-2 text-xs text-gray-700 dark:text-zinc-300 lg:h-9">
                  Login
                </Button>
              </Link>
              <Link
                href="/register"
                className="inline-flex h-8 min-h-0 items-center gap-1 rounded-full border border-white/60 bg-white/70 px-3 text-[11px] font-semibold text-gray-900 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 lg:h-9 lg:gap-1.5 lg:px-4 lg:text-xs"
              >
                Get started
                <ArrowRight className="h-3 w-3 lg:h-3.5 lg:w-3.5" aria-hidden />
              </Link>
            </div>
          )}
        </nav>

        <div className="flex h-7 max-h-7 items-center gap-1.5 sm:h-8 sm:max-h-8 sm:gap-2 md:hidden">
          <ThemeToggle className="h-7 w-7 shrink-0 rounded-full sm:h-8 sm:w-8" />
          {user && (
            <span className="flex max-w-[5.5rem] items-center gap-1 truncate text-xs font-semibold tabular-nums text-foreground">
              {isPremium ? (
                <span className="text-violet-600 dark:text-violet-400">Pro</span>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden />
                  <span className="truncate">{coinBalance ?? '—'}</span>
                </>
              )}
            </span>
          )}
          {!user && (
            <Link
              href="/register"
              className="inline-flex h-7 max-h-7 items-center gap-1 rounded-full bg-primary px-2.5 text-[11px] font-semibold text-primary-foreground sm:h-8 sm:px-3 sm:text-xs"
            >
              Start
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-full sm:h-8 sm:w-8 dark:text-zinc-200"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        </div>

        {user && (
          <div className="hidden shrink-0 md:flex md:items-center">
            <DropdownMenu
              modal={false}
              open={userMenu.open}
              onOpenChange={userMenu.setOpen}
            >
              <div
                className="inline-flex h-7 max-h-7 items-center lg:h-8 lg:max-h-8"
                onMouseEnter={userMenu.openMenu}
                onMouseLeave={userMenu.scheduleClose}
              >
                <DropdownMenuTrigger
                  className={cn(
                    'inline-flex h-7 max-h-7 min-h-0 min-w-0 shrink-0 items-center justify-center gap-1 rounded-full border-0 bg-transparent px-2 text-xs font-semibold tabular-nums text-gray-900 shadow-none ring-0 outline-none transition-colors hover:bg-black/[0.06] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 data-[state=open]:bg-black/[0.08] dark:text-zinc-100 dark:hover:bg-white/[0.08] dark:data-[state=open]:bg-white/[0.1] lg:h-8 lg:max-h-8 lg:gap-1.5 lg:px-2.5 lg:text-sm'
                  )}
                  aria-label="Account and coins menu"
                >
                  {isPremium ? (
                    <>
                      <span className="text-[10px] uppercase tracking-wide text-violet-600 dark:text-violet-400 lg:text-[11px]">
                        Pro
                      </span>
                      <ChevronDown className="h-3 w-3 shrink-0 opacity-60 lg:h-3.5 lg:w-3.5" aria-hidden />
                    </>
                  ) : (
                    <>
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500 lg:h-2 lg:w-2"
                        aria-hidden
                      />
                      <span className="leading-none">{coinBalance ?? '—'}</span>
                      <ChevronDown className="h-3 w-3 shrink-0 opacity-60 lg:h-3.5 lg:w-3.5" aria-hidden />
                    </>
                  )}
                </DropdownMenuTrigger>
              </div>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="min-w-[17rem] p-0 dark:border-zinc-800 dark:bg-zinc-950"
                onMouseEnter={userMenu.openMenu}
                onMouseLeave={userMenu.scheduleClose}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DropdownMenuLabel className="border-b border-border px-3 py-3 font-normal">
                  <NavAccountProfileHeader
                    displayName={displayName}
                    email={user.email}
                    isPremium={isPremium}
                    coinBalance={coinBalance}
                  />
                </DropdownMenuLabel>

                <div className="p-1.5">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex cursor-pointer items-center gap-2.5 px-2 py-2">
                      <LayoutDashboard className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex cursor-pointer items-center gap-2.5 px-2 py-2">
                      <User className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex cursor-pointer items-center gap-2.5 px-2 py-2">
                      <Settings className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {!isPremium && (
                    <DropdownMenuItem asChild>
                      <Link href="/pricing" className="flex cursor-pointer items-center gap-2.5 px-2 py-2">
                        <Sparkles className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                        Get coins / Upgrade
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/ai-humanizer" className="flex cursor-pointer items-center gap-2.5 px-2 py-2">
                      <BookOpen className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                      Blog
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href="mailto:teferi.business@gmail.com"
                      className="flex cursor-pointer items-center gap-2.5 px-2 py-2"
                    >
                      <HelpCircle className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                      Help
                    </a>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="dark:bg-zinc-800" />

                <div className="p-1.5 pt-0">
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2.5 px-2 py-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                    onSelect={(e) => {
                      e.preventDefault()
                      void (async () => {
                        userMenu.setOpen(false)
                        await supabase.auth.signOut()
                        router.push('/')
                        router.refresh()
                      })()
                    }}
                  >
                    <LogOut className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                    Log out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="liquid-glass-nav mx-auto mt-2 w-full max-w-[min(40rem,calc(100%-1.5rem))] overflow-hidden rounded-2xl border border-white/50 bg-white/80 shadow-xl backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
          {user ? (
            <>
              <div className="border-b border-border bg-white/50 px-4 py-3 dark:bg-white/[0.04]">
                <NavAccountProfileHeader
                  displayName={displayName}
                  email={user.email}
                  isPremium={isPremium}
                  coinBalance={coinBalance}
                />
              </div>
              <div className="p-1.5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <LayoutDashboard className="h-4 w-4" aria-hidden />
                  </span>
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User className="h-4 w-4" aria-hidden />
                  </span>
                  Account
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Settings className="h-4 w-4" aria-hidden />
                  </span>
                  Settings
                </Link>
                {showPricingCta && (
                  <Link
                    href="/pricing"
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" aria-hidden />
                    </span>
                    Get coins / Upgrade
                  </Link>
                )}
                <Link
                  href="/about"
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Info className="h-4 w-4" aria-hidden />
                  </span>
                  About
                </Link>
                <Link
                  href="/pricing"
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CircleDollarSign className="h-4 w-4" aria-hidden />
                  </span>
                  Pricing
                </Link>
                <Link
                  href="/ai-humanizer"
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-4 w-4" aria-hidden />
                  </span>
                  Blog
                </Link>
                <a
                  href="mailto:teferi.business@gmail.com"
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HelpCircle className="h-4 w-4" aria-hidden />
                  </span>
                  Help
                </a>
              </div>
              <div className="border-t border-border px-1.5 pb-1.5 pt-1">
                <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tools
                </p>
                <div className="space-y-0.5">
                  {toolsItems.map(({ href, label, description, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground">{description}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="border-t border-border p-1.5">
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  onClick={() => {
                    setMobileOpen(false)
                    void (async () => {
                      await supabase.auth.signOut()
                      router.push('/')
                      router.refresh()
                    })()
                  }}
                >
                  <LogOut className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-1.5">
                <Link
                  href="/about"
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Info className="h-4 w-4" aria-hidden />
                  </span>
                  About
                </Link>
                <Link
                  href="/pricing"
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CircleDollarSign className="h-4 w-4" aria-hidden />
                  </span>
                  Pricing
                </Link>
                <Link
                  href="/ai-humanizer"
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-4 w-4" aria-hidden />
                  </span>
                  Blog
                </Link>
                <a
                  href="mailto:teferi.business@gmail.com"
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HelpCircle className="h-4 w-4" aria-hidden />
                  </span>
                  Help
                </a>
              </div>
              <div className="border-t border-border px-1.5 pb-1.5 pt-1">
                <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tools
                </p>
                <div className="space-y-0.5">
                  {toolsItems.map(({ href, label, description, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground">{description}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="border-t border-border p-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  )
}
