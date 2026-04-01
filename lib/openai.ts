import OpenAI from 'openai'
import type { HumanizeLevel } from '@/lib/humanize-levels'
import { HUMANIZE_STUDENT_SYSTEM_PROMPT, LEVEL_VOICE_HINTS } from '@/lib/prompts/humanize-student-system'

// Initialize OpenAI client (set OPENAI_API_KEY in env — never commit keys)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/** Default humanize model (reasoning). Override with OPENAI_HUMANIZE_MODEL if needed. */
const HUMANIZE_MODEL = process.env.OPENAI_HUMANIZE_MODEL ?? 'o4-mini'

/**
 * Humanize text using OpenAI (default: o4-mini) and the student-voice system prompt.
 */
export async function humanizeText(text: string, level: HumanizeLevel = 'basic'): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY?.trim()) {
      throw new Error('OPENAI_API_KEY is not configured')
    }

    console.log('OpenAI humanizeText called with:', text.substring(0, 100) + '...', 'Level:', level, 'Model:', HUMANIZE_MODEL)

    const cleanedText = cleanTextForHumanize(text)
    console.log('Cleaned text (paragraphs preserved):', cleanedText.substring(0, 100) + '...')

    const voiceHint = LEVEL_VOICE_HINTS[level]
    const userContent = `${voiceHint}

---

Rewrite the following AI-generated text according to all system instructions.

${cleanedText}`

    const completion = await openai.chat.completions.create({
      model: HUMANIZE_MODEL,
      messages: [
        { role: 'system', content: HUMANIZE_STUDENT_SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      max_completion_tokens: 16384,
    })

    const result = completion.choices[0]?.message?.content?.trim() || cleanedText
    console.log('OpenAI result:', result.substring(0, 100) + '...')

    return result
  } catch (error: any) {
    console.error('Error in humanizeText:', error)
    throw new Error(`OpenAI humanization failed: ${error.message}`)
  }
}

/**
 * Paraphrase text using OpenAI (simple, natural rewrite).
 */
export async function paraphraseText(text: string): Promise<string> {
  try {
    console.log('OpenAI paraphraseText called with:', text.substring(0, 100) + '...')
    
    const cleanedText = cleanText(text)
    console.log('Cleaned text:', cleanedText.substring(0, 100) + '...')
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You paraphrase text for students. Keep the same meaning and facts. Use clear, natural English. ' +
            'Vary wording and sentence structure. Output only the paraphrased text—no quotes or preamble.',
        },
        {
          role: 'user',
          content: `Paraphrase this:\n\n${cleanedText}`,
        },
      ],
      temperature: 0.6,
      max_completion_tokens: 4096,
    })

    const result = completion.choices[0]?.message?.content || cleanedText
    console.log('OpenAI result:', result.substring(0, 100) + '...')
    
    return result
  } catch (error: any) {
    console.error('Error in paraphraseText:', error)
    throw new Error(`OpenAI paraphrasing failed: ${error.message}`)
  }
}

/**
 * Generate citation using OpenAI GPT-4o-mini
 */
export async function generateCitation(citationData: {
  type: 'apa' | 'mla'
  author?: string
  title?: string
  year?: string
  publisher?: string
  url?: string
  accessDate?: string
}): Promise<string> {
  try {
    console.log('OpenAI generateCitation called with:', citationData)
    
    const { type, author, title, year, publisher, url, accessDate } = citationData
    
    const bits = [
      author && `Author: ${author}`,
      title && `Title: ${title}`,
      year && `Year: ${year}`,
      publisher && `Publisher: ${publisher}`,
      url && `URL: ${url}`,
      accessDate && `Access date: ${accessDate}`,
    ].filter(Boolean)

    const prompt = `Format one ${type.toUpperCase()} citation (student paper style) from:\n${bits.join('\n')}\n\nReturn only the citation line(s). No explanation.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You output only a single ${type.toUpperCase()} citation line (or hanging indent block if needed). No labels, no markdown fences.`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_completion_tokens: 400,
    })

    const result = completion.choices[0]?.message?.content || 'Error generating citation'
    console.log('OpenAI citation result:', result)
    
    return result
  } catch (error: any) {
    console.error('Error in generateCitation:', error)
    throw new Error(`OpenAI citation generation failed: ${error.message}`)
  }
}

/**
 * Sanitize humanizer input while preserving paragraph breaks (output rules require this).
 */
function cleanTextForHumanize(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n')
  cleaned = cleaned.replace(/[^\S\n]+/g, ' ')
  cleaned = cleaned
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim()

  cleaned = cleaned.replace(/[^\x20-\x7E\n\t\u00A0-\uFFFF]/g, '')

  if (!cleaned.trim()) {
    return 'Please provide valid text to process.'
  }

  const maxLen = 50000
  if (cleaned.length > maxLen) {
    cleaned = cleaned.substring(0, maxLen) + '\n\n[...truncated for length]'
  }

  return cleaned
}

/**
 * Clean and format text to prevent malformed input to OpenAI
 */
function cleanText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  // Remove any null bytes or control characters
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  // Remove any remaining problematic characters
  cleaned = cleaned.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '')
  
  // Ensure the text is not empty
  if (!cleaned.trim()) {
    return 'Please provide valid text to process.'
  }
  
  // Limit text length to prevent token limits
  if (cleaned.length > 4000) {
    cleaned = cleaned.substring(0, 4000) + '...'
  }
  
  return cleaned
}

// Estimate token count (rough approximation: 1 token ≈ 4 characters)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
