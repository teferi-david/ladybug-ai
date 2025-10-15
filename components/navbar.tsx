'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-xl font-bold">Ladybug AI</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/humanizer"
            className={`text-sm font-medium hover:text-primary transition-colors ${
              pathname === '/humanizer' ? 'text-primary' : 'text-gray-600'
            }`}
          >
            AI Humanizer
          </Link>
          <Link
            href="/paraphraser"
            className={`text-sm font-medium hover:text-primary transition-colors ${
              pathname === '/paraphraser' ? 'text-primary' : 'text-gray-600'
            }`}
          >
            Paraphraser
          </Link>
          <Link
            href="/citation"
            className={`text-sm font-medium hover:text-primary transition-colors ${
              pathname === '/citation' ? 'text-primary' : 'text-gray-600'
            }`}
          >
            Citation Generator
          </Link>
          <Link
            href="/pricing"
            className={`text-sm font-medium hover:text-primary transition-colors ${
              pathname === '/pricing' ? 'text-primary' : 'text-gray-600'
            }`}
          >
            Pricing
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

