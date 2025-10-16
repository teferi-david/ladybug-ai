import { advancedNLP } from './advanced-nlp'

export class NLPTestSuite {
  private static instance: NLPTestSuite

  public static getInstance(): NLPTestSuite {
    if (!NLPTestSuite.instance) {
      NLPTestSuite.instance = new NLPTestSuite()
    }
    return NLPTestSuite.instance
  }

  /**
   * Test the humanization functionality
   */
  async testHumanization(): Promise<{ success: boolean; result?: string; error?: string }> {
    try {
      console.log('Testing humanization...')
      
      const testText = "The utilization of sophisticated methodologies facilitates the optimization of comprehensive solutions."
      const result = await advancedNLP.humanizeText(testText)
      
      console.log('Humanization test completed')
      return { success: true, result }
    } catch (error: any) {
      console.error('Humanization test failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Test the paraphrasing functionality
   */
  async testParaphrasing(): Promise<{ success: boolean; result?: string; error?: string }> {
    try {
      console.log('Testing paraphrasing...')
      
      const testText = "The quick brown fox jumps over the lazy dog. This is a test sentence for paraphrasing."
      const result = await advancedNLP.paraphraseText(testText)
      
      console.log('Paraphrasing test completed')
      return { success: true, result }
    } catch (error: any) {
      console.error('Paraphrasing test failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Test the citation generation functionality
   */
  async testCitationGeneration(): Promise<{ success: boolean; result?: string; error?: string }> {
    try {
      console.log('Testing citation generation...')
      
      const testData = {
        type: 'apa' as const,
        author: 'John Doe',
        title: 'Advanced NLP Techniques',
        year: '2024',
        publisher: 'Academic Press',
        url: 'https://example.com',
        accessDate: '2024-01-15'
      }
      
      const result = await advancedNLP.generateCitation(testData)
      
      console.log('Citation generation test completed')
      return { success: true, result }
    } catch (error: any) {
      console.error('Citation generation test failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<{
    humanization: { success: boolean; result?: string; error?: string }
    paraphrasing: { success: boolean; result?: string; error?: string }
    citation: { success: boolean; result?: string; error?: string }
    overall: boolean
  }> {
    console.log('Running comprehensive NLP test suite...')
    
    const humanization = await this.testHumanization()
    const paraphrasing = await this.testParaphrasing()
    const citation = await this.testCitationGeneration()
    
    const overall = humanization.success && paraphrasing.success && citation.success
    
    console.log('NLP test suite completed')
    
    return {
      humanization,
      paraphrasing,
      citation,
      overall
    }
  }

  /**
   * Test with real-world examples
   */
  async testRealWorldExamples(): Promise<{
    academic: { success: boolean; result?: string; error?: string }
    business: { success: boolean; result?: string; error?: string }
    creative: { success: boolean; result?: string; error?: string }
  }> {
    console.log('Testing with real-world examples...')
    
    // Academic text
    const academicText = "The implementation of machine learning algorithms has revolutionized the field of natural language processing, enabling unprecedented accuracy in text analysis and generation."
    const academicResult = await this.testText(academicText)
    
    // Business text
    const businessText = "Our company's strategic initiatives focus on leveraging cutting-edge technology to enhance customer experience and drive operational efficiency."
    const businessResult = await this.testText(businessText)
    
    // Creative text
    const creativeText = "The moonlight danced across the tranquil lake, creating shimmering reflections that seemed to whisper secrets of the night."
    const creativeResult = await this.testText(creativeText)
    
    return {
      academic: academicResult,
      business: businessResult,
      creative: creativeResult
    }
  }

  private async testText(text: string): Promise<{ success: boolean; result?: string; error?: string }> {
    try {
      const result = await advancedNLP.humanizeText(text)
      return { success: true, result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

// Export singleton instance
export const nlpTestSuite = NLPTestSuite.getInstance()
