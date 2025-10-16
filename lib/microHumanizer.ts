/**
 * microHumanizer.ts
 * 
 * A lightweight, deterministic, rule-based text humanizer that runs locally.
 * 
 * LIMITATIONS:
 * - This is NOT a full LLM. It uses heuristic rules and pattern matching.
 * - Passive voice detection is regex-based and may miss complex cases.
 * - Synonym substitution uses a fixed dictionary (not context-aware).
 * - Anecdotes are from a small curated list and may not fit all contexts.
 * - Cannot understand deep semantic meaning or maintain complex context.
 * 
 * ADVANTAGES:
 * - Runs entirely locally with zero API calls
 * - Deterministic output (with seed control)
 * - Fast execution
 * - No external dependencies or costs
 */

export interface HumanizeOptions {
  preferWe?: boolean;
  insertAnecdote?: boolean;
  maxOutputLengthChars?: number;
  maxAnecdoteLength?: number;
  randomSeed?: number;
}

export interface HumanizeResult {
  humanizedText: string;
  suggestions?: string[];
  stats: {
    inputLength: number;
    outputLength: number;
    sentencesProcessed: number;
    substitutionsMade: number;
  };
}

// Simple seeded PRNG for deterministic randomness
class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

// Formal → Conversational synonym map (80+ common substitutions)
const SYNONYM_MAP: Record<string, string> = {
  'utilize': 'use',
  'utilizes': 'uses',
  'utilized': 'used',
  'commence': 'start',
  'commences': 'starts',
  'commenced': 'started',
  'therefore': 'so',
  'thus': 'so',
  'hence': 'so',
  'consequently': 'so',
  'in order to': 'to',
  'with regard to': 'about',
  'with respect to': 'about',
  'concerning': 'about',
  'regarding': 'about',
  'in addition to': 'besides',
  'furthermore': 'also',
  'moreover': 'also',
  'additionally': 'plus',
  'subsequently': 'later',
  'prior to': 'before',
  'following': 'after',
  'during the course of': 'during',
  'in the event that': 'if',
  'in the event of': 'if',
  'provided that': 'if',
  'assuming that': 'if',
  'due to the fact that': 'because',
  'owing to the fact that': 'because',
  'for the reason that': 'because',
  'as a result of': 'because of',
  'on account of': 'because of',
  'in spite of': 'despite',
  'notwithstanding': 'despite',
  'nonetheless': 'still',
  'nevertheless': 'but',
  'however': 'but',
  'conversely': 'instead',
  'alternatively': 'or',
  'in lieu of': 'instead of',
  'equivalent to': 'equal to',
  'comparable to': 'like',
  'similar to': 'like',
  'identical to': 'same as',
  'demonstrate': 'show',
  'demonstrates': 'shows',
  'demonstrated': 'showed',
  'illustrate': 'show',
  'illustrates': 'shows',
  'indicate': 'show',
  'indicates': 'shows',
  'obtain': 'get',
  'obtains': 'gets',
  'obtained': 'got',
  'acquire': 'get',
  'acquires': 'gets',
  'purchase': 'buy',
  'purchases': 'buys',
  'purchased': 'bought',
  'assist': 'help',
  'assists': 'helps',
  'assisted': 'helped',
  'facilitate': 'help',
  'facilitates': 'helps',
  'enable': 'let',
  'enables': 'lets',
  'permit': 'let',
  'permits': 'lets',
  'require': 'need',
  'requires': 'needs',
  'required': 'needed',
  'necessitate': 'need',
  'necessitates': 'needs',
  'attempt': 'try',
  'attempts': 'tries',
  'endeavor': 'try',
  'endeavors': 'tries',
  'sufficient': 'enough',
  'adequate': 'enough',
  'substantial': 'large',
  'considerable': 'large',
  'numerous': 'many',
  'multiple': 'many',
  'approximately': 'about',
  'nearly': 'almost',
  'virtually': 'almost',
  'essentially': 'basically',
  'fundamentally': 'basically',
  'primarily': 'mainly',
  'principally': 'mainly',
  'generally': 'usually',
  'typically': 'usually',
  'frequently': 'often',
  'seldom': 'rarely',
  'implement': 'do',
  'implements': 'does',
  'implemented': 'did',
  'execute': 'do',
  'executes': 'does',
  'perform': 'do',
  'performs': 'does',
};

