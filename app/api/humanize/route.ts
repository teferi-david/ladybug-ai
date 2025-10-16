import { NextRequest, NextResponse } from 'next/server'
import { humanizeText } from '@/lib/openai'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('Humanize API called')
  try {
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        error: 'Text is required',
        message: 'Please provide a text field in your request'
      }, { status: 400 })
    }

    console.log('Processing text:', text.substring(0, 100) + '...')
    
    // Call OpenAI to humanize the text
    const result = await humanizeText(text)
    
    console.log('Humanization completed')
    
    return NextResponse.json({
      status: 'success',
      result: result,
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Error in humanize API:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Failed to humanize text',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}