import natural from 'natural'
import nlp from 'compromise'
import Sentiment from 'sentiment'
import syllable from 'syllable'

// Initialize natural language processing tools
const tokenizer = new natural.WordTokenizer()
const stemmer = natural.PorterStemmer
const sentiment = new Sentiment()

export class AdvancedNLP {
  private static instance: AdvancedNLP

  public static getInstance(): AdvancedNLP {
    if (!AdvancedNLP.instance) {
      AdvancedNLP.instance = new AdvancedNLP()
    }
    return AdvancedNLP.instance
  }

  /**
   * Advanced text humanization using multiple NLP techniques
   */
  async humanizeText(text: string): Promise<string> {
    try {
      console.log('Starting advanced text humanization...')
      
      // Step 1: Analyze the text structure and sentiment
      const analysis = this.analyzeText(text)
      
      // Step 2: Apply humanization techniques
      let humanizedText = this.applyHumanizationTechniques(text, analysis)
      
      // Step 3: Improve readability and flow
      humanizedText = this.improveReadability(humanizedText)
      
      // Step 4: Add natural variations
      humanizedText = this.addNaturalVariations(humanizedText)
      
      // Step 5: Final quality check
      humanizedText = this.qualityCheck(humanizedText)
      
      console.log('Advanced text humanization completed')
      return humanizedText
    } catch (error) {
      console.error('Error in advanced humanizeText:', error)
      throw new Error('Failed to humanize text with advanced NLP')
    }
  }

  /**
   * Advanced paraphrasing with meaning preservation
   */
  async paraphraseText(text: string): Promise<string> {
    try {
      console.log('Starting advanced text paraphrasing...')
      
      // Step 1: Extract semantic meaning
      const semantics = this.extractSemantics(text)
      
      // Step 2: Generate paraphrased version
      let paraphrasedText = this.generateParaphrase(text, semantics)
      
      // Step 3: Ensure meaning preservation
      paraphrasedText = this.preserveMeaning(paraphrasedText, semantics)
      
      // Step 4: Improve coherence
      paraphrasedText = this.improveCoherence(paraphrasedText)
      
      console.log('Advanced text paraphrasing completed')
      return paraphrasedText
    } catch (error) {
      console.error('Error in advanced paraphraseText:', error)
      throw new Error('Failed to paraphrase text with advanced NLP')
    }
  }