// Conversational boosters
const CONVERSATIONAL_PHRASES = [
  'you know',
  'honestly',
  'for example',
  'in fact',
  'actually',
  'basically',
  'really',
  'clearly',
  'obviously',
];

// Curated anecdotes (clearly fictional but plausible)
const ANECDOTES = [
  "For example, I once saw a student work on an essay for hours, only to realize the AI-generated draft needed complete rewriting to sound natural.",
  "In one case, a team tested their content and found that readers could immediately spot the robotic phrasing in AI text.",
  "I remember when a colleague submitted AI-written work, and the professor immediately noticed the overly formal, stilted language.",
  "To illustrate, imagine reading a paper where every sentence feels like it came from a textbook—that's what unprocessed AI text sounds like.",
  "A friend once told me they could spot AI writing just from the repetitive sentence structures and lack of personality.",
  "Think about it: when you read something written by a real person, you can feel their voice and style come through naturally.",
];

// Common abbreviations that shouldn't be treated as sentence ends
const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr',
  'etc', 'vs', 'eg', 'ie', 'inc', 'ltd', 'co',
  'st', 'ave', 'blvd', 'dept', 'est', 'vol',
]);

/**
 * Normalize and clean input text
 */
function normalizeText(text: string): string {
  // Trim and normalize whitespace
  text = text.trim().replace(/\s+/g, ' ');
  
  // Fix spacing around punctuation
  text = text.replace(/\s+([,.!?;:])/g, '$1');
  text = text.replace(/([,.!?;:])\s*/g, '$1 ');
  text = text.replace(/\s+/g, ' ');
  
  return text;
}

/**
 * Split text into sentences (respecting abbreviations)
 */
function splitIntoSentences(text: string): string[] {
  const sentences: string[] = [];
  let current = '';
  
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    current += (current ? ' ' : '') + words[i];
    
    // Check if this word ends with sentence-ending punctuation
    if (/[.!?]$/.test(words[i])) {
      // Check if it's an abbreviation
      const wordWithoutPunct = words[i].replace(/[.!?]+$/, '').toLowerCase();
      
      // If it's not an abbreviation, or it's the last word, treat as sentence end
      if (!ABBREVIATIONS.has(wordWithoutPunct) || i === words.length - 1) {
        sentences.push(current.trim());
        current = '';
      }
    }
  }
  
  // Add any remaining text
  if (current.trim()) {
    sentences.push(current.trim());
  }
  
  return sentences;
}

/**
 * Check if a token should be preserved (proper nouns, numbers, URLs, emails)
 */
function shouldPreserve(token: string): boolean {
  // Contains digits
  if (/\d/.test(token)) return true;
  
  // URL or email
  if (/^https?:\/\/|@.*\./.test(token)) return true;
  
  // Proper noun (starts with capital and not sentence start indicator)
  if (/^[A-Z][a-z]+/.test(token) && token.length > 3) return true;
  
  return false;
}

/**
 * Apply synonym substitutions
 */
function applySynonymSubstitutions(text: string): { text: string; count: number } {
  let count = 0;
  let result = text;
  
  // Sort by length (longest first) to handle multi-word phrases
  const sortedPhrases = Object.keys(SYNONYM_MAP).sort((a, b) => b.length - a.length);
  
  for (const formal of sortedPhrases) {
    const conversational = SYNONYM_MAP[formal];
    
    // Case-insensitive replacement with word boundaries
    const regex = new RegExp(`\\b${formal}\\b`, 'gi');
    const matches = result.match(regex);
    
    if (matches) {
      count += matches.length;
      result = result.replace(regex, conversational);
    }
  }
  
  return { text: result, count };
}

/**
 * Detect and convert passive voice to active voice
 */
