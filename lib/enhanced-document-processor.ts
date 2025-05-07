import axios from "axios"
import { processDocument } from "./document-processor"

// Types for layout analysis
interface LayoutBlock {
  type: string
  bbox: number[]
  text: string
  confidence?: number
}

interface LayoutAnalysisResult {
  layout: LayoutBlock[]
  text: string
  structuredContent: Record<string, string[]>
}

// Process document with enhanced OCR and layout analysis
export async function processDocumentWithLayout(file: File, language = "auto", options: any = {}): Promise<any> {
  try {
    // First, process with our existing OCR
    const basicResult = await processDocument(file, language, options)

    // Then, send to our layout analysis API
    const formData = new FormData()
    formData.append("file", file)
    formData.append("language", language)

    // Call our layout analysis API endpoint
    const layoutResponse = await axios.post("/api/layout-analysis", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    // Combine the results
    return {
      ...basicResult,
      layout: layoutResponse.data.layout || [],
      structuredContent: layoutResponse.data.structuredContent || {},
      enhancedText: layoutResponse.data.text || basicResult.text,
      // Add metadata using our JavaScript-based analysis
      metadata: layoutResponse.data.metadata || {},
      documentType: layoutResponse.data.documentType || "unknown",
      classificationConfidence: layoutResponse.data.classificationConfidence || 0,
    }
  } catch (error) {
    console.error("Enhanced document processing error:", error)
    // Fallback to basic OCR if enhanced processing fails
    return processDocument(file, language, options)
  }
}

// Classify document type using the extracted text
export async function classifyDocumentType(text: string): Promise<{ type: string; confidence: number }> {
  try {
    const response = await axios.post("/api/classify-document", { text })
    return {
      type: response.data.documentType,
      confidence: response.data.confidence,
    }
  } catch (error) {
    console.error("Document classification error:", error)
    return { type: "unknown", confidence: 0 }
  }
}

// Extract key information based on document type
export async function extractKeyInformation(text: string, documentType: string): Promise<Record<string, string>> {
  try {
    const response = await axios.post("/api/extract-information", {
      text,
      documentType,
    })
    return response.data.information
  } catch (error) {
    console.error("Information extraction error:", error)
    return {}
  }
}
