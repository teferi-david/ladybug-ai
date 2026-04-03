'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/loading-spinner'
import { HumanizerPriorityStep } from '@/components/humanizer-priority-step'
import { HumanizerWorkspace } from '@/components/humanizer-workspace'
import { hasCompletedPriorityOnboarding } from '@/lib/humanizer-priority'

export default function HumanizerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [signedIn, setSignedIn] = useState(false)
  const [showPriority, setShowPriority] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (!session?.user) {
        router.replace('/login?next=%2Fhumanizer')
        return
      }
      setSignedIn(true)
      setShowPriority(!hasCompletedPriorityOnboarding())
      setLoading(false)
    })()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace('/login?next=%2Fhumanizer')
      }
    })
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!signedIn) {
    return null
  }

  if (showPriority) {
    return <HumanizerPriorityStep onComplete={() => setShowPriority(false)} />
  }

  return <HumanizerWorkspace />
}
