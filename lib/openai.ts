import OpenAI from 'openai'

// Initialize OpenAI client with error handling
function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not defined')
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function humanizeText(text: string): Promise<string> {
  try {
    const openai = createOpenAIClient()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a writing assistant that rewrites AI-generated text to sound more natural and human-like while preserving the original meaning and key information. Make the text flow naturally, vary sentence structure, and use conversational language where appropriate.',
        },
        {
          role: 'user',
          content: `Rewrite this text to sound more natural and human-like while keeping the meaning:\n\n${text}`,
        },
      ],
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || text
  } catch (error: any) {
    console.error('Error in humanizeText:', error)
    throw error
  }
}

export async function paraphraseText(text: string): Promise<string> {
  try {
    const openai = createOpenAIClient()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a writing assistant that paraphrases text in clear, natural English. Maintain the original meaning while using different words and sentence structures. Make the output clear and easy to understand.',
        },
        {
          role: 'user',
          content: `Paraphrase this text in clear, natural English:\n\n${text}`,
        },
      ],
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || text
  } catch (error: any) {
    console.error('Error in paraphraseText:', error)
    throw error
  }
}

export async function generateCitation(citationData: {
  type: 'apa' | 'mla'
  author?: string
  title?: string
  year?: string
  publisher?: string
  url?: string
  accessDate?: string
}): Promise<string> {
  const { type, author, title, year, publisher, url, accessDate } = citationData

  const prompt = `Generate a properly formatted ${type.toUpperCase()} citation with the following information:
${author ? `Author: ${author}` : ''}
${title ? `Title: ${title}` : ''}
${year ? `Year: ${year}` : ''}
${publisher ? `Publisher: ${publisher}` : ''}
${url ? `URL: ${url}` : ''}
${accessDate ? `Access Date: ${accessDate}` : ''}

Provide only the formatted citation, nothing else.`

  try {
    const openai = createOpenAIClient()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a citation formatting expert. Generate accurate ${type.toUpperCase()} citations following the latest style guide rules. Return only the formatted citation.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    })

    return completion.choices[0]?.message?.content || 'Error generating citation'
  } catch (error: any) {
    console.error('Error in generateCitation:', error)
    throw error
  }
}


// Estimate token count (rough approximation: 1 token ≈ 4 characters)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

