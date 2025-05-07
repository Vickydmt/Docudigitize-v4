import { createWorker } from "tesseract.js"

// Common OCR errors and their corrections
const ocrErrorDictionary = {
  // Character substitutions
  l: ["1", "i", "|"],
  i: ["1", "l", "|", "!"],
  "0": ["o", "O", "D"],
  o: ["0", "c", "e"],
  rn: ["m"],
  m: ["rn", "nn"],
  cl: ["d"],
  vv: ["w"],
  nn: ["m"],
  ii: ["u"],
  f: ["t"],
  B: ["8"],
  S: ["5"],
  Z: ["2"],
  G: ["6"],
  I: ["1", "l"],
  O: ["0", "D"],

  // Historical document specific errors
  ſ: ["s", "f"], // Long s character
  æ: ["ae"],
  œ: ["oe"],
  ƒ: ["f"],
  ß: ["ss"],
  þ: ["th"],
  ð: ["d", "th"],
  ȝ: ["y", "g", "z"],
  ƿ: ["w", "p"],

  // Common ligatures
  fi: ["f i", "f1"],
  fl: ["f l", "f1"],
  ff: ["tf", "ft"],

  // Common word errors
  tbe: ["the"],
  tbat: ["that"],
  bave: ["have"],
  tbe: ["the"],
  witb: ["with"],
  tbis: ["this"],
  tbese: ["these"],
  tbose: ["those"],
  tban: ["than"],
  wbich: ["which"],
  wben: ["when"],
  wbere: ["where"],
  bere: ["here"],
  tbere: ["there"],
  tbey: ["they"],
  tbeir: ["their"],
  tbem: ["them"],
  tben: ["then"],
  tbrough: ["through"],
  tbought: ["thought"],
  tbough: ["though"],
  altbough: ["although"],
  togetber: ["together"],
  whetber: ["whether"],
  eitber: ["either"],
  neitber: ["neither"],
  botb: ["both"],
  anotber: ["another"],
  motber: ["mother"],
  fatber: ["father"],
  brotber: ["brother"],
  otber: ["other"],
  anotber: ["another"],
  ratber: ["rather"],
  eitber: ["either"],
  weatber: ["weather"],
  wbether: ["whether"],
  togetber: ["together"],
  gatber: ["gather"],
  furtber: ["further"],
}

// Contextual dictionaries for specific domains
const contextualDictionaries = {
  transportation: {
    highwanz: "highway",
    hiway: "highway",
    hghway: "highway",
    trafic: "traffic",
    traff: "traffic",
    buss: "bus",
    busses: "buses",
    automoble: "automobile",
    automobil: "automobile",
    vehecle: "vehicle",
    vehical: "vehicle",
    passanger: "passenger",
    passangers: "passengers",
    comuter: "commuter",
    comuters: "commuters",
    drver: "driver",
    drivr: "driver",
    stoplight: "traffic light",
    juncton: "junction",
    intrsection: "intersection",
    freeway: "freeway",
    expresway: "expressway",
    turnpike: "turnpike",
    parkway: "parkway",
    byway: "byway",
    roadway: "roadway",
    lane: "lane",
    avenu: "avenue",
    boulavard: "boulevard",
    stret: "street",
    rd: "road",
    st: "street",
    ave: "avenue",
    blvd: "boulevard",
    pkwy: "parkway",
    hwy: "highway",
  },
  business: {
    compny: "company",
    corporaton: "corporation",
    enterprize: "enterprise",
    busness: "business",
    managment: "management",
    employe: "employee",
    employement: "employment",
    finanse: "finance",
    financal: "financial",
    invstment: "investment",
    invester: "investor",
    stockhlder: "stockholder",
    shareholdr: "shareholder",
    proffit: "profit",
    revenew: "revenue",
    expence: "expense",
    expences: "expenses",
    asett: "asset",
    asetts: "assets",
    liabilty: "liability",
    liabilties: "liabilities",
    equty: "equity",
    divdend: "dividend",
    divdends: "dividends",
  },
  medical: {
    patiant: "patient",
    paitent: "patient",
    docter: "doctor",
    physicain: "physician",
    nurce: "nurse",
    hospitl: "hospital",
    medicin: "medicine",
    medicne: "medicine",
    treatmnt: "treatment",
    diagnsis: "diagnosis",
    symptm: "symptom",
    symptms: "symptoms",
    disese: "disease",
    illnes: "illness",
    surgry: "surgery",
    operaton: "operation",
    prescriptn: "prescription",
    medicaton: "medication",
    pharmcy: "pharmacy",
    laboratry: "laboratory",
    bloodtest: "blood test",
    xray: "x-ray",
    mri: "MRI",
    ct: "CT scan",
  },
  legal: {
    attorny: "attorney",
    lawyr: "lawyer",
    judg: "judge",
    cort: "court",
    legsl: "legal",
    contrat: "contract",
    agreemnt: "agreement",
    statut: "statute",
    regulaton: "regulation",
    plaintif: "plaintiff",
    defendnt: "defendant",
    evidnce: "evidence",
    testimny: "testimony",
    witnes: "witness",
    verdct: "verdict",
    sentenc: "sentence",
    liabilty: "liability",
    compensaton: "compensation",
    damags: "damages",
    lawsuit: "lawsuit",
    litigaton: "litigation",
  },
}