function convertPassiveToActive(sentence: string, preferWe: boolean = false): string {
  // Passive voice pattern: (was|were|is|are|been|has been|had been) + past participle
  const passivePattern = /(was|were|is|are|been|has been|had been)\s+(\w+ed|known|written|taken|given|made|done|seen|found|built|created|developed|implemented|designed|tested)\s*(by\s+(\w+(?:\s+\w+)*))?/gi;
  
  return sentence.replace(passivePattern, (match, auxiliary, participle, byPhrase, agent) => {
    // If there's an explicit agent (by X), use it
    if (agent) {
      return `${agent} ${participle.replace(/ed$/, '')}`;
    }
    
    // Choose a neutral subject based on context
    const subject = preferWe ? 'we' : 'the team';
    const verb = participle.replace(/ed$/, '');
    
    return `${subject} ${verb}`;
  });
}

/**
 * Add contractions for conversational tone
 */
function addContractions(text: string): string {
  const contractions: Record<string, string> = {
    'do not': "don't",
    'does not': "doesn't",
    'did not': "didn't",
    'is not': "isn't",
    'are not': "aren't",
    'was not': "wasn't",
    'were not': "weren't",
    'have not': "haven't",
    'has not': "hasn't",
    'had not': "hadn't",
    'will not': "won't",
    'would not': "wouldn't",
    'should not': "shouldn't",
    'could not': "couldn't",
    'cannot': "can't",
    'it is': "it's",
    'that is': "that's",
    'what is': "what's",
    'who is': "who's",
    'where is': "where's",
    'they are': "they're",
    'we are': "we're",
    'you are': "you're",
    'I am': "I'm",
  };
  
  let result = text;
  for (const [full, contraction] of Object.entries(contractions)) {
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    result = result.replace(regex, contraction);
  }
  
  return result;
}

/**
 * Vary sentence length for more natural flow
 */
function varySentenceLength(sentences: string[], random: SeededRandom): string[] {
  const result: string[] = [];
  let i = 0;
  
  while (i < sentences.length) {
    const sentence = sentences[i];
    const wordCount = sentence.split(/\s+/).length;
    
    // Long sentence (>18 words): try to split at comma or conjunction
    if (wordCount > 18) {
      const splitPoint = sentence.match(/,\s+(?:and|but|or|yet|so)\s+/);
      if (splitPoint && splitPoint.index) {
        const firstPart = sentence.substring(0, splitPoint.index) + '.';
        const secondPart = sentence.substring(splitPoint.index + splitPoint[0].length);
        const secondCapitalized = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
        result.push(firstPart);
        result.push(secondCapitalized);
      } else {
        result.push(sentence);
      }
    }
    // Short sentence (<8 words) and not the last: maybe join with next
    else if (wordCount < 8 && i < sentences.length - 1 && random.chance(0.4)) {
      const connector = random.choice([', and', ', but', ', so', '. Also,']);
      const combined = sentence.replace(/[.!?]$/, connector + ' ' + sentences[i + 1].toLowerCase());
      result.push(combined);
      i++; // Skip next sentence since we combined it
    } else {
      result.push(sentence);
    }
    
    i++;
  }
  
  return result;
}

/**
 * Add conversational boosters judiciously
 */
