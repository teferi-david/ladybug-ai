/**
 * Same-origin path only; avoids open redirects. Use for ?next= after login/OAuth.
 */
export function safeNextPath(next: string | null | undefined, fallback = '/dashboard'): string {
  if (!next) return fallback
  try {
    const p = decodeURIComponent(next)
    if (!p.startsWith('/') || p.startsWith('//')) return fallback
    return p
  } catch {
    return fallback
  }
}
