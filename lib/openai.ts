import { humanizeText as localHumanizeText } from './microHumanizer'

// Use local micro-humanizer instead of OpenAI
export async function humanizeText(text: string): Promise<string> {
  try {
    const result = await localHumanizeText(text, {
      insertAnecdote: true,
      preferWe: false,
      randomSeed: Date.now(), // Random seed for varied output
    })
    return result.humanizedText
  } catch (error) {
    console.error('Error in local humanizer:', error)
    // Fallback: return original text
    return text
  }
}

export async function paraphraseText(text: string): Promise<string> {
  try {
    // Use the same humanizer with different settings for paraphrasing
    const result = await localHumanizeText(text, {
      insertAnecdote: false, // No anecdotes for paraphrasing
      preferWe: false,
      randomSeed: Date.now() + 1000, // Different seed for variation
    })
    return result.humanizedText
  } catch (error) {
    console.error('Error in local paraphraser:', error)
    return text
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

  try {
    if (type === 'apa') {
      return generateAPACitation(author, title, year, publisher, url, accessDate)
    } else {
      return generateMLACitation(author, title, year, publisher, url, accessDate)
    }
  } catch (error) {
    console.error('Error generating citation:', error)
    return 'Error generating citation. Please check your inputs.'
  }
}

// Local APA citation generator
function generateAPACitation(
  author?: string,
  title?: string,
  year?: string,
  publisher?: string,
  url?: string,
  accessDate?: string
): string {
  const parts: string[] = []

  // Author (Last, F. M.)
  if (author) {
    parts.push(`${author}.`)
  }

  // Year
  if (year) {
    parts.push(`(${year}).`)
  }

  // Title (italicized in actual formatting)
  if (title) {
    parts.push(`*${title}*.`)
  }

  // Publisher
  if (publisher) {
    parts.push(`${publisher}.`)
  }

  // URL and access date
  if (url) {
    if (accessDate) {
      parts.push(`Retrieved ${accessDate}, from ${url}`)
    } else {
      parts.push(`Retrieved from ${url}`)
    }
  }

  return parts.join(' ') || 'Incomplete citation information'
}

// Local MLA citation generator
function generateMLACitation(
  author?: string,
  title?: string,
  year?: string,
  publisher?: string,
  url?: string,
  accessDate?: string
): string {
  const parts: string[] = []

  // Author (Last, First)
  if (author) {
    parts.push(`${author}.`)
  }

  // Title (italicized)
  if (title) {
    parts.push(`*${title}*.`)
  }

  // Publisher
  if (publisher) {
    parts.push(`${publisher},`)
  }

  // Year
  if (year) {
    parts.push(`${year}.`)
  }

  // URL and access date
  if (url) {
    if (accessDate) {
      parts.push(`${url}. Accessed ${accessDate}.`)
    } else {
      parts.push(`${url}.`)
    }
  }

  return parts.join(' ') || 'Incomplete citation information'
}

// Estimate token count (rough approximation: 1 token ≈ 4 characters)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

