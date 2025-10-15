import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Check cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Delete old usage records (older than today)
    const { error } = await supabaseAdmin
      .from('daily_usage')
      .delete()
      .lt('last_reset', today)

    if (error) {
      console.error('Error resetting daily usage:', error)
      return NextResponse.json({ error: 'Failed to reset usage' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Daily usage reset successfully' })
  } catch (error) {
    console.error('Error in resetDailyUsage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

