import natural from 'natural'
import nlp from 'compromise'
import Sentiment from 'sentiment'
import syllable from 'syllable'

// Initialize sentiment analyzer
const sentiment = new Sentiment()

// Initialize natural language processing tools
const tokenizer = new natural.WordTokenizer()
const stemmer = natural.PorterStemmer

export class CustomNLP {
  private static instance: CustomNLP

  public static getInstance(): CustomNLP {
    if (!CustomNLP.instance) {
      CustomNLP.instance = new CustomNLP()
    }
    return CustomNLP.instance
  }

  /**
   * Humanize text by making it sound more natural and human-like
   */
  async humanizeText(text: string): Promise<string> {
    try {
      console.log('Starting text humanization...')
      
      // Step 1: Parse the text using compromise
      const doc = nlp(text)
      
      // Step 2: Add natural variations
      let humanizedText = this.addNaturalVariations(doc.text())
      
      // Step 3: Improve sentence flow
      humanizedText = this.improveSentenceFlow(humanizedText)
      
      // Step 4: Add conversational elements
      humanizedText = this.addConversationalElements(humanizedText)
      
      // Step 5: Vary sentence structure
      humanizedText = this.varySentenceStructure(humanizedText)
      
      // Step 6: Final polish
      humanizedText = this.finalPolish(humanizedText)
      
      console.log('Text humanization completed')
      return humanizedText
    } catch (error) {
      console.error('Error in humanizeText:', error)
      throw new Error('Failed to humanize text')
    }
  }

  /**
   * Paraphrase text while maintaining meaning
   */
  async paraphraseText(text: string): Promise<string> {
    try {
      console.log('Starting text paraphrasing...')
      
      // Step 1: Parse the text
      const doc = nlp(text)
      
      // Step 2: Extract key concepts
      const concepts = this.extractKeyConcepts(doc.text())
      
      // Step 3: Rewrite with different words
      let paraphrasedText = this.rewriteWithSynonyms(doc.text())
      
      // Step 4: Restructure sentences
      paraphrasedText = this.restructureSentences(paraphrasedText)
      
      // Step 5: Maintain coherence
      paraphrasedText = this.maintainCoherence(paraphrasedText, concepts)
      
      console.log('Text paraphrasing completed')
      return paraphrasedText
    } catch (error) {
      console.error('Error in paraphraseText:', error)
      throw new Error('Failed to paraphrase text')
    }
  }

  /**
   * Generate citations in APA or MLA format
   */
  async generateCitation(citationData: {
    type: 'apa' | 'mla'
    author?: string
    title?: string
    year?: string
    publisher?: string
    url?: string
    accessDate?: string
  }): Promise<string> {
    try {
      console.log('Generating citation...')
      
      const { type, author, title, year, publisher, url, accessDate } = citationData
      
      if (type === 'apa') {
        return this.generateAPACitation(author, title, year, publisher, url, accessDate)
      } else {
        return this.generateMLACitation(author, title, year, publisher, url, accessDate)
      }
    } catch (error) {
      console.error('Error in generateCitation:', error)
      throw new Error('Failed to generate citation')
    }
  }

  // Private helper methods

  private addNaturalVariations(text: string): string {
    // Add natural pauses and variations
    let result = text
    
    // Replace formal words with more natural ones
    const formalToNatural: { [key: string]: string } = {
      'utilize': 'use',
      'commence': 'start',
      'terminate': 'end',
      'facilitate': 'help',
      'implement': 'put in place',
      'endeavor': 'try',
      'ascertain': 'find out',
      'subsequent': 'next',
      'prior to': 'before',
      'in order to': 'to',
      'due to the fact that': 'because',
      'in the event that': 'if',
      'with regard to': 'about',
      'in accordance with': 'following'
    }

    for (const [formal, natural] of Object.entries(formalToNatural)) {
      const regex = new RegExp(`\\b${formal}\\b`, 'gi')
      result = result.replace(regex, natural)
    }

    return result
  }

