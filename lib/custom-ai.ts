import { advancedNLP } from './advanced-nlp'

/**
 * Custom AI functions using our NLP engine instead of OpenAI
 */

export async function humanizeText(text: string): Promise<string> {
  try {
    console.log('Custom humanizeText called')
    const result = await advancedNLP.humanizeText(text)
    console.log('Custom humanizeText completed')
    return result
  } catch (error: any) {
    console.error('Error in custom humanizeText:', error)
    throw new Error(`Custom humanization failed: ${error.message}`)
  }
}

export async function paraphraseText(text: string): Promise<string> {
  try {
    console.log('Custom paraphraseText called')
    const result = await advancedNLP.paraphraseText(text)
    console.log('Custom paraphraseText completed')
    return result
  } catch (error: any) {
    console.error('Error in custom paraphraseText:', error)
    throw new Error(`Custom paraphrasing failed: ${error.message}`)
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
  try {
    console.log('Custom generateCitation called')
    const result = await advancedNLP.generateCitation(citationData)
    console.log('Custom generateCitation completed')
    return result
  } catch (error: any) {
    console.error('Error in custom generateCitation:', error)
    throw new Error(`Custom citation generation failed: ${error.message}`)
  }
}

// Estimate token count (rough approximation: 1 token ≈ 4 characters)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
