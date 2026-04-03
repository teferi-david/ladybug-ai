'use client'

import { useEffect } from 'react'
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
    </div>
  )
}
