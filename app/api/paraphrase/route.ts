import { NextRequest, NextResponse } from 'next/server'
import { paraphraseText } from '@/lib/custom-ai'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('Paraphrase API called')
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
    
    // Call OpenAI to paraphrase the text
    const result = await paraphraseText(text)
    
    console.log('Paraphrasing completed')
    
    return NextResponse.json({
      status: 'success',
      result: result,
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Error in paraphrase API:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Failed to paraphrase text',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}