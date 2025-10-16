import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Humanize text using OpenAI GPT-4o-mini
 */
export async function humanizeText(text: string, level: 'highschool' | 'college' | 'graduate' = 'highschool'): Promise<string> {
  try {
    console.log('OpenAI humanizeText called with:', text.substring(0, 100) + '...', 'Level:', level)
    
    // Clean and format the input text
    const cleanedText = cleanText(text)
    console.log('Cleaned text:', cleanedText.substring(0, 100) + '...')
    
    // Define prompts based on humanize level
    const prompts = {
      highschool: {
        system: 'You are a writing assistant that rewrites AI-generated text to sound more natural and human-like for high school students. Use simple, clear language with basic vocabulary. Make the text conversational and easy to understand while preserving the original meaning.',
        user: `Rewrite this text to sound more natural and human-like for high school level while keeping the meaning:\n\n${cleanedText}`
      },
      college: {
        system: 'You are a writing assistant that rewrites AI-generated text to sound more natural and human-like for college students. Use sophisticated vocabulary and complex sentence structures. Make the text academically appropriate while maintaining a natural, engaging tone. Vary sentence length and structure for better flow.',
        user: `Rewrite this text to sound more natural and human-like for college level while keeping the meaning. Use sophisticated language and complex sentence structures:\n\n${cleanedText}`
      },
      graduate: {
        system: 'You are a writing assistant that rewrites AI-generated text to sound more natural and human-like for graduate students and academic professionals. Use highly nuanced, sophisticated language with deep contextual understanding. Employ advanced vocabulary, complex sentence structures, and academic tone while maintaining natural flow and readability.',
        user: `Rewrite this text to sound more natural and human-like for graduate level while keeping the meaning. Use highly sophisticated language, complex sentence structures, and academic nuance:\n\n${cleanedText}`
      }
    }

    const selectedPrompt = prompts[level]
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: selectedPrompt.system
        },
        {
          role: 'user',
          content: selectedPrompt.user
        }
      ],
      temperature: level === 'graduate' ? 0.8 : 0.7, // Higher temperature for more creative graduate-level output
      max_tokens: level === 'graduate' ? 3000 : 2000 // More tokens for graduate level
    })

    const result = completion.choices[0]?.message?.content || cleanedText
    console.log('OpenAI result:', result.substring(0, 100) + '...')
    
    return result
  } catch (error: any) {
    console.error('Error in humanizeText:', error)
    throw new Error(`OpenAI humanization failed: ${error.message}`)
  }
}

/**
 * Paraphrase text using OpenAI GPT-4o-mini
 */
export async function paraphraseText(text: string): Promise<string> {
  try {
    console.log('OpenAI paraphraseText called with:', text.substring(0, 100) + '...')
    
    // Clean and format the input text
    const cleanedText = cleanText(text)
    console.log('Cleaned text:', cleanedText.substring(0, 100) + '...')
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a writing assistant that paraphrases text in clear, natural English. Maintain the original meaning while using different words and sentence structures. Make the output clear and easy to understand.'
        },
        {
          role: 'user',
          content: `Paraphrase this text in clear, natural English:\n\n${cleanedText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
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
    
    const prompt = `Generate a properly formatted ${type.toUpperCase()} citation with the following information:
${author ? `Author: ${author}` : ''}
${title ? `Title: ${title}` : ''}
${year ? `Year: ${year}` : ''}
${publisher ? `Publisher: ${publisher}` : ''}
${url ? `URL: ${url}` : ''}
${accessDate ? `Access Date: ${accessDate}` : ''}

Provide only the formatted citation, nothing else.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a citation formatting expert. Generate accurate ${type.toUpperCase()} citations following the latest style guide rules. Return only the formatted citation.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
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
