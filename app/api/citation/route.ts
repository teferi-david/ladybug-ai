import { NextRequest, NextResponse } from 'next/server'
import { generateCitation } from '@/lib/custom-ai'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('Citation API called')
  try {
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        error: 'Text is required',
        message: 'Please provide a text field in your request'
      }, { status: 400 })
    }

    console.log('Processing citation data:', text.substring(0, 100) + '...')
    
    // Call OpenAI to generate citation
    const result = await generateCitation(JSON.parse(text))
    
    console.log('Citation generation completed')
    
    return NextResponse.json({
      status: 'success',
      result: result,
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Error in citation API:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Failed to generate citation',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}