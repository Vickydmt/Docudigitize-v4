import { type NextRequest, NextResponse } from "next/server"
import { classifyDocument, extractMetadata } from "@/lib/document-classifier-simple"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid request. Text is required." }, { status: 400 })
    }

    // Classify the document
    const classification = classifyDocument(text)

    // Extract metadata
    const metadata = extractMetadata(text)

    return NextResponse.json({
      classification,
      metadata,
      success: true,
    })
  } catch (error) {
    console.error("Error classifying document:", error)
    return NextResponse.json(
      { error: "Failed to classify document", details: (error as Error).message },
      { status: 500 },
    )
  }
}
