'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleBrandIcon } from '@/components/google-brand-icon'
import { AuthEmailDivider } from '@/components/auth-email-divider'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        router.push('/settings')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (error) {
        setError(error.message)
        setGoogleLoading(false)
      }
    } catch {
      setError('Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your Ladybug AI account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
          )}

          <Button
            type="button"
            variant="outline"
            className="flex h-11 w-full items-center justify-center gap-3 border-gray-300 bg-white font-medium text-gray-800 hover:bg-gray-50"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            <GoogleBrandIcon className="shrink-0" />
            {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
          </Button>

          <AuthEmailDivider />

          <form onSubmit={handleLogin} className="space-y-4">
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
              />
            </div>
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading || googleLoading}>
              {loading ? 'Signing in...' : 'Sign in with email'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col pt-2">
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
