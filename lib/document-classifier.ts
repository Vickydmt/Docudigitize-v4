/**
 * Document classifier using natural (NLP library for JavaScript)
 * This replaces the Python scikit-learn implementation with a pure JavaScript solution
 * that works well on serverless platforms like Vercel and Netlify
 */

import natural from "natural"
import { removeStopwords, eng } from "stopword"

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

// TF-IDF implementation
const tfidf = new natural.TfIdf()

/**
 * Classify a document based on its text content
 */
export function classifyDocument(text: string): {
  documentType: string
  confidence: number
  possibleTypes: Array<{ type: string; probability: number }>
} {
  // Tokenize and normalize the text
  const tokenizer = new natural.WordTokenizer()
  const tokens = tokenizer.tokenize(text.toLowerCase()) || []

  // Remove stopwords
  const filteredTokens = removeStopwords(tokens, eng)

  // Calculate scores for each document type
  const scores: Record<string, number> = {}
  let totalScore = 0

  for (const [docType, keywords] of Object.entries(DOCUMENT_TYPES)) {
    // Count keyword matches
    let matches = 0
    for (const keyword of keywords) {
      // Check for single words
      if (keyword.indexOf(" ") === -1) {
        if (filteredTokens.includes(keyword)) {
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
  // Clear any previous documents
  tfidf.documents = []

  // Add the document
  tfidf.addDocument(text)

  // Get the top terms
  const terms: Array<{ term: string; tfidf: number }> = []

  tfidf.listTerms(0).forEach((item) => {
    if (item.term.length > 2) {
      // Only include terms with more than 2 characters
      terms.push({
        term: item.term,
        tfidf: item.tfidf,
      })
    }
  })

  // Sort by TF-IDF score and return the top terms
  return terms
    .sort((a, b) => b.tfidf - a.tfidf)
    .slice(0, maxTerms)
    .map((item) => item.term)
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
