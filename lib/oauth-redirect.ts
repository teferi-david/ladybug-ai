/**
 * OAuth redirect targets for Supabase signInWithOAuth.
 *
 * Always use a full https origin + /auth/callback so Supabase never treats the redirect as a path
 * fragment (e.g. …supabase.co/ladybugai.us). Set NEXT_PUBLIC_APP_URL in production to your canonical
 * site, e.g. https://ladybugai.us. Must match entries under Supabase Authentication URL configuration.
 * configuration → Redirect URLs:
 *   https://ladybugai.us/auth/callback
 *   https://ladybugai.us/auth/callback?next=%2Fpricing
 */

function originFromEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!raw) return null
  try {
    return new URL(raw).origin
  } catch {
    return null
  }
}

/** Canonical site origin for OAuth; prefer NEXT_PUBLIC_APP_URL in production. */
export function getOAuthRedirectOrigin(): string {
  const fromEnv = originFromEnv()
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined') return window.location.origin
  return 'http://localhost:3000'
}

/** Hostname for UI copy, e.g. "ladybugai.us" or "localhost". */
export function getOAuthRedirectHostname(): string {
  const fromEnv = originFromEnv()
  if (fromEnv) {
    try {
      return new URL(fromEnv).hostname
    } catch {
      /* fall through */
    }
  }
  if (typeof window !== 'undefined') return window.location.hostname
  return 'localhost'
}

/**
 * Full redirectTo URL Supabase will send users back to after Google (must be allowlisted).
 * @param nextPath optional same-origin path, e.g. "/pricing"
 */
export function getOAuthRedirectUrl(nextPath?: string): string {
  const origin = getOAuthRedirectOrigin()
  const base = `${origin}/auth/callback`
  if (nextPath) {
    const p = nextPath.startsWith('/') ? nextPath : `/${nextPath}`
    return `${base}?next=${encodeURIComponent(p)}`
  }
  return base
}
