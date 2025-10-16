import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken, checkSubscriptionAccess, checkDailyUsage, incrementDailyUsage, decrementSingleUseCredits } from '@/lib/auth-helpers'
import { generateCitation, estimateTokens } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const citationData = await request.json()

    if (!citationData.type || !['apa', 'mla'].includes(citationData.type)) {
      return NextResponse.json({ error: 'Valid citation type (apa or mla) is required' }, { status: 400 })
    }

    // Estimate tokens (citations are typically small)
    const estimatedText = JSON.stringify(citationData)
    const tokens = estimateTokens(estimatedText)

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    const user = await getUserFromToken(authHeader)

    // Get IP address for free tier tracking
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    if (user) {
      // User is logged in - check subscription
      const { hasAccess, reason } = checkSubscriptionAccess(user)

      if (!hasAccess) {
        return NextResponse.json({
          error: 'Subscription required',
          reason,
          message: 'Please upgrade your plan to use this feature.',
        }, { status: 403 })
      }

      // Process the request
      const result = await generateCitation(citationData)

      // Decrement single-use credits if applicable
      if (user.current_plan === 'single-use') {
        const newCredits = user.uses_left - tokens
        await decrementSingleUseCredits(user.id, newCredits)
      }

      // Log usage
      // @ts-ignore
      await supabaseAdmin.from('usage_logs').insert({
        user_id: user.id,
        tool_name: 'citation',
        tokens_used: tokens,
      })

      return NextResponse.json({ result, tokensUsed: tokens })
    } else {
      // User not logged in - check free tier limits
      if (tokens > 500) {
        return NextResponse.json({
          error: 'Token limit exceeded',
          message: 'Free tier limited to 500 tokens per request. Please sign up for unlimited access.',
        }, { status: 403 })
      }

      const { allowed, usesRemaining } = await checkDailyUsage(null, ip, 'citation')

      if (!allowed) {
        return NextResponse.json({
          error: 'Daily limit reached',
          message: "You've used your free Ladybug AI trials for today. Upgrade for unlimited access or purchase a one-time 2,000-token session for $3.99.",
        }, { status: 403 })
      }

      // Process the request
      const result = await generateCitation(citationData)

      // Increment usage
      await incrementDailyUsage(null, ip, 'citation')

      return NextResponse.json({
        result,
        tokensUsed: tokens,
        usesRemaining: usesRemaining - 1,
      })
    }
  } catch (error: any) {
    console.error('Error in citation API:', error)
    
    // Provide helpful error messages
    if (error?.message?.includes('SUPABASE')) {
      return NextResponse.json({
        error: 'Database not configured. Please add Supabase credentials to environment variables.'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      error: 'Service temporarily unavailable. Please try again or contact support.',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 })
  }
}

