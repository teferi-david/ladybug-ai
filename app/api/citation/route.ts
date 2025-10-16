import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken, checkSubscriptionAccess, checkDailyUsage, incrementDailyUsage, decrementSingleUseCredits } from '@/lib/auth-helpers'
import { generateCitation, estimateTokens } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Handle GET requests for debugging
export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests',
    method: 'GET',
    expected: 'POST',
    endpoint: '/api/citation'
  }, { status: 405 })
}

export async function POST(request: NextRequest) {
  try {
    console.log('Citation API called')
    console.log('Request URL:', request.url)
    console.log('Request method:', request.method)
    
    // Explicitly check method
    if (request.method !== 'POST') {
      console.log('Method mismatch detected:', request.method)
      return NextResponse.json({
        error: 'Method not allowed',
        message: `Expected POST, received ${request.method}`,
        receivedMethod: request.method,
        expectedMethod: 'POST'
      }, { 
        status: 405,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }
    
    let citationData: any
    try {
      citationData = await request.json()
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        message: 'Please ensure your request body contains valid JSON'
      }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    if (!citationData.type || !['apa', 'mla'].includes(citationData.type)) {
      return NextResponse.json({ 
        error: 'Valid citation type (apa or mla) is required',
        message: 'Please provide a valid citation type in your request'
      }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
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
    console.error('Error stack:', error?.stack)
    
    // Ensure we always return JSON, never throw
    let errorMessage = 'An unexpected server error occurred.'
    let statusCode = 500
    
    // Handle specific error types
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      errorMessage = 'Invalid JSON in request body. Please ensure your request body is valid JSON.'
      statusCode = 400
    } else if (error?.message?.includes('OPENAI_API_KEY')) {
      errorMessage = 'OpenAI API not configured. Please add OPENAI_API_KEY to environment variables.'
    } else if (error?.message?.includes('SUPABASE')) {
      errorMessage = 'Database not configured. Please add Supabase credentials to environment variables.'
    } else if (error?.code === 'insufficient_quota' || error?.message?.includes('quota')) {
      errorMessage = 'OpenAI API quota exceeded. Please check your OpenAI account billing.'
    } else if (error?.code === 'invalid_api_key' || error?.message?.includes('api key')) {
      errorMessage = 'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.'
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    // Always return a valid JSON response
    return NextResponse.json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      timestamp: new Date().toISOString()
    }, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json'
      }
    })
  }
}