/**
 * Detects the likely context/domain of a document based on keyword frequency
 */
function detectDocumentContext(text: string): string {
  const domains = Object.keys(contextualDictionaries)
  const domainScores: Record<string, number> = {}

  // Initialize scores
  domains.forEach((domain) => {
    domainScores[domain] = 0
  })

  // Normalize text for analysis
  const normalizedText = text.toLowerCase()

  // Score each domain based on keyword presence
  domains.forEach((domain) => {
    const dictionary = contextualDictionaries[domain as keyof typeof contextualDictionaries]
    const keywords = Object.values(dictionary)

    keywords.forEach((keyword) => {
      // Use regex to find all occurrences of the keyword
      const regex = new RegExp(`\\b${keyword}\\b`, "gi")
      const matches = normalizedText.match(regex)
      if (matches) {
        domainScores[domain] += matches.length
      }
    })
  })

  // Find domain with highest score
  let highestScore = 0
  let detectedDomain = "general"

  Object.entries(domainScores).forEach(([domain, score]) => {
    if (score > highestScore) {
      highestScore = score
      detectedDomain = domain
    }
  })

  return detectedDomain
}

// Context-aware corrections
const contextualCorrections = [
  {
    pattern: /\b(\w+)lng\b/g,
    replacement: (match, p1) => `${p1}ing`,
    description: "Fix common 'ing' endings misrecognized as 'lng'",
  },
  {
    pattern: /\b(\w+)1ng\b/g,
    replacement: (match, p1) => `${p1}ing`,
    description: "Fix common 'ing' endings misrecognized as '1ng'",
  },
  {
    pattern: /\b(\w+)l(y|ed|es)\b/g,
    check: (match, p1) => {
      // Check if replacing 'l' with 'i' makes a valid word
      const possibleWord = `${p1}i${match.slice(p1.length + 1)}`
      return isValidWord(possibleWord)
    },
    replacement: (match, p1, p2) => `${p1}i${p2}`,
    description: "Fix 'i' misrecognized as 'l' in word endings",
  },
  {
    pattern: /\b(\w+)0(\w+)\b/g,
    check: (match) => {
      // Check if replacing '0' with 'o' makes a valid word
      const possibleWord = match.replace(/0/g, "o")
      return isValidWord(possibleWord)
    },
    replacement: (match) => match.replace(/0/g, "o"),
    description: "Fix 'o' misrecognized as '0'",
  },
]

// Placeholder for a more sophisticated word validation
// In a real implementation, this would use a dictionary or NLP library
function isValidWord(word: string): boolean {
  // This is a simplified placeholder
  // In a real implementation, you would check against a dictionary
  return word.length > 1
}

