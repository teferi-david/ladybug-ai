'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { LandingHero } from '@/components/landing-hero'
import { PricingTeaser } from '@/components/pricing-teaser'
import { HumanizerDetectorLogos } from '@/components/humanizer-detector-logos'
import { HumanizerDetectorResults } from '@/components/humanizer-detector-results'
import { JoinStudentsVideoSection } from '@/components/join-students-video-section'
import { HumanizerMarketing } from '@/components/humanizer-marketing'
import { HumanizerDemoExample } from '@/components/humanizer-demo-example'

export function HomePageClient() {
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace('/dashboard')
      }
    })
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace('/dashboard')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen text-gray-900 dark:text-zinc-100">
      <LandingHero />
      <HumanizerDemoExample />
      <PricingTeaser />
      <JoinStudentsVideoSection />
      <div className="border-b border-white/30 bg-white/25 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/50">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <HumanizerDetectorLogos />
        </div>
      </div>
      <HumanizerDetectorResults />
      <HumanizerMarketing />

      <section className="border-t border-white/30 bg-white/25 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/50">
        <div className="container mx-auto max-w-3xl px-4 py-8 text-center md:py-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-zinc-300">
            Refund policy
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-gray-500 dark:text-zinc-500">
            All subscription payments are final and non-refundable. Ladybug AI offers a low-cost 1-day trial
            so you can evaluate the service first. When the trial ends, your subscription begins and your
            payment method is charged; because your account keeps full access to the service after the trial,
            these charges are considered payment for services rendered and are not refundable. You can cancel
            anytime before your next billing date to avoid future charges.{' '}
            <Link href="/support" className="font-medium underline underline-offset-2 hover:text-gray-700 dark:hover:text-zinc-300">
              Manage your subscription or get help
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
