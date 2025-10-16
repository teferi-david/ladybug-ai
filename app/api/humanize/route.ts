import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken, checkSubscriptionAccess, checkDailyUsage, incrementDailyUsage, decrementSingleUseCredits } from '@/lib/auth-helpers'
import { humanizeText, estimateTokens } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Handle GET requests for debugging
export async function GET(request: NextRequest) {
  console.log('GET request received at /api/humanize')
  console.log('Request URL:', request.url)
  console.log('Request method:', request.method)
  console.log('Request headers:', Object.fromEntries(request.headers.entries()))
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
    console.log('Request URL:', request.url)
    console.log('Request method:', request.method)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    console.log('Cache busting params:', request.nextUrl.searchParams.toString())
    console.log('Request ID:', request.headers.get('X-Request-ID'))
    console.log('Cache bust header:', request.headers.get('X-Cache-Bust'))
    
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
          'Allow': 'POST',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }
    
    let text: string
    try {
      const body = await request.json()
      text = body.text
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        message: 'Please ensure your request body contains valid JSON with a "text" field'
      }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        error: 'Text is required and must be a string',
        message: 'Please provide a valid text field in your request'
      }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
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
      console.log('Input text:', text.substring(0, 100) + '...')
      
      let result
      try {
        result = await humanizeText(text)
        console.log('humanizeText completed')
        console.log('Output text:', result.substring(0, 100) + '...')
      } catch (openaiError: any) {
        console.error('OpenAI error:', openaiError)
        throw new Error(`OpenAI processing failed: ${openaiError.message}`)
      }

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

      return NextResponse.json({ result, tokensUsed: tokens }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Cache-Status': 'BYPASS',
          'X-Response-Time': new Date().toISOString(),
          'X-API-Version': '1.0.0-fixed-405'
        }
      })
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
      console.log('Input text:', text.substring(0, 100) + '...')
      
      let result
      try {
        result = await humanizeText(text)
        console.log('humanizeText completed (free tier)')
        console.log('Output text:', result.substring(0, 100) + '...')
      } catch (openaiError: any) {
        console.error('OpenAI error (free tier):', openaiError)
        throw new Error(`OpenAI processing failed: ${openaiError.message}`)
      }

      // Increment usage
      await incrementDailyUsage(null, ip, 'humanizer')

      return NextResponse.json({
        result,
        tokensUsed: tokens,
        usesRemaining: usesRemaining - 1,
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Cache-Status': 'BYPASS',
          'X-Response-Time': new Date().toISOString(),
          'X-API-Version': '1.0.0-fixed-405'
        }
      })
    }
  } catch (error: any) {
    console.error('Error in humanize API:', error)
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