  private improveSentenceFlow(text: string): string {
    // Break up long sentences and improve flow
    let result = text
    
    // Split overly long sentences
    const sentences = result.split(/[.!?]+/)
    const improvedSentences = sentences.map(sentence => {
      if (sentence.trim().split(' ').length > 25) {
        // Split long sentences at natural break points
        const words = sentence.trim().split(' ')
        const midPoint = Math.floor(words.length / 2)
        
        // Find a good break point (comma, conjunction, etc.)
        let breakPoint = midPoint
        for (let i = midPoint; i < words.length; i++) {
          if (words[i].match(/[,;]/) || words[i].toLowerCase().match(/^(and|but|or|so|yet|for|nor)$/)) {
            breakPoint = i + 1
            break
          }
        }
        
        const firstPart = words.slice(0, breakPoint).join(' ')
        const secondPart = words.slice(breakPoint).join(' ')
        return `${firstPart}. ${secondPart.charAt(0).toUpperCase() + secondPart.slice(1)}`
      }
      return sentence
    })
    
    result = improvedSentences.join('. ').replace(/\.\s*\./g, '.')
    
    return result
  }

  private addConversationalElements(text: string): string {
    let result = text
    
    // Add conversational connectors
    const connectors = [
      'Actually, ',
      'In fact, ',
      'What\'s more, ',
      'Interestingly, ',
      'It\'s worth noting that ',
      'Keep in mind that ',
      'It\'s important to understand that '
    ]
    
    // Randomly add connectors to some sentences
    const sentences = result.split(/[.!?]+/)
    const modifiedSentences = sentences.map((sentence, index) => {
      if (index > 0 && Math.random() < 0.3) { // 30% chance
        const connector = connectors[Math.floor(Math.random() * connectors.length)]
        return connector + sentence.trim()
      }
      return sentence
    })
    
    result = modifiedSentences.join('. ')
    
    return result
  }

  private varySentenceStructure(text: string): string {
    let result = text
    
    // Vary sentence beginnings
    const sentenceStarters = [
      'It is important to note that',
      'One key point is that',
      'Another consideration is that',
      'It should be mentioned that',
      'What is particularly interesting is that'
    ]
    
    const sentences = result.split(/[.!?]+/)
    const variedSentences = sentences.map((sentence, index) => {
      if (index > 0 && Math.random() < 0.2) { // 20% chance
        const starter = sentenceStarters[Math.floor(Math.random() * sentenceStarters.length)]
        return `${starter} ${sentence.trim().toLowerCase()}`
      }
      return sentence
    })
    
    result = variedSentences.join('. ')
    
    return result
  }

  private finalPolish(text: string): string {
    let result = text
    
    // Clean up any double spaces or punctuation
    result = result.replace(/\s+/g, ' ')
    result = result.replace(/\.\s*\./g, '.')
    result = result.replace(/,\s*,/g, ',')
    
    // Ensure proper capitalization
    result = result.replace(/\.\s*([a-z])/g, (match, letter) => `. ${letter.toUpperCase()}`)
    
    // Trim whitespace
    result = result.trim()
    
    return result
  }

  private extractKeyConcepts(text: string): string[] {
    const doc = nlp(text)
    const concepts: string[] = []
    
    // Extract nouns and important terms
    const nouns = doc.nouns().out('array')
    const adjectives = doc.adjectives().out('array')
    
    concepts.push(...nouns.slice(0, 5)) // Top 5 nouns
    concepts.push(...adjectives.slice(0, 3)) // Top 3 adjectives
    
    return [...new Set(concepts)] // Remove duplicates
  }

