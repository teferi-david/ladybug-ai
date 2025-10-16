import { NextRequest, NextResponse } from 'next/server'
import { humanizeText } from '@/lib/openai'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('Humanize API called')
  
  try {
    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({
        status: 'error',
        error: 'Invalid JSON in request body',
        message: 'Please ensure your request contains valid JSON'
      }, { status: 400 })
    }

    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        status: 'error',
        error: 'Text is required',
        message: 'Please provide a text field in your request'
      }, { status: 400 })
    }

    console.log('Processing text:', text.substring(0, 100) + '...')
    
    // Call OpenAI to humanize the text with error handling
    let result
    try {
      result = await humanizeText(text)
      console.log('Humanization completed')
    } catch (openaiError: any) {
      console.error('OpenAI error:', openaiError)
      return NextResponse.json({
        status: 'error',
        error: 'OpenAI processing failed',
        message: openaiError.message || 'Failed to process text with OpenAI',
        details: process.env.NODE_ENV === 'development' ? openaiError.message : undefined
      }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'success',
      result: result,
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Unexpected error in humanize API:', error)
    console.error('Error stack:', error?.stack)
    
    // Always return a valid JSON response
    return NextResponse.json({
      status: 'error',
      error: 'Internal server error',
      message: error?.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}