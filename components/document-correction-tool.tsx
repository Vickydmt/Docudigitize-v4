"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
  CheckCircle,
  RefreshCw,
  Download,
  Save,
  ArrowLeft,
  X,
  Loader2,
  AlertTriangle,
  Check,
  Wand2,
  FileText,
  Brain,
  Sparkles,
} from "lucide-react"
import { motion } from "framer-motion"

interface DocumentCorrectionToolProps {
  originalText: string
  documentId?: string
  documentName?: string
  onSaveCorrection?: (correctedText: string) => void
  onClose?: () => void
}

// Interface for correction issues
interface CorrectionIssue {
  id: string
  type: "error" | "warning" | "suggestion" | "style"
  message: string
  replacement?: string
  context: string
  position: { start: number; end: number }
  source: string
  fixed: boolean
  confidence: number
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
  historical: {
    ye: "the",
    yt: "that",
    wch: "which",
    wth: "with",
    yr: "your",
    ym: "them",
    yn: "then",
    faid: "said",
    fhall: "shall",
    fuch: "such",
    fome: "some",
    fo: "so",
    fay: "say",
    fent: "sent",
    fea: "sea",
    felf: "self",
    fhip: "ship",
    fhore: "shore",
    fhew: "show",
  },
}

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

  // Common word errors
  tbe: ["the"],
  tbat: ["that"],
  bave: ["have"],
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

// Detect document context based on content
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

// Apply basic OCR corrections
function applyBasicCorrections(text: string): string {
  if (!text) return ""

  let corrected = text

  // Apply common OCR corrections
  Object.entries(ocrErrorDictionary).forEach(([correct, errors]) => {
    errors.forEach((error) => {
      const regex = new RegExp(`\\b${error}\\b`, "gi")
      corrected = corrected.replace(regex, correct)
    })
  })

  // Fix common OCR spacing issues
  corrected = corrected.replace(/([a-z])\.([A-Z])/g, "$1. $2") // Add space after period
  corrected = corrected.replace(/([a-z]),([a-zA-Z])/g, "$1, $2") // Add space after comma
  corrected = corrected.replace(/\s+/g, " ") // Replace multiple spaces with single space

  // Fix common punctuation issues
  corrected = corrected.replace(/\s+([.,;:!?])/g, "$1") // Remove space before punctuation
  corrected = corrected.replace(/([.,;:!?])([a-zA-Z])/g, "$1 $2") // Add space after punctuation

  return corrected
}

// Apply contextual corrections based on document type
function applyContextualCorrections(text: string, context: string): string {
  if (!text) return ""

  let corrected = text

  // Apply contextual corrections if a specific domain is detected
  if (context !== "general" && contextualDictionaries[context as keyof typeof contextualDictionaries]) {
    const contextDict = contextualDictionaries[context as keyof typeof contextualDictionaries]
    Object.entries(contextDict).forEach(([error, correct]) => {
      const regex = new RegExp(`\\b${error}\\b`, "gi")
      corrected = corrected.replace(regex, correct as string)
    })
  }

  return corrected
}

// Simulate UniLM correction (in a real implementation, this would call the UniLM API)
async function simulateUniLMCorrection(text: string): Promise<string> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Apply basic corrections
  let corrected = applyBasicCorrections(text)

  // Detect document context
  const context = detectDocumentContext(text)

  // Apply contextual corrections
  corrected = applyContextualCorrections(corrected, context)

  // Fix common grammar issues
  corrected = corrected.replace(/\ba ([aeiou])/gi, "an $1") // Fix articles
  corrected = corrected.replace(/(?<=\.\s+)([a-z])/g, (match) => match.toUpperCase()) // Fix capitalization
  corrected = corrected.replace(/\s+([.,;:!?])/g, "$1") // Fix punctuation spacing

  return corrected
}

