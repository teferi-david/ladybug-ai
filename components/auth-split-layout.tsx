import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'

const BULLETS = [
  'Humanize AI text in 3 seconds or less',
  'Bypass GPT zero, Turnitin & all AI detectors - guaranteed!',
  '24/7 customer support',
  'Trusted by 100,000+ users!',
] as const

const marketingBlock = (
  <div className="mx-auto w-full max-w-lg text-left">
    <p className="text-balance text-2xl font-semibold leading-snug tracking-tight text-white drop-shadow-sm xl:text-[1.65rem]">
      Humanize AI Texts and Bypass Content Detectors
    </p>
    <p className="mt-4 text-base font-medium text-white drop-shadow-sm md:text-lg">
      Sign up now to get <span className="font-semibold text-rose-200">150 FREE words</span>
    </p>
    <ul className="mt-8 w-full space-y-4 text-left text-sm leading-relaxed text-white/95 md:text-base">
      {BULLETS.map((line) => (
        <li key={line} className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/90 text-white shadow-sm">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <span className="text-pretty">{line}</span>
        </li>
      ))}
    </ul>
  </div>
)

type AuthSplitLayoutProps = {
  children: ReactNode
  /** e.g. "Sign up for Ladybug AI" */
  title: string
  /** Short line under the title */
  subtitle: string
}

export function AuthSplitLayout({ children, title, subtitle }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col lg:flex-row">
      <div className="flex flex-1 flex-col justify-center bg-white px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="Ladybug AI"
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="text-lg font-bold tracking-tight text-gray-900">Ladybug AI</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>

      <div className="relative hidden min-h-[420px] flex-1 lg:flex lg:min-h-0">
        <Image
          src="/images/auth/panel-hero.png"
          alt=""
          fill
          className="object-cover object-center brightness-[0.48] saturate-[0.95]"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/[0.88]"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-10 xl:p-14">
          {marketingBlock}
        </div>
      </div>

      <div className="relative min-h-[280px] border-t border-gray-100 lg:hidden">
        <Image
          src="/images/auth/panel-hero.png"
          alt=""
          fill
          className="object-cover object-[center_30%] brightness-[0.48] saturate-[0.95]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/[0.88]"
          aria-hidden
        />
        <div className="relative z-10 flex min-h-[280px] flex-col items-center justify-center px-6 py-10">
          {marketingBlock}
        </div>
      </div>
    </div>
  )
}
