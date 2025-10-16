import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken, checkSubscriptionAccess, checkDailyUsage, incrementDailyUsage, decrementSingleUseCredits } from '@/lib/auth-helpers'
import { humanizeText, estimateTokens } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Handle GET requests for debugging
export async function GET(request: NextRequest) {
  console.log('GET request received at /api/humanize')
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests',
    method: 'GET',
    expected: 'POST',
    endpoint: '/api/humanize',
    timestamp: new Date().toISOString(),
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  }, { status: 405 })
}

// Handle PUT requests
export async function PUT(request: NextRequest) {
  console.log('PUT request received at /api/humanize')
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests',
    method: 'PUT',
    expected: 'POST',
    endpoint: '/api/humanize'
  }, { status: 405 })
}

// Handle DELETE requests
export async function DELETE(request: NextRequest) {
  console.log('DELETE request received at /api/humanize')
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests',
    method: 'DELETE',
    expected: 'POST',
    endpoint: '/api/humanize'
  }, { status: 405 })
}

export async function POST(request: NextRequest) {
  try {
    console.log('Humanize API called')
    
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Count words
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length

    // Estimate tokens
    const tokens = estimateTokens(text)
    
    console.log('Processing request:', { wordCount, tokens })

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

      // Check word limit for logged-in users (2500 words max)
      if (wordCount > 2500) {
        return NextResponse.json({
          error: 'Word limit exceeded',
          message: 'Maximum 2500 words allowed per request. Your text has ' + wordCount + ' words.',
        }, { status: 400 })
      }

      // Process the request
      console.log('Calling humanizeText...')
      const result = await humanizeText(text)
      console.log('humanizeText completed')

      // Decrement single-use credits if applicable
      if (user.current_plan === 'single-use') {
        const newCredits = user.uses_left - tokens
        await decrementSingleUseCredits(user.id, newCredits)
      }

      // Log usage
      // @ts-ignore
      await supabaseAdmin.from('usage_logs').insert({
        user_id: user.id,
        tool_name: 'humanizer',
        tokens_used: tokens,
      })

      return NextResponse.json({ result, tokensUsed: tokens })
    } else {
      // User not logged in - check free tier limits
      if (wordCount > 200) {
        return NextResponse.json({
          error: 'Word limit exceeded',
          message: 'Free tier limited to 200 words per request. Your text has ' + wordCount + ' words. Please sign up for 2500 word limit.',
        }, { status: 403 })
      }

      if (tokens > 500) {
        return NextResponse.json({
          error: 'Token limit exceeded',
          message: 'Free tier limited to 500 tokens per request. Please sign up for unlimited access.',
        }, { status: 403 })
      }

      const { allowed, usesRemaining } = await checkDailyUsage(null, ip, 'humanizer')

      if (!allowed) {
        return NextResponse.json({
          error: 'Daily limit reached',
          message: "You've used your free Ladybug AI trials for today. Upgrade for unlimited access or purchase a one-time 2,000-token session for $3.99.",
        }, { status: 403 })
      }

      // Process the request
      console.log('Calling humanizeText (free tier)...')
      const result = await humanizeText(text)
      console.log('humanizeText completed (free tier)')

      // Increment usage
      await incrementDailyUsage(null, ip, 'humanizer')

      return NextResponse.json({
        result,
        tokensUsed: tokens,
        usesRemaining: usesRemaining - 1,
      })
    }
  } catch (error: any) {
    console.error('Error in humanize API:', error)
    
    // Ensure we always return JSON, never throw
    try {
      // Provide helpful error messages
      if (error?.message?.includes('OPENAI_API_KEY')) {
        return NextResponse.json({
          error: 'OpenAI API not configured. Please add OPENAI_API_KEY to environment variables.'
        }, { status: 500 })
      }
      
      if (error?.message?.includes('SUPABASE')) {
        return NextResponse.json({
          error: 'Database not configured. Please add Supabase credentials to environment variables.'
        }, { status: 500 })
      }
      
      if (error?.code === 'insufficient_quota' || error?.message?.includes('quota')) {
        return NextResponse.json({
          error: 'OpenAI API quota exceeded. Please check your OpenAI account billing.'
        }, { status: 500 })
      }
      
      if (error?.code === 'invalid_api_key' || error?.message?.includes('api key')) {
        return NextResponse.json({
          error: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.'
        }, { status: 500 })
      }
      
      return NextResponse.json({
        error: 'Service temporarily unavailable. Please try again or contact support.',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, { status: 500 })
    } catch (jsonError) {
      // Fallback if JSON creation fails
      console.error('Failed to create JSON error response:', jsonError)
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