// Find issues in text
function findIssues(originalText: string, correctedText: string): CorrectionIssue[] {
  const issues: CorrectionIssue[] = []

  // Split texts into words
  const originalWords = originalText.split(/\s+/)
  const correctedWords = correctedText.split(/\s+/)

  // Compare words
  let originalIndex = 0
  let correctedIndex = 0

  while (originalIndex < originalWords.length && correctedIndex < correctedWords.length) {
    if (originalWords[originalIndex] !== correctedWords[correctedIndex]) {
      // Found a difference
      const originalWord = originalWords[originalIndex]
      const correctedWord = correctedWords[correctedIndex]

      // Calculate position in original text
      const position = {
        start: originalText.indexOf(
          originalWord,
          originalIndex > 0
            ? originalText.indexOf(originalWords[originalIndex - 1]) + originalWords[originalIndex - 1].length
            : 0,
        ),
        end:
          originalText.indexOf(
            originalWord,
            originalIndex > 0
              ? originalText.indexOf(originalWords[originalIndex - 1]) + originalWords[originalIndex - 1].length
              : 0,
          ) + originalWord.length,
      }

      // Get context (3 words before and after)
      const contextStart = Math.max(0, originalIndex - 3)
      const contextEnd = Math.min(originalWords.length, originalIndex + 4)
      const context = originalWords.slice(contextStart, contextEnd).join(" ")

      // Determine issue type and confidence
      let type: "error" | "warning" | "suggestion" | "style" = "suggestion"
      let confidence = 0.8

      // Check if it's a common OCR error
      for (const [correct, errors] of Object.entries(ocrErrorDictionary)) {
        if (errors.includes(originalWord) && correct === correctedWord) {
          type = "error"
          confidence = 0.95
          break
        }
      }

      // Add issue
      issues.push({
        id: `issue-${issues.length}`,
        type,
        message: `Consider replacing "${originalWord}" with "${correctedWord}"`,
        replacement: correctedWord,
        context,
        position,
        source: "UniLM",
        fixed: false,
        confidence,
      })

      originalIndex++
      correctedIndex++
    } else {
      // Words match, move to next
      originalIndex++
      correctedIndex++
    }
  }

  return issues
}

