import { supabaseAdmin } from '@/lib/supabase/server'

/** Comma-separated owner emails allowed to use admin tools (set ADMIN_EMAILS in env). */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.trim().toLowerCase())
}

/** Uniform shape (project has strict: false, so discriminated-union narrowing is unavailable). */
export type AdminCheck = {
  ok: boolean
  status: number
  error?: string
  userId?: string
  email?: string
}

/**
 * Verifies the Bearer token belongs to a signed-in user whose email is in ADMIN_EMAILS.
 * Fails closed: if ADMIN_EMAILS is unset/empty, nobody is admin.
 */
export async function requireAdminFromRequest(authHeader: string | null): Promise<AdminCheck> {
  if (!authHeader?.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Sign in as an admin to use this tool.' }
  }
  if (getAdminEmails().length === 0) {
    console.error('Admin tool used but ADMIN_EMAILS is not configured.')
    return { ok: false, status: 503, error: 'Admin access is not configured on the server (ADMIN_EMAILS).' }
  }

  const token = authHeader.slice(7)
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) {
    return { ok: false, status: 401, error: 'Invalid session. Sign in again.' }
  }

  const email = data.user.email ?? null
  if (!isAdminEmail(email)) {
    return { ok: false, status: 403, error: 'This account is not authorized for admin tools.' }
  }

  return { ok: true, status: 200, userId: data.user.id, email: email as string }
}
