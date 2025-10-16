// Simple test script to verify our custom NLP system
const { advancedNLP } = require('./lib/advanced-nlp.ts')

async function testNLP() {
  console.log('🧪 Testing Custom NLP System...')
  
  try {
    // Test humanization
    console.log('\n1. Testing Humanization...')
    const testText = "The utilization of sophisticated methodologies facilitates the optimization of comprehensive solutions."
    console.log('Input:', testText)
    
    const humanized = await advancedNLP.humanizeText(testText)
    console.log('Output:', humanized)
    
    // Test paraphrasing
    console.log('\n2. Testing Paraphrasing...')
    const paraphraseText = "The quick brown fox jumps over the lazy dog."
    console.log('Input:', paraphraseText)
    
    const paraphrased = await advancedNLP.paraphraseText(paraphraseText)
    console.log('Output:', paraphrased)
    
    // Test citation
    console.log('\n3. Testing Citation Generation...')
    const citationData = {
      type: 'apa',
      author: 'John Doe',
      title: 'Advanced NLP Techniques',
      year: '2024',
      publisher: 'Academic Press'
    }
    console.log('Input:', citationData)
    
    const citation = await advancedNLP.generateCitation(citationData)
    console.log('Output:', citation)
    
    console.log('\n✅ All NLP tests completed successfully!')
    
  } catch (error) {
    console.error('❌ NLP test failed:', error)
  }
}

testNLP()