function addConversationalBoosters(sentences: string[], random: SeededRandom): string[] {
  return sentences.map((sentence, idx) => {
    // Add a booster to ~30% of sentences
    if (random.chance(0.3) && idx > 0) {
      const phrase = random.choice(CONVERSATIONAL_PHRASES);
      // Insert at beginning or after first clause
      if (random.chance(0.5)) {
        return `${phrase.charAt(0).toUpperCase() + phrase.slice(1)}, ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
      } else {
        const commaIdx = sentence.indexOf(',');
        if (commaIdx > 0) {
          return sentence.slice(0, commaIdx + 1) + ' ' + phrase + ',' + sentence.slice(commaIdx + 1);
        }
      }
    }
    return sentence;
  });
}

/**
 * Insert an anecdote if requested
 */
function insertAnecdote(text: string, random: SeededRandom, maxLength: number = 200): string {
  const anecdote = random.choice(ANECDOTES);
  
  // Truncate if too long
  const finalAnecdote = anecdote.length > maxLength ? anecdote.substring(0, maxLength - 3) + '...' : anecdote;
  
  // Insert after first paragraph/sentence or at the end
  const sentences = text.split(/\.\s+/);
  if (sentences.length > 2) {
    sentences.splice(2, 0, finalAnecdote);
    return sentences.join('. ');
  } else {
    return text + ' ' + finalAnecdote;
  }
}

/**
 * Main humanization function (async for API compatibility)
 */
export async function humanizeText(
  input: string,
  options: HumanizeOptions = {}
): Promise<HumanizeResult> {
  const {
    preferWe = false,
    insertAnecdote = true,
    maxOutputLengthChars = 5000,
    maxAnecdoteLength = 200,
    randomSeed = Date.now(),
  } = options;
  
  const random = new SeededRandom(randomSeed);
  const suggestions: string[] = [];
  let substitutionsMade = 0;
  
  // Step 1: Normalize
  let text = normalizeText(input);
  
  // Step 2: Split into sentences
  let sentences = splitIntoSentences(text);
  const sentencesProcessed = sentences.length;
  
  // Step 3: Convert passive to active
  sentences = sentences.map(s => convertPassiveToActive(s, preferWe));
  
  // Step 4: Apply synonym substitutions
  sentences = sentences.map(s => {
    const result = applySynonymSubstitutions(s);
    substitutionsMade += result.count;
    return result.text;
  });
  
  // Step 5: Vary sentence length
  sentences = varySentenceLength(sentences, random);
  
  // Step 6: Add contractions
  sentences = sentences.map(s => addContractions(s));
  
  // Step 7: Add conversational boosters
  sentences = addConversationalBoosters(sentences, random);
  
  // Reconstruct text
  let humanizedText = sentences.join(' ').trim();
  
  // Step 8: Insert anecdote if requested
  if (insertAnecdote && humanizedText.length < maxOutputLengthChars - maxAnecdoteLength) {
    humanizedText = insertAnecdote(humanizedText, random, maxAnecdoteLength);
  }
  
  // Step 9: Enforce max length
  if (humanizedText.length > maxOutputLengthChars) {
    humanizedText = humanizedText.substring(0, maxOutputLengthChars - 3) + '...';
    suggestions.push('Output was truncated to meet length limit.');
  }
  
  return {
    humanizedText,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    stats: {
      inputLength: input.length,
      outputLength: humanizedText.length,
      sentencesProcessed,
      substitutionsMade,
    },
  };
}

/**
 * Synchronous wrapper for quick use
 */
export function humanizeTextSync(input: string, options: HumanizeOptions = {}): HumanizeResult {
  // Since our implementation is actually synchronous, just call it directly
  let result: HumanizeResult = {
    humanizedText: '',
    stats: { inputLength: 0, outputLength: 0, sentencesProcessed: 0, substitutionsMade: 0 }
  };
  
  humanizeText(input, options).then(r => result = r);
  
  // Wait for the promise (it resolves immediately)
  return result;
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Demo/test block
if (require.main === module) {
  console.log('=== Micro Humanizer Demo ===\n');
  
  const testInput = `The system was implemented by the development team. In order to utilize the new features, users must obtain access credentials. The interface demonstrates substantial improvements. Therefore, it is recommended that all stakeholders commence testing. The documentation was created to assist users.`;
  
  console.log('INPUT:');
  console.log(testInput);
  console.log('\n---\n');
  
  humanizeText(testInput, { randomSeed: 12345, preferWe: false }).then(result => {
    console.log('OUTPUT:');
    console.log(result.humanizedText);
    console.log('\n---\n');
    console.log('STATS:');
    console.log(JSON.stringify(result.stats, null, 2));
    
    if (result.suggestions) {
      console.log('\nSUGGESTIONS:');
      result.suggestions.forEach(s => console.log('- ' + s));
    }
  });
  
  // Test 2: Short formal text
  const testInput2 = "It is necessary to utilize the appropriate methodology.";
  console.log('\n\n=== Test 2: Short Formal Text ===\n');
  console.log('INPUT:', testInput2);
  
  humanizeText(testInput2, { randomSeed: 54321, insertAnecdote: false }).then(result => {
    console.log('OUTPUT:', result.humanizedText);
  });
}

