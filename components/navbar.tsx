'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { hasProHumanizeAccess } from '@/lib/plan-access'

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isPremium, setIsPremium] = useState(false)

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const showPricingCta = !user || !isPremium

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.jpg"
              alt="Ladybug AI Logo"
              width={32}
              height={32}
              className="rounded-full object-cover"
              priority
            />
          </div>
          <span className="text-xl font-bold">Ladybug AI</span>
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {showPricingCta && (
                <ProUpgradeButton asChild size="sm" className="min-h-10 px-4">
                  <Link href="/pricing">Start for free</Link>
                </ProUpgradeButton>
              )}
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  Settings
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <ProUpgradeButton asChild size="sm" className="min-h-10 px-4">
                <Link href="/register">Start for free</Link>
              </ProUpgradeButton>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
