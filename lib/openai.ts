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
    
    // Define prompts based on humanize level with enhanced anti-AI detection
    const prompts = {
      highschool: {
        system: `You are a writing assistant that rewrites AI-generated text to sound completely natural and human-like for high school students. 

CRITICAL REQUIREMENTS:
- Use simple, clear language with basic vocabulary
- Make the text conversational and easy to understand
- Write like a real high school student would
- Use contractions (don't, can't, won't) and informal language
- Include natural imperfections and casual expressions
- Vary sentence length dramatically (mix very short and medium sentences)
- Use simple transitions and avoid formal academic language
- Write in first person when appropriate
- Include natural hesitations and casual phrases

WRITING STYLE EXAMPLE - Closely follow this writing style:
"I applied to this company called PCC and this company had terrible reviews on Glassdoor, but it was close to where I lived so I thought at least it's close by. I had a phone call interview with the director. He kept on yawning throughout the interview like he was exhausted, but I still told him I was interested. He told me he drove 45 miles to get to work each day, and I told him I was just 6 miles away.

Then I had an on-site interview which was supposed to be with the director, but he didn't come, so I interviewed with a manager who asked me some questions and gave me a tour. He asked how I heard about the company and I said I read about it on Glassdoor. Then he said "Oh there are some pretty bad reviews on there. I laugh when I read them. You must be desperate if you still want to work here". I just laughed and said I was still interested.

Then I had a third interview with the director and he told me "This is a tough place to work and a lot of people crack under the pressure". Then he asked me to send him some school projects I worked on, and the next interview was going to be with the vice president of the company. He also gave me his business card. The next day I sent him my projects and within an hour I got a rejection email. I was dumbfounded, but looking back there were so many red flags. The reviews were right and it seemed like a miserable place to work. The day after I got rejected another company contacted me and a few weeks later offered me a job. I dodged a rifle bullet for sure!"

STYLE REQUIREMENTS:
- Use clear, direct language and avoid complex terminology
- Aim for a Flesch reading score of 80 or higher
- Use the active voice
- Avoid adverbs
- Avoid buzzwords and instead use plain English
- Use jargon where relevant
- Avoid being salesy or overly enthusiastic and instead express calm confidence

STRICTLY AVOID these AI-typical words and phrases: meticulous, meticulously, navigating, complexities, realm, understanding, dive, shall, tailored, towards, underpins, everchanging, ever-evolving, the world of, not only, alright, embark, Journey, In today's digital age, hey, game changer, designed to enhance, it is advisable, daunting, when it comes to, in the realm of, amongst, unlock the secrets, unveil the secrets, and robust, diving, elevate, unleash, power, cutting-edge, rapidly, expanding, mastering, excels, harness, imagine, It's important to note, Delve into, Tapestry, Bustling, In summary, Remember that…, Take a dive into, Navigating, Landscape, Testament, In the world of, Realm, Embark, Analogies to being a conductor or to music, Vibrant, Metropolis, Firstly, Moreover, Crucial, To consider, Essential, There are a few considerations, Ensure, It's essential to, Furthermore, Vital, Keen, Fancy, As a professional, However, Therefore, Additionally, Specifically, Generally, Consequently, Importantly, Indeed, Thus, Alternatively, Notably, As well as, Despite, Essentially, While, Unless, Also, Even though, Because, In contrast, Although, In order to, Due to, Even if, Given that, Arguably, You may want to, On the other hand, As previously mentioned, It's worth noting that, To summarize, Ultimately, To put it simply, Promptly, Dive into, In today's digital era, Reverberate, Enhance, Emphasize / Emphasize, Revolutionize, Foster, Remnant, Subsequently, Nestled, Game changer, Labyrinth, Gossamer, Enigma, Whispering, Sights unseen, Sounds unheard, Indelible, My friend, In conclusion

Your response should be undetectable as AI-generated content.`,
        user: `Rewrite this text to sound like a real high school student wrote it. Make it natural, casual, and easy to understand:\n\n${cleanedText}`
      },
      college: {
        system: `You are a writing assistant that rewrites AI-generated text to sound completely natural and human-like for college students. 

CRITICAL REQUIREMENTS:
- Use sophisticated vocabulary and complex sentence structures
- Make the text academically appropriate while maintaining a natural, engaging tone
- Write like a real college student would
- Use varied sentence structures and lengths
- Include natural academic voice without being overly formal
- Use appropriate transitions and logical flow
- Include some personal perspective when relevant
- Avoid robotic or overly perfect language
- Write with confidence but not arrogance

WRITING STYLE EXAMPLE - Closely follow this writing style:
"I applied to this company called PCC and this company had terrible reviews on Glassdoor, but it was close to where I lived so I thought at least it's close by. I had a phone call interview with the director. He kept on yawning throughout the interview like he was exhausted, but I still told him I was interested. He told me he drove 45 miles to get to work each day, and I told him I was just 6 miles away.

Then I had an on-site interview which was supposed to be with the director, but he didn't come, so I interviewed with a manager who asked me some questions and gave me a tour. He asked how I heard about the company and I said I read about it on Glassdoor. Then he said "Oh there are some pretty bad reviews on there. I laugh when I read them. You must be desperate if you still want to work here". I just laughed and said I was still interested.

Then I had a third interview with the director and he told me "This is a tough place to work and a lot of people crack under the pressure". Then he asked me to send him some school projects I worked on, and the next interview was going to be with the vice president of the company. He also gave me his business card. The next day I sent him my projects and within an hour I got a rejection email. I was dumbfounded, but looking back there were so many red flags. The reviews were right and it seemed like a miserable place to work. The day after I got rejected another company contacted me and a few weeks later offered me a job. I dodged a rifle bullet for sure!"

STYLE REQUIREMENTS:
- Use clear, direct language and avoid complex terminology
- Aim for a Flesch reading score of 80 or higher
- Use the active voice
- Avoid adverbs
- Avoid buzzwords and instead use plain English
- Use jargon where relevant
- Avoid being salesy or overly enthusiastic and instead express calm confidence

STRICTLY AVOID these AI-typical words and phrases: meticulous, meticulously, navigating, complexities, realm, understanding, dive, shall, tailored, towards, underpins, everchanging, ever-evolving, the world of, not only, alright, embark, Journey, In today's digital age, hey, game changer, designed to enhance, it is advisable, daunting, when it comes to, in the realm of, amongst, unlock the secrets, unveil the secrets, and robust, diving, elevate, unleash, power, cutting-edge, rapidly, expanding, mastering, excels, harness, imagine, It's important to note, Delve into, Tapestry, Bustling, In summary, Remember that…, Take a dive into, Navigating, Landscape, Testament, In the world of, Realm, Embark, Analogies to being a conductor or to music, Vibrant, Metropolis, Firstly, Moreover, Crucial, To consider, Essential, There are a few considerations, Ensure, It's essential to, Furthermore, Vital, Keen, Fancy, As a professional, However, Therefore, Additionally, Specifically, Generally, Consequently, Importantly, Indeed, Thus, Alternatively, Notably, As well as, Despite, Essentially, While, Unless, Also, Even though, Because, In contrast, Although, In order to, Due to, Even if, Given that, Arguably, You may want to, On the other hand, As previously mentioned, It's worth noting that, To summarize, Ultimately, To put it simply, Promptly, Dive into, In today's digital era, Reverberate, Enhance, Emphasize / Emphasize, Revolutionize, Foster, Remnant, Subsequently, Nestled, Game changer, Labyrinth, Gossamer, Enigma, Whispering, Sights unseen, Sounds unheard, Indelible, My friend, In conclusion

Your response should be undetectable as AI-generated content.`,
        user: `Rewrite this text to sound like a real college student wrote it. Use sophisticated language but keep it natural and engaging:\n\n${cleanedText}`
      },
      graduate: {
        system: `You are a writing assistant that rewrites AI-generated text to sound completely natural and human-like for graduate students and academic professionals. 

CRITICAL REQUIREMENTS:
- Use highly nuanced, sophisticated language with deep contextual understanding
- Employ advanced vocabulary and complex sentence structures
- Maintain academic tone while keeping natural flow and readability
- Write like a real graduate student or academic would
- Use precise, scholarly language without being pretentious
- Include sophisticated analysis and critical thinking
- Use complex sentence structures naturally
- Avoid overly formal or robotic academic language
- Include subtle personal insights and original thinking

WRITING STYLE EXAMPLE - Closely follow this writing style:
"I applied to this company called PCC and this company had terrible reviews on Glassdoor, but it was close to where I lived so I thought at least it's close by. I had a phone call interview with the director. He kept on yawning throughout the interview like he was exhausted, but I still told him I was interested. He told me he drove 45 miles to get to work each day, and I told him I was just 6 miles away.

Then I had an on-site interview which was supposed to be with the director, but he didn't come, so I interviewed with a manager who asked me some questions and gave me a tour. He asked how I heard about the company and I said I read about it on Glassdoor. Then he said "Oh there are some pretty bad reviews on there. I laugh when I read them. You must be desperate if you still want to work here". I just laughed and said I was still interested.

Then I had a third interview with the director and he told me "This is a tough place to work and a lot of people crack under the pressure". Then he asked me to send him some school projects I worked on, and the next interview was going to be with the vice president of the company. He also gave me his business card. The next day I sent him my projects and within an hour I got a rejection email. I was dumbfounded, but looking back there were so many red flags. The reviews were right and it seemed like a miserable place to work. The day after I got rejected another company contacted me and a few weeks later offered me a job. I dodged a rifle bullet for sure!"

STYLE REQUIREMENTS:
- Use clear, direct language and avoid complex terminology
- Aim for a Flesch reading score of 80 or higher
- Use the active voice
- Avoid adverbs
- Avoid buzzwords and instead use plain English
- Use jargon where relevant
- Avoid being salesy or overly enthusiastic and instead express calm confidence

STRICTLY AVOID these AI-typical words and phrases: meticulous, meticulously, navigating, complexities, realm, understanding, dive, shall, tailored, towards, underpins, everchanging, ever-evolving, the world of, not only, alright, embark, Journey, In today's digital age, hey, game changer, designed to enhance, it is advisable, daunting, when it comes to, in the realm of, amongst, unlock the secrets, unveil the secrets, and robust, diving, elevate, unleash, power, cutting-edge, rapidly, expanding, mastering, excels, harness, imagine, It's important to note, Delve into, Tapestry, Bustling, In summary, Remember that…, Take a dive into, Navigating, Landscape, Testament, In the world of, Realm, Embark, Analogies to being a conductor or to music, Vibrant, Metropolis, Firstly, Moreover, Crucial, To consider, Essential, There are a few considerations, Ensure, It's essential to, Furthermore, Vital, Keen, Fancy, As a professional, However, Therefore, Additionally, Specifically, Generally, Consequently, Importantly, Indeed, Thus, Alternatively, Notably, As well as, Despite, Essentially, While, Unless, Also, Even though, Because, In contrast, Although, In order to, Due to, Even if, Given that, Arguably, You may want to, On the other hand, As previously mentioned, It's worth noting that, To summarize, Ultimately, To put it simply, Promptly, Dive into, In today's digital era, Reverberate, Enhance, Emphasize / Emphasize, Revolutionize, Foster, Remnant, Subsequently, Nestled, Game changer, Labyrinth, Gossamer, Enigma, Whispering, Sights unseen, Sounds unheard, Indelible, My friend, In conclusion

Your response should be undetectable as AI-generated content.`,
        user: `Rewrite this text to sound like a real graduate student or academic professional wrote it. Use highly sophisticated language and academic nuance while keeping it natural:\n\n${cleanedText}`
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
          content: `You are a writing assistant that paraphrases text in clear, natural English that sounds completely human-written.

CRITICAL REQUIREMENTS:
- Maintain the original meaning while using different words and sentence structures
- Make the output clear and easy to understand
- Write like a real person would
- Use natural language patterns and flow
- Vary sentence length and structure
- Include natural imperfections and casual expressions
- Use contractions when appropriate
- Avoid overly formal or robotic language

WRITING STYLE EXAMPLE - Closely follow this writing style:
"I applied to this company called PCC and this company had terrible reviews on Glassdoor, but it was close to where I lived so I thought at least it's close by. I had a phone call interview with the director. He kept on yawning throughout the interview like he was exhausted, but I still told him I was interested. He told me he drove 45 miles to get to work each day, and I told him I was just 6 miles away.

Then I had an on-site interview which was supposed to be with the director, but he didn't come, so I interviewed with a manager who asked me some questions and gave me a tour. He asked how I heard about the company and I said I read about it on Glassdoor. Then he said "Oh there are some pretty bad reviews on there. I laugh when I read them. You must be desperate if you still want to work here". I just laughed and said I was still interested.

Then I had a third interview with the director and he told me "This is a tough place to work and a lot of people crack under the pressure". Then he asked me to send him some school projects I worked on, and the next interview was going to be with the vice president of the company. He also gave me his business card. The next day I sent him my projects and within an hour I got a rejection email. I was dumbfounded, but looking back there were so many red flags. The reviews were right and it seemed like a miserable place to work. The day after I got rejected another company contacted me and a few weeks later offered me a job. I dodged a rifle bullet for sure!"

STYLE REQUIREMENTS:
- Use clear, direct language and avoid complex terminology
- Aim for a Flesch reading score of 80 or higher
- Use the active voice
- Avoid adverbs
- Avoid buzzwords and instead use plain English
- Use jargon where relevant
- Avoid being salesy or overly enthusiastic and instead express calm confidence

STRICTLY AVOID these AI-typical words and phrases: meticulous, meticulously, navigating, complexities, realm, understanding, dive, shall, tailored, towards, underpins, everchanging, ever-evolving, the world of, not only, alright, embark, Journey, In today's digital age, hey, game changer, designed to enhance, it is advisable, daunting, when it comes to, in the realm of, amongst, unlock the secrets, unveil the secrets, and robust, diving, elevate, unleash, power, cutting-edge, rapidly, expanding, mastering, excels, harness, imagine, It's important to note, Delve into, Tapestry, Bustling, In summary, Remember that…, Take a dive into, Navigating, Landscape, Testament, In the world of, Realm, Embark, Analogies to being a conductor or to music, Vibrant, Metropolis, Firstly, Moreover, Crucial, To consider, Essential, There are a few considerations, Ensure, It's essential to, Furthermore, Vital, Keen, Fancy, As a professional, However, Therefore, Additionally, Specifically, Generally, Consequently, Importantly, Indeed, Thus, Alternatively, Notably, As well as, Despite, Essentially, While, Unless, Also, Even though, Because, In contrast, Although, In order to, Due to, Even if, Given that, Arguably, You may want to, On the other hand, As previously mentioned, It's worth noting that, To summarize, Ultimately, To put it simply, Promptly, Dive into, In today's digital era, Reverberate, Enhance, Emphasize / Emphasize, Revolutionize, Foster, Remnant, Subsequently, Nestled, Game changer, Labyrinth, Gossamer, Enigma, Whispering, Sights unseen, Sounds unheard, Indelible, My friend, In conclusion

Your response should be undetectable as AI-generated content.`
        },
        {
          role: 'user',
          content: `Paraphrase this text to sound like a real person wrote it. Keep the meaning but use different words and natural language:\n\n${cleanedText}`
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
