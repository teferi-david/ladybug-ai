'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sparkles, RefreshCw, Quote, Settings } from 'lucide-react'

const items = [
  { href: '/', label: 'AI Humanizer', icon: Sparkles },
  { href: '/paraphraser', label: 'Paraphraser', icon: RefreshCw },
  { href: '/citation', label: 'Citation Tool', icon: Quote },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors sm:gap-3 sm:py-2.5 sm:text-sm',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  )
}

export function ToolsSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
      <nav
        className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-2 py-2 lg:hidden"
        aria-label="Tools"
      >
        {items.map(({ href, label, icon }) => (
          <NavLink key={href} href={href} label={label} icon={icon} active={isActive(href)} />
        ))}
      </nav>

      <aside
        className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-gray-50/90 lg:flex"
        aria-label="Tools navigation"
      >
        <div className="sticky top-0 flex flex-col gap-1 p-3 pt-6">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Tools</p>
          {items.map(({ href, label, icon }) => (
            <NavLink key={href} href={href} label={label} icon={icon} active={isActive(href)} />
          ))}
        </div>
      </aside>
    </>
  )
}
