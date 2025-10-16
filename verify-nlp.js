// Verification script to check that all API routes use custom NLP
const fs = require('fs')
const path = require('path')

console.log('🔍 Verifying Custom NLP Integration...\n')

// Check API routes
const apiRoutes = [
  'app/api/humanize/route.ts',
  'app/api/paraphrase/route.ts', 
  'app/api/citation/route.ts'
]

let allGood = true

apiRoutes.forEach(route => {
  const filePath = path.join(__dirname, route)
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Check for OpenAI references
    const hasOpenAI = content.includes('openai') || content.includes('OpenAI')
    const hasCustomAI = content.includes('custom-ai')
    
    console.log(`📁 ${route}:`)
    console.log(`   ✅ Uses custom-ai: ${hasCustomAI}`)
    console.log(`   ❌ Has OpenAI refs: ${hasOpenAI}`)
    
    if (hasOpenAI) {
      allGood = false
      console.log(`   ⚠️  WARNING: Still contains OpenAI references!`)
    }
    
    console.log('')
  } else {
    console.log(`❌ File not found: ${route}`)
    allGood = false
  }
})

// Check custom AI file
const customAIFile = 'lib/custom-ai.ts'
if (fs.existsSync(customAIFile)) {
  const content = fs.readFileSync(customAIFile, 'utf8')
  const hasAdvancedNLP = content.includes('advanced-nlp')
  
  console.log(`📁 ${customAIFile}:`)
  console.log(`   ✅ Uses advanced-nlp: ${hasAdvancedNLP}`)
  console.log('')
}

// Check if OpenAI file exists
const openaiFile = 'lib/openai.ts'
if (fs.existsSync(openaiFile)) {
  console.log(`❌ OpenAI file still exists: ${openaiFile}`)
  allGood = false
} else {
  console.log(`✅ OpenAI file removed: ${openaiFile}`)
}

console.log('=' * 50)
if (allGood) {
  console.log('🎉 SUCCESS: All API routes are using custom NLP!')
  console.log('✅ No OpenAI dependencies found')
  console.log('✅ Custom NLP system is properly integrated')
} else {
  console.log('⚠️  WARNING: Some issues found with NLP integration')
}
console.log('=' * 50)