  private rewriteWithSynonyms(text: string): string {
    let result = text
    
    // Common synonym replacements
    const synonyms: { [key: string]: string[] } = {
      'good': ['excellent', 'great', 'wonderful', 'fantastic', 'outstanding'],
      'bad': ['poor', 'terrible', 'awful', 'horrible', 'dreadful'],
      'big': ['large', 'huge', 'enormous', 'massive', 'giant'],
      'small': ['tiny', 'little', 'miniature', 'compact', 'petite'],
      'important': ['crucial', 'vital', 'essential', 'significant', 'key'],
      'help': ['assist', 'aid', 'support', 'facilitate', 'enable'],
      'show': ['demonstrate', 'display', 'reveal', 'exhibit', 'present'],
      'make': ['create', 'produce', 'generate', 'develop', 'construct'],
      'use': ['utilize', 'employ', 'apply', 'implement', 'leverage'],
      'get': ['obtain', 'acquire', 'receive', 'attain', 'secure']
    }
    
    for (const [original, alternatives] of Object.entries(synonyms)) {
      const regex = new RegExp(`\\b${original}\\b`, 'gi')
      result = result.replace(regex, (match) => {
        const alternative = alternatives[Math.floor(Math.random() * alternatives.length)]
        return match.charAt(0) === match.charAt(0).toUpperCase() 
          ? alternative.charAt(0).toUpperCase() + alternative.slice(1)
          : alternative
      })
    }
    
    return result
  }

  private restructureSentences(text: string): string {
    let result = text
    
    // Change sentence structure patterns
    const sentences = result.split(/[.!?]+/)
    const restructuredSentences = sentences.map(sentence => {
      const trimmed = sentence.trim()
      if (trimmed.length < 10) return trimmed
      
      // Convert passive to active voice where possible
      let restructured = trimmed
      
      // Simple passive to active conversions
      restructured = restructured.replace(/is\s+(\w+ed)\s+by/gi, (match, verb) => {
        return `${verb}s`
      })
      
      restructured = restructured.replace(/was\s+(\w+ed)\s+by/gi, (match, verb) => {
        return `${verb}ed`
      })
      
      return restructured
    })
    
    result = restructuredSentences.join('. ')
    
    return result
  }

  private maintainCoherence(text: string, concepts: string[]): string {
    // Ensure the paraphrased text maintains the original concepts
    let result = text
    
    // Check if key concepts are still present
    const missingConcepts = concepts.filter(concept => 
      !result.toLowerCase().includes(concept.toLowerCase())
    )
    
    // If important concepts are missing, try to reintroduce them naturally
    if (missingConcepts.length > 0) {
      const sentences = result.split(/[.!?]+/)
      const lastSentence = sentences[sentences.length - 1]
      
      if (lastSentence && missingConcepts.length > 0) {
        const concept = missingConcepts[0]
        sentences[sentences.length - 1] = `${lastSentence} This relates to ${concept}.`
        result = sentences.join('. ')
      }
    }
    
    return result
  }

  private generateAPACitation(author?: string, title?: string, year?: string, publisher?: string, url?: string, accessDate?: string): string {
    let citation = ''
    
    if (author) {
      citation += author
    }
    
    if (year) {
      citation += ` (${year})`
    }
    
    if (title) {
      citation += `. ${title}`
    }
    
    if (publisher) {
      citation += `. ${publisher}`
    }
    
    if (url) {
      citation += `. Retrieved from ${url}`
    }
    
    if (accessDate) {
      citation += ` (accessed ${accessDate})`
    }
    
    return citation
  }

  private generateMLACitation(author?: string, title?: string, year?: string, publisher?: string, url?: string, accessDate?: string): string {
    let citation = ''
    
    if (author) {
      citation += author
    }
    
    if (title) {
      citation += `. "${title}"`
    }
    
    if (publisher) {
      citation += `. ${publisher}`
    }
    
    if (year) {
      citation += `, ${year}`
    }
    
    if (url) {
      citation += `. ${url}`
    }
    
    if (accessDate) {
      citation += `. Accessed ${accessDate}`
    }
    
    return citation
  }
}

// Export singleton instance
export const nlpEngine = CustomNLP.getInstance()
