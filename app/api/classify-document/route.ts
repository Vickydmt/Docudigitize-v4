import { type NextRequest, NextResponse } from "next/server"
import { classifyDocument } from "@/lib/document-classifier"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // Classify the document
    const { documentType, confidence, possibleTypes } = classifyDocument(text)

    return NextResponse.json({
      documentType,
      confidence,
      possibleTypes,
    })
  } catch (error) {
    console.error("Error in document classification:", error)
    return NextResponse.json(
      { error: "Failed to classify document", documentType: "unknown", confidence: 0 },
      { status: 500 },
    )
  }
}