  /**
   * Generate citations with proper formatting
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
      console.log('Generating advanced citation...')
      
      const { type, author, title, year, publisher, url, accessDate } = citationData
      
      if (type === 'apa') {
        return this.generateAdvancedAPACitation(author, title, year, publisher, url, accessDate)
      } else {
        return this.generateAdvancedMLACitation(author, title, year, publisher, url, accessDate)
      }
    } catch (error) {
      console.error('Error in advanced generateCitation:', error)
      throw new Error('Failed to generate citation with advanced NLP')
    }
  }

  // Private helper methods

  private analyzeText(text: string): any {
    const doc = nlp(text)
    const tokens = tokenizer.tokenize(text)
    const sentimentScore = sentiment.analyze(text)
    
    return {
      wordCount: tokens.length,
      sentenceCount: doc.sentences().length,
      sentiment: sentimentScore,
      complexity: this.calculateComplexity(text),
      readability: this.calculateReadability(text),
      keyTerms: this.extractKeyTerms(text),
      structure: this.analyzeStructure(text)
    }
  }

  private applyHumanizationTechniques(text: string, analysis: any): string {
    let result = text
    
    // Apply different techniques based on text characteristics
    if (analysis.complexity > 0.7) {
      result = this.simplifyComplexText(result)
    }
    
    if (analysis.sentiment.score < -2) {
      result = this.softenNegativeTone(result)
    }
    
    if (analysis.readability < 0.5) {
      result = this.improveReadabilityScore(result)
    }
    
    // Add conversational elements
    result = this.addConversationalElements(result)
    
    // Vary sentence structure
    result = this.varySentenceStructure(result)
    
    return result
  }

  private improveReadability(text: string): string {
    let result = text
    
    // Break up long sentences
    const sentences = result.split(/[.!?]+/)
    const improvedSentences = sentences.map(sentence => {
      const words = sentence.trim().split(' ')
      if (words.length > 20) {
        // Split at natural break points
        const midPoint = Math.floor(words.length / 2)
        let breakPoint = midPoint
        
        // Find conjunction or comma
        for (let i = midPoint; i < words.length; i++) {
          if (words[i].match(/[,;]/) || words[i].toLowerCase().match(/^(and|but|or|so|yet|for|nor|while|although|because|since)$/)) {
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

  private addNaturalVariations(text: string): string {
    let result = text
    
    // Replace formal language with natural alternatives
    const formalReplacements: { [key: string]: string } = {
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
      'in accordance with': 'following',
      'subsequently': 'then',
      'furthermore': 'also',
      'moreover': 'what\'s more',
      'nevertheless': 'however',
      'consequently': 'so',
      'therefore': 'so'
    }

    for (const [formal, natural] of Object.entries(formalReplacements)) {
      const regex = new RegExp(`\\b${formal}\\b`, 'gi')
      result = result.replace(regex, natural)
    }
    
    return result
  }

  private qualityCheck(text: string): string {
    let result = text
    
    // Clean up formatting
    result = result.replace(/\s+/g, ' ')
    result = result.replace(/\.\s*\./g, '.')
    result = result.replace(/,\s*,/g, ',')
    
    // Ensure proper capitalization
    result = result.replace(/\.\s*([a-z])/g, (match, letter) => `. ${letter.toUpperCase()}`)
    
    // Trim whitespace
    result = result.trim()
    
    return result
  }

  private extractSemantics(text: string): any {
    const doc = nlp(text)
    
    return {
      entities: doc.people().out('array').concat(doc.places().out('array')),
      topics: doc.topics().out('array'),
      concepts: doc.nouns().out('array'),
      actions: doc.verbs().out('array'),
      relationships: this.extractRelationships(text),
      keyPhrases: this.extractKeyPhrases(text)
    }
  }

  private generateParaphrase(text: string, semantics: any): string {
    let result = text
    
    // Apply synonym replacement
    result = this.applySynonymReplacement(result)
    
    // Restructure sentences
    result = this.restructureSentences(result)
    
    // Change voice (active/passive)
    result = this.changeVoice(result)
    
    return result
  }

  private preserveMeaning(paraphrasedText: string, originalSemantics: any): string {
    // Check if key concepts are preserved
    const currentSemantics = this.extractSemantics(paraphrasedText)
    
    // Ensure important concepts are still present
    const missingConcepts = originalSemantics.concepts.filter((concept: string) => 
      !paraphrasedText.toLowerCase().includes(concept.toLowerCase())
    )
    
    if (missingConcepts.length > 0) {
      // Add missing concepts naturally
      const sentences = paraphrasedText.split(/[.!?]+/)
      const lastSentence = sentences[sentences.length - 1]
      
      if (lastSentence && missingConcepts.length > 0) {
        const concept = missingConcepts[0]
        sentences[sentences.length - 1] = `${lastSentence} This involves ${concept}.`
        paraphrasedText = sentences.join('. ')
      }
    }
    
    return paraphrasedText
  }

  private improveCoherence(text: string): string {
    let result = text
    
    // Add transitional phrases
    const transitions = [
      'Additionally, ',
      'Furthermore, ',
      'Moreover, ',
      'In addition, ',
      'What\'s more, ',
      'It\'s also worth noting that ',
      'Another important point is that '
    ]
    
    const sentences = result.split(/[.!?]+/)
    const improvedSentences = sentences.map((sentence, index) => {
      if (index > 0 && Math.random() < 0.3) {
        const transition = transitions[Math.floor(Math.random() * transitions.length)]
        return transition + sentence.trim()
      }
      return sentence
    })
    
    result = improvedSentences.join('. ')
    
    return result
  }

  private calculateComplexity(text: string): number {
    const words = text.split(' ')
    const sentences = text.split(/[.!?]+/)
    const syllables = words.reduce((total, word) => total + syllable(word), 0)
    
    // Flesch Reading Ease Score (simplified)
    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = syllables / words.length
    
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    return Math.max(0, Math.min(1, (100 - score) / 100))
  }

  private calculateReadability(text: string): number {
    const words = text.split(' ')
    const sentences = text.split(/[.!?]+/)
    const complexWords = words.filter(word => syllable(word) > 2).length
    
    return 1 - (complexWords / words.length)
  }

  private extractKeyTerms(text: string): string[] {
    const doc = nlp(text)
    const nouns = doc.nouns().out('array')
    const adjectives = doc.adjectives().out('array')
    
    // Get most frequent terms
    const termFrequency: { [key: string]: number } = {}
    const allTerms = [...nouns, ...adjectives]
    
    allTerms.forEach(term => {
      const lowerTerm = term.toLowerCase()
      termFrequency[lowerTerm] = (termFrequency[lowerTerm] || 0) + 1
    })
    
    return Object.entries(termFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([term]) => term)
  }

  private analyzeStructure(text: string): any {
    const sentences = text.split(/[.!?]+/)
    const words = text.split(' ')
    
    return {
      avgWordsPerSentence: words.length / sentences.length,
      sentenceVariety: this.calculateSentenceVariety(sentences),
      paragraphStructure: this.analyzeParagraphStructure(text)
    }
  }

  private calculateSentenceVariety(sentences: string[]): number {
    const lengths = sentences.map(s => s.trim().split(' ').length)
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const variance = lengths.reduce((sum, length) => sum + Math.pow(length - avgLength, 2), 0) / lengths.length
    
    return Math.sqrt(variance) / avgLength
  }

  private analyzeParagraphStructure(text: string): any {
    const paragraphs = text.split('\n\n')
    return {
      paragraphCount: paragraphs.length,
      avgSentencesPerParagraph: paragraphs.map(p => p.split(/[.!?]+/).length).reduce((a, b) => a + b, 0) / paragraphs.length
    }
  }

  private simplifyComplexText(text: string): string {
    let result = text
    
    // Replace complex words with simpler alternatives
    const simplifications: { [key: string]: string } = {
      'sophisticated': 'advanced',
      'comprehensive': 'complete',
      'utilization': 'use',
      'implementation': 'putting in place',
      'facilitation': 'help',
      'optimization': 'improvement',
      'configuration': 'setup',
      'documentation': 'docs',
      'methodology': 'method',
      'infrastructure': 'foundation'
    }
    
    for (const [complex, simple] of Object.entries(simplifications)) {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi')
      result = result.replace(regex, simple)
    }
    
    return result
  }

  private softenNegativeTone(text: string): string {
    let result = text
    
    // Replace harsh words with softer alternatives
    const softeners: { [key: string]: string } = {
      'terrible': 'not great',
      'awful': 'poor',
      'horrible': 'bad',
      'disaster': 'problem',
      'failure': 'issue',
      'wrong': 'incorrect',
      'stupid': 'unwise',
      'ridiculous': 'unreasonable'
    }
    
    for (const [harsh, soft] of Object.entries(softeners)) {
      const regex = new RegExp(`\\b${harsh}\\b`, 'gi')
      result = result.replace(regex, soft)
    }
    
    return result
  }

  private improveReadabilityScore(text: string): string {
    let result = text
    
    // Break up long sentences
    const sentences = result.split(/[.!?]+/)
    const improvedSentences = sentences.map(sentence => {
      const words = sentence.trim().split(' ')
      if (words.length > 15) {
        // Find natural break points
        const breakPoints = [Math.floor(words.length / 3), Math.floor(words.length * 2 / 3)]
        
        for (const breakPoint of breakPoints) {
          if (words[breakPoint] && words[breakPoint].match(/[,;]/)) {
            const firstPart = words.slice(0, breakPoint + 1).join(' ')
            const secondPart = words.slice(breakPoint + 1).join(' ')
            return `${firstPart} ${secondPart.charAt(0).toLowerCase() + secondPart.slice(1)}`
          }
        }
      }
      return sentence
    })
    
    result = improvedSentences.join('. ')
    
    return result
  }

  private addConversationalElements(text: string): string {
    let result = text
    
    // Add natural connectors
    const connectors = [
      'Actually, ',
      'In fact, ',
      'What\'s interesting is that ',
      'It\'s worth noting that ',
      'Keep in mind that ',
      'It\'s important to understand that ',
      'What\'s more, ',
      'Additionally, '
    ]
    
    const sentences = result.split(/[.!?]+/)
    const modifiedSentences = sentences.map((sentence, index) => {
      if (index > 0 && Math.random() < 0.2) {
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
    const starters = [
      'It is important to note that',
      'One key point is that',
      'Another consideration is that',
      'What is particularly interesting is that',
      'It should be mentioned that',
      'Keep in mind that'
    ]
    
    const sentences = result.split(/[.!?]+/)
    const variedSentences = sentences.map((sentence, index) => {
      if (index > 0 && Math.random() < 0.15) {
        const starter = starters[Math.floor(Math.random() * starters.length)]
        return `${starter} ${sentence.trim().toLowerCase()}`
      }
      return sentence
    })
    
    result = variedSentences.join('. ')
    
    return result
  }

  private extractRelationships(text: string): string[] {
    const doc = nlp(text)
    const relationships: string[] = []
    
    // Extract subject-verb-object relationships
    const sentences = doc.sentences()
    sentences.forEach((sentence: any) => {
      const subjects = sentence.match('#Noun+').out('array')
      const verbs = sentence.match('#Verb+').out('array')
      const objects = sentence.match('#Noun+').out('array')
      
      if (subjects.length > 0 && verbs.length > 0) {
        relationships.push(`${subjects[0]} ${verbs[0]} ${objects[0] || ''}`.trim())
      }
    })
    
    return relationships
  }

  private extractKeyPhrases(text: string): string[] {
    const doc = nlp(text)
    const phrases = doc.match('#Noun+ #Noun+').out('array')
    return phrases.slice(0, 5) // Top 5 key phrases
  }

  private applySynonymReplacement(text: string): string {
    let result = text
    
    // Comprehensive synonym dictionary
    const synonyms: { [key: string]: string[] } = {
      'good': ['excellent', 'great', 'wonderful', 'fantastic', 'outstanding', 'superb', 'remarkable'],
      'bad': ['poor', 'terrible', 'awful', 'horrible', 'dreadful', 'unfortunate', 'disappointing'],
      'big': ['large', 'huge', 'enormous', 'massive', 'giant', 'substantial', 'considerable'],
      'small': ['tiny', 'little', 'miniature', 'compact', 'petite', 'modest', 'minimal'],
      'important': ['crucial', 'vital', 'essential', 'significant', 'key', 'critical', 'paramount'],
      'help': ['assist', 'aid', 'support', 'facilitate', 'enable', 'guide', 'direct'],
      'show': ['demonstrate', 'display', 'reveal', 'exhibit', 'present', 'illustrate', 'indicate'],
      'make': ['create', 'produce', 'generate', 'develop', 'construct', 'build', 'establish'],
      'use': ['utilize', 'employ', 'apply', 'implement', 'leverage', 'harness', 'exploit'],
      'get': ['obtain', 'acquire', 'receive', 'attain', 'secure', 'gain', 'achieve'],
      'think': ['consider', 'believe', 'suppose', 'assume', 'contemplate', 'reflect', 'ponder'],
      'know': ['understand', 'comprehend', 'realize', 'recognize', 'grasp', 'perceive', 'appreciate'],
      'see': ['observe', 'notice', 'perceive', 'detect', 'spot', 'identify', 'recognize'],
      'say': ['state', 'declare', 'mention', 'express', 'communicate', 'convey', 'articulate'],
      'go': ['move', 'travel', 'proceed', 'advance', 'continue', 'progress', 'journey']
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
      
      // Passive to active conversions
      restructured = restructured.replace(/is\s+(\w+ed)\s+by\s+(\w+)/gi, (match, verb, subject) => {
        return `${subject} ${verb}s`
      })
      
      restructured = restructured.replace(/was\s+(\w+ed)\s+by\s+(\w+)/gi, (match, verb, subject) => {
        return `${subject} ${verb}ed`
      })
      
      restructured = restructured.replace(/are\s+(\w+ed)\s+by\s+(\w+)/gi, (match, verb, subject) => {
        return `${subject} ${verb}`
      })
      
      return restructured
    })
    
    result = restructuredSentences.join('. ')
    
    return result
  }

  private changeVoice(text: string): string {
    let result = text
    
    // Simple voice changes
    const voiceChanges: { [key: string]: string } = {
      'it is believed that': 'people believe that',
      'it is known that': 'we know that',
      'it is said that': 'people say that',
      'it is thought that': 'people think that',
      'it is considered that': 'people consider that'
    }
    
    for (const [passive, active] of Object.entries(voiceChanges)) {
      const regex = new RegExp(passive, 'gi')
      result = result.replace(regex, active)
    }
    
    return result
  }

  private generateAdvancedAPACitation(author?: string, title?: string, year?: string, publisher?: string, url?: string, accessDate?: string): string {
    let citation = ''
    
    if (author) {
      // Format author name properly
      const authorParts = author.split(' ')
      if (authorParts.length >= 2) {
        const lastName = authorParts[authorParts.length - 1]
        const firstName = authorParts.slice(0, -1).join(' ')
        citation += `${lastName}, ${firstName.charAt(0).toUpperCase()}.`
      } else {
        citation += author
      }
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

  private generateAdvancedMLACitation(author?: string, title?: string, year?: string, publisher?: string, url?: string, accessDate?: string): string {
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
export const advancedNLP = AdvancedNLP.getInstance()