// Function to apply basic OCR error corrections
export function applyBasicCorrections(text: string): string {
  let correctedText = text

  // Detect document context
  const documentContext = detectDocumentContext(text)

  // Apply dictionary-based corrections
  Object.entries(ocrErrorDictionary).forEach(([correct, errors]) => {
    errors.forEach((error) => {
      const regex = new RegExp(`\\b${error}\\b`, "g")
      correctedText = correctedText.replace(regex, correct)
    })
  })

  // Apply contextual corrections if a specific domain is detected
  if (documentContext !== "general" && contextualDictionaries[documentContext as keyof typeof contextualDictionaries]) {
    const contextDict = contextualDictionaries[documentContext as keyof typeof contextualDictionaries]
    Object.entries(contextDict).forEach(([error, correct]) => {
      const regex = new RegExp(`\\b${error}\\b`, "gi")
      correctedText = correctedText.replace(regex, correct as string)
    })
  }

  // Apply contextual corrections
  contextualCorrections.forEach((correction) => {
    correctedText = correctedText.replace(correction.pattern, (match, ...groups) => {
      if (correction.check && !correction.check(match, ...groups)) {
        return match
      }
      return correction.replacement(match, ...groups)
    })
  })

  return correctedText
}

// Function to improve OCR accuracy with Tesseract.js
export async function enhanceOcrWithTesseract(imageUrl: string): Promise<string> {
  const worker = await createWorker()

  // Configure worker with improved settings
  await worker.loadLanguage("eng")
  await worker.initialize("eng")

  // Set parameters for better recognition
  await worker.setParameters({
    tessedit_char_whitelist:
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,;:'\"-()[]{}!?@#$%^&*_+=<>/\\| ",
    preserve_interword_spaces: "1",
    tessedit_ocr_engine_mode: "3", // Use LSTM neural network mode
    tessjs_create_hocr: "1", // Create HOCR output for layout analysis
    tessjs_create_tsv: "1", // Create TSV output for confidence values
  })

  // Recognize text
  const {
    data: { text, hocr, tsv },
  } = await worker.recognize(imageUrl)

  // Terminate worker
  await worker.terminate()

  // Apply corrections to the recognized text
  const correctedText = applyBasicCorrections(text)

  return correctedText
}

// Function to detect and correct grammar errors
export function correctGrammar(text: string): string {
  // This is a placeholder for grammar correction
  // In a real implementation, you would use a grammar checking library or API

  // Simple grammar fixes
  let correctedText = text

  // Fix common article issues
  correctedText = correctedText.replace(/\ba ([aeiou])/gi, "an $1")

  // Fix common capitalization issues
  correctedText = correctedText.replace(/(?<=\.\s+)([a-z])/g, (match) => match.toUpperCase())

  // Fix common punctuation issues
  correctedText = correctedText.replace(/\s+([.,;:!?])/g, "$1")

  return correctedText
}

// Function to detect and correct spelling errors
export function correctSpelling(text: string): string {
  // Split text into words
  const words = text.split(/\s+/)
  const correctedWords = words.map((word) => {
    // Skip short words, punctuation, numbers, etc.
    if (word.length <= 2 || /^\d+$/.test(word) || /^[^\w]+$/.test(word)) {
      return word
    }

    // Check for common misspellings
    const normalized = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")

    // Look for the word in our dictionaries
    for (const domain in contextualDictionaries) {
      const dictionary = contextualDictionaries[domain as keyof typeof contextualDictionaries]
      if (normalized in dictionary) {
        return dictionary[normalized as keyof typeof dictionary]
      }
    }

    // Apply Levenshtein distance for close matches (simplified version)
    // This is a placeholder for a more sophisticated spell checker

    return word
  })

  return correctedWords.join(" ")
}

// Main correction function that combines all correction methods
export async function correctDocument(text: string, imageUrl?: string): Promise<string> {
  let correctedText = text

  // If image URL is provided, enhance OCR with Tesseract
  if (imageUrl) {
    correctedText = await enhanceOcrWithTesseract(imageUrl)
  } else {
    // Otherwise apply basic corrections
    correctedText = applyBasicCorrections(text)
  }

  // Apply spelling and grammar corrections
  correctedText = correctSpelling(correctedText)
  correctedText = correctGrammar(correctedText)

  return correctedText
}
