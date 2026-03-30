import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser client — stores session in cookies (not only localStorage) so API routes can read auth.
 * Required for per-user daily limits on /api/humanize.
 */
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
