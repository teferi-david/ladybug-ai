'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleBrandIcon } from '@/components/google-brand-icon'
import { AuthEmailDivider } from '@/components/auth-email-divider'
import { AuthSplitLayout } from '@/components/auth-split-layout'
import { proUpgradeButtonClassName } from '@/components/pro-upgrade-button'
import { cn } from '@/lib/utils'
import { getOAuthRedirectHostname, getOAuthRedirectUrl } from '@/lib/oauth-redirect'

const authPrimaryCtaClass = cn(proUpgradeButtonClassName, 'w-full')

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        router.push('/pricing')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      const redirectTo = getOAuthRedirectUrl('/pricing')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (error) {
        setError(error.message)
        setGoogleLoading(false)
      }
    } catch {
      setError('Google sign-up failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  return (
    <AuthSplitLayout
      title="Sign up for Ladybug AI"
      subtitle="Create an account and turn robotic drafts into something you would actually hand in."
    >
      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="flex h-11 w-full items-center justify-center gap-3 border-gray-300 bg-white font-medium text-gray-800 hover:bg-gray-50"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
      >
        <GoogleBrandIcon className="shrink-0" />
        {googleLoading
          ? 'Redirecting to Google...'
          : `Continue to ${getOAuthRedirectHostname()}`}
      </Button>

      <AuthEmailDivider />

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className={authPrimaryCtaClass} disabled={loading || googleLoading}>
          {loading ? 'Creating account...' : 'Continue'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        By continuing you agree to our Terms of Service and Privacy Policy.
      </p>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthSplitLayout>
  )
}
