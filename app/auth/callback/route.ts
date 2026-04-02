import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/** Same-origin path only; avoids open redirects. */
function safeNextPath(next: string | null): string {
  if (!next) return '/settings'
  try {
    const p = decodeURIComponent(next)
    if (!p.startsWith('/') || p.startsWith('//')) return '/settings'
    return p
  } catch {
    return '/settings'
  }
}

/**
 * OAuth (Google) redirect target. Supabase validates redirectTo against the project's
 * "Redirect URLs" list — add:
 *   https://YOUR_DOMAIN/auth/callback
 *   https://YOUR_DOMAIN/auth/callback?next=%2Fpricing (if using post-signup next=)
 *   http://localhost:3000/auth/callback (dev)
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const nextPath = safeNextPath(requestUrl.searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // set can fail in edge cases; session may still establish on redirect in some setups
          }
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('auth callback exchangeCodeForSession:', error.message)
    return NextResponse.redirect(`${origin}/login?error=oauth`)
  }

  return NextResponse.redirect(`${origin}${nextPath}`)
}