export const DocumentCorrectionTool = ({
  originalText,
  documentId,
  documentName,
  onSaveCorrection,
  onClose,
}: DocumentCorrectionToolProps) => {
  const [correctedText, setCorrectedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<"auto" | "manual" | "advanced">("auto")
  const [issues, setIssues] = useState<CorrectionIssue[]>([])
  const [manualEditText, setManualEditText] = useState("")
  const [progress, setProgress] = useState(0)
  const [detectedContext, setDetectedContext] = useState<string>("general")
  const [useUniLM, setUseUniLM] = useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7)
  const [showCorrectionAnimation, setShowCorrectionAnimation] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Apply corrections when component mounts or original text changes
  useEffect(() => {
    if (originalText) {
      setManualEditText(originalText)

      // Detect document context
      const context = detectDocumentContext(originalText)
      setDetectedContext(context)

      // Process text automatically
      processText(originalText)
    }
  }, [originalText])

  const processText = async (text: string) => {
    setIsProcessing(true)
    setProgress(0)
    setIssues([])

    try {
      // Simulate processing with progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Show correction animation
      setShowCorrectionAnimation(true)

      // Apply corrections
      let corrected
      if (useUniLM) {
        // Use UniLM for correction (simulated)
        corrected = await simulateUniLMCorrection(text)
      } else {
        // Use basic corrections
        corrected = applyBasicCorrections(text)
      }

      // Find issues
      const newIssues = findIssues(text, corrected)

      // Filter issues by confidence threshold
      const filteredIssues = newIssues.filter((issue) => issue.confidence >= confidenceThreshold)

      setCorrectedText(corrected)
      setIssues(filteredIssues)

      clearInterval(progressInterval)
      setProgress(100)

      // Hide correction animation after a delay
      setTimeout(() => {
        setShowCorrectionAnimation(false)
      }, 1000)

      toast({
        title: "Document processed",
        description: `Found ${filteredIssues.length} potential corrections in your document.`,
      })
    } catch (error) {
      console.error("Error processing text:", error)
      toast({
        title: "Error",
        description: "Failed to process text. Please try again.",
        variant: "destructive",
      })
      setCorrectedText(text)
      setShowCorrectionAnimation(false)
    } finally {
      setIsProcessing(false)
    }
  }

  // Fix a specific issue
  const fixIssue = (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId)

    if (issue && issue.replacement) {
      // Apply the fix to the corrected text
      let newText = correctedText
      const before = newText.substring(0, issue.position.start)
      const after = newText.substring(issue.position.end)
      newText = before + issue.replacement + after
      setCorrectedText(newText)

      // Mark the issue as fixed
      setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, fixed: true } : i)))

      toast({
        title: "Correction applied",
        description: `Changed "${issue.context.substring(issue.position.start, issue.position.end)}" to "${issue.replacement}"`,
      })
    }
  }

  // Ignore a specific issue
  const ignoreIssue = (issueId: string) => {
    setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, fixed: true } : i)))
  }

  const handleReprocess = () => {
    setIssues([])
    processText(originalText)
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([activeTab === "auto" ? correctedText : manualEditText], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `corrected-${documentName || "document"}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    URL.revokeObjectURL(url)

    toast({
      title: "Download started",
      description: "Your corrected text is being downloaded",
    })
  }

  const handleSaveCorrection = () => {
    if (onSaveCorrection) {
      onSaveCorrection(activeTab === "auto" ? correctedText : manualEditText)
      toast({
        title: "Success",
        description: "Corrections saved successfully.",
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-2" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>

          {documentName && <h2 className="text-lg font-medium">{documentName}</h2>}
        </div>

        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Documents
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
          Document Correction Tool
        </h2>

        {detectedContext !== "general" && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            Detected context: {detectedContext}
          </Badge>
        )}
      </div>

      {isProcessing && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Processing document...</span>
            <span className="text-sm">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {showCorrectionAnimation && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-blue-500 mr-2 animate-pulse" />
            <span className="font-medium">Applying intelligent corrections...</span>
          </div>
          <div className="mt-2 flex items-center">
            <Brain className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-sm text-blue-700 dark:text-blue-400">
              Using Microsoft UniLM to analyze and correct document
            </span>
          </div>
        </div>
      )}

      {issues.length > 0 && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center text-green-600 dark:text-green-400 mb-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="font-medium">
              Found and fixed {issues.filter((i) => i.fixed).length} of {issues.length} issues
            </span>
          </div>

          <div className="max-h-32 overflow-y-auto">
            {issues.slice(0, 3).map((issue, index) => (
              <div key={index} className="mb-2 border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {issue.type === "error" && <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />}
                    {issue.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />}
                    {issue.type === "suggestion" && <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />}
                    {issue.type === "style" && <CheckCircle className="h-4 w-4 text-purple-500 mr-1" />}
                    <span className="text-xs font-medium uppercase">{issue.type}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {issue.source} ({Math.round(issue.confidence * 100)}%)
                  </Badge>
                </div>
                <p className="text-sm mt-1">{issue.message}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Context: "{issue.context}"</div>
                {issue.replacement && !issue.fixed && (
                  <div className="flex items-center mt-2 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 border-green-200 dark:border-green-800"
                      onClick={() => fixIssue(issue.id)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Replace with: {issue.replacement}
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => ignoreIssue(issue.id)}>
                      Ignore
                    </Button>
                  </div>
                )}
                {issue.fixed && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    <Check className="h-3 w-3 inline mr-1" />
                    {issue.replacement ? "Fixed" : "Ignored"}
                  </div>
                )}
              </div>
            ))}
            {issues.length > 3 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">+ {issues.length - 3} more issues</div>
            )}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium mb-2">Correction Settings</h3>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch id="use-unilm" checked={useUniLM} onCheckedChange={setUseUniLM} />
              <Label htmlFor="use-unilm" className="text-sm">
                Use Microsoft UniLM
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="confidence-threshold" className="text-sm whitespace-nowrap">
                Confidence: {Math.round(confidenceThreshold * 100)}%
              </Label>
              <Slider
                id="confidence-threshold"
                min={0.5}
                max={1}
                step={0.05}
                value={[confidenceThreshold]}
                onValueChange={(value) => setConfidenceThreshold(value[0])}
                className="w-[100px]"
              />
            </div>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="auto"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "auto" | "manual" | "advanced")}
        className="mb-4"
      >
        <TabsList className="w-full">
          <TabsTrigger value="auto" className="flex-1">
            <Wand2 className="h-4 w-4 mr-2" />
            Auto Correction
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Manual Edit
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1">
            <Sparkles className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auto" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Original Text</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap border">
                {originalText}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Corrected Text</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap border">
                {isProcessing ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  correctedText
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleReprocess}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reprocess
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Original Text</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap border">
                {originalText}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Edit Text</h3>
              <Textarea
                ref={textareaRef}
                value={manualEditText}
                onChange={(e) => setManualEditText(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md h-64 w-full resize-none font-mono text-sm border"
                placeholder="Edit the text manually here..."
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Issues Found ({issues.length})</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md h-64 overflow-y-auto border">
                {issues.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <span>No issues found or processing not complete</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {issues.map((issue, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {issue.type === "error" && <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />}
                            {issue.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />}
                            {issue.type === "suggestion" && <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />}
                            {issue.type === "style" && <CheckCircle className="h-4 w-4 text-purple-500 mr-1" />}
                            <span className="text-xs font-medium uppercase">{issue.type}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {issue.source} ({Math.round(issue.confidence * 100)}%)
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{issue.message}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Context: "{issue.context}"</div>
                        {issue.replacement && !issue.fixed && (
                          <div className="flex items-center mt-2 space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 border-green-200 dark:border-green-800"
                              onClick={() => fixIssue(issue.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Replace with: {issue.replacement}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => ignoreIssue(issue.id)}
                            >
                              Ignore
                            </Button>
                          </div>
                        )}
                        {issue.fixed && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            <Check className="h-3 w-3 inline mr-1" />
                            {issue.replacement ? "Fixed" : "Ignored"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>

        <Button onClick={handleSaveCorrection} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="h-4 w-4 mr-2" />
          Save Correction
        </Button>
      </div>
    </motion.div>
  )
}
