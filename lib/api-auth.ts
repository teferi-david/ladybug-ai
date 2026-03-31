import { NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth-helpers'
import { hasProHumanizeAccess } from '@/lib/plan-access'
import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

export async function requirePremiumUser(
  authHeader: string | null
): Promise<{ user: UserRow } | { response: NextResponse }> {
  const user = await getUserFromToken(authHeader)
  if (!user) {
    return {
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'Sign in to use this tool.' },
        { status: 401 }
      ),
    }
  }
  if (!hasProHumanizeAccess(user)) {
    return {
      response: NextResponse.json(
        {
          error: 'Premium required',
          message:
            'This tool is included with Pro. Start a 1-day free trial for unlimited use with the humanizer, paraphraser, citations, and more.',
          upgradeRequired: true,
        },
        { status: 403 }
      ),
    }
  }
  return { user }
}
