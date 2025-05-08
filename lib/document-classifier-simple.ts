/**
 * Simplified document classifier that doesn't rely on the natural library
 * This avoids the Cloudflare dependencies that cause build issues on Netlify
 */

// Document types and their associated keywords
const DOCUMENT_TYPES: Record<string, string[]> = {
  invoice: ["invoice", "bill", "payment", "due date", "amount due", "total", "tax", "subtotal", "paid"],
  receipt: ["receipt", "thank you", "purchase", "item", "quantity", "price", "total", "cash", "change"],
  letter: ["dear", "sincerely", "regards", "letter", "address", "date", "subject", "reference"],
  resume: ["experience", "education", "skills", "resume", "cv", "career", "professional", "employment"],
  academic: ["abstract", "introduction", "conclusion", "references", "study", "research", "methodology"],
  legal: ["agreement", "contract", "terms", "conditions", "party", "clause", "hereby", "pursuant"],
  historical: ["historical", "history", "century", "ancient", "period", "era", "dated", "archive"],
  certificate: ["certificate", "certify", "awarded", "achievement", "completion", "qualified", "authorized"],
}

// Common stopwords to filter out
const STOPWORDS = [
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "in",
  "on",
  "at",
  "to",
  "for",
  "with",
  "by",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "from",
  "up",
  "down",
  "of",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "can",
  "will",
  "just",
  "don",
  "should",
  "now",
]

/**
 * Classify a document based on its text content
 */
export function classifyDocument(text: string): {
  documentType: string
  confidence: number
  possibleTypes: Array<{ type: string; probability: number }>
} {
  // Tokenize and normalize the text
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
    .split(/\s+/) // Split on whitespace
    .filter((word) => word.length > 1 && !STOPWORDS.includes(word)) // Remove stopwords and single characters

  // Calculate scores for each document type
  const scores: Record<string, number> = {}
  let totalScore = 0

  for (const [docType, keywords] of Object.entries(DOCUMENT_TYPES)) {
    // Count keyword matches
    let matches = 0
    for (const keyword of keywords) {
      // Check for single words
      if (keyword.indexOf(" ") === -1) {
        if (tokens.includes(keyword)) {
          matches++
        }
      } else {
        // Check for phrases
        if (text.toLowerCase().includes(keyword)) {
          matches++
        }
      }
    }

    // Calculate normalized score
    const score = matches / keywords.length
    scores[docType] = score
    totalScore += score
  }

  // Find the document type with the highest score
  let bestType = "unknown"
  let bestScore = 0

  for (const [docType, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestType = docType
    }
  }

  // Calculate confidence (normalize scores)
  const confidence = totalScore > 0 ? bestScore / totalScore : 0

  // Get all possible types with their probabilities
  const possibleTypes = Object.entries(scores)
    .map(([type, score]) => ({
      type,
      probability: totalScore > 0 ? score / totalScore : 0,
    }))
    .sort((a, b) => b.probability - a.probability)

  return {
    documentType: bestScore > 0.2 ? bestType : "unknown",
    confidence: Math.min(confidence, 1),
    possibleTypes,
  }
}

/**
 * Extract important terms from text
 */
export function extractImportantTerms(text: string, maxTerms = 10): string[] {
  // Simple term frequency implementation
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.includes(word))

  // Count term frequencies
  const termFrequency: Record<string, number> = {}
  for (const token of tokens) {
    termFrequency[token] = (termFrequency[token] || 0) + 1
  }

  // Sort by frequency and return top terms
  return Object.entries(termFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTerms)
    .map(([term]) => term)
}

/**
 * Extract metadata from document text
 */
export function extractMetadata(text: string): Record<string, any> {
  const metadata: Record<string, any> = {}

  // Extract potential key-value pairs
  const lines = text.split("\n")
  for (const line of lines) {
    if (line.includes(":")) {
      const [key, value] = line.split(":", 2)
      const trimmedKey = key.trim()
      const trimmedValue = value.trim()

      if (trimmedKey && trimmedValue) {
        metadata[trimmedKey] = trimmedValue
      }
    }
  }

  // Extract important terms
  metadata.important_terms = extractImportantTerms(text, 5)

  // Simple language detection
  metadata.detected_language = detectLanguage(text)

  return metadata
}

/**
 * Simple language detection
 */
function detectLanguage(text: string): string {
  const commonWords: Record<string, string[]> = {
    en: ["the", "and", "to", "of", "a", "in", "that", "is", "was", "for"],
    es: ["el", "la", "de", "y", "en", "que", "a", "los", "se", "un"],
    fr: ["le", "la", "de", "et", "en", "un", "une", "est", "que", "pour"],
    de: ["der", "die", "und", "in", "den", "von", "zu", "das", "mit", "sich"],
  }

  const textLower = text.toLowerCase()
  const langScores: Record<string, number> = {}

  for (const [lang, words] of Object.entries(commonWords)) {
    let score = 0
    for (const word of words) {
      const regex = new RegExp(`\\b${word}\\b`, "g")
      const matches = (textLower.match(regex) || []).length
      score += matches
    }
    langScores[lang] = score / words.length
  }

  // Find the language with the highest score
  let bestLang = "unknown"
  let bestScore = 0

  for (const [lang, score] of Object.entries(langScores)) {
    if (score > bestScore) {
      bestScore = score
      bestLang = lang
    }
  }

  return bestScore > 0.3 ? bestLang : "unknown"
}
