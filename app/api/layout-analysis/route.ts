import { type NextRequest, NextResponse } from "next/server"
import { analyzeLayout, visualizeLayout } from "@/lib/layout-analyzer"
import { classifyDocument, extractMetadata } from "@/lib/document-classifier"
import { uploadToStorage } from "@/lib/supabase-storage"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const language = (formData.get("language") as string) || "auto"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Process with layout analyzer
    const result = await analyzeLayout(file)

    // Classify document
    const { documentType, confidence, possibleTypes } = classifyDocument(result.text)
    result.documentType = documentType
    result.classificationConfidence = confidence

    // Extract metadata
    result.metadata = extractMetadata(result.text)

    // Create a temporary URL for the image
    const imageUrl = URL.createObjectURL(file)

    // Generate layout visualization
    let layoutImageUrl = null
    try {
      const visualizationDataUrl = await visualizeLayout(imageUrl, result.layout)

      // Convert data URL to File
      const base64Response = await fetch(visualizationDataUrl)
      const visualizationBlob = await base64Response.blob()
      const layoutImageFile = new File([visualizationBlob], `layout_${Date.now()}.png`, { type: "image/png" })

      // Upload to storage
      layoutImageUrl = await uploadToStorage(layoutImageFile, "processed_layouts")
    } catch (error) {
      console.error("Error creating layout visualization:", error)
    } finally {
      // Clean up the temporary URL
      URL.revokeObjectURL(imageUrl)
    }

    return NextResponse.json({
      success: true,
      layout: result.layout,
      text: result.text,
      structuredContent: result.structuredContent,
      metadata: result.metadata,
      documentType,
      classificationConfidence: confidence,
      possibleTypes,
      layoutImageUrl,
    })
  } catch (error) {
    console.error("Error in layout analysis:", error)
    return NextResponse.json({ error: "Failed to process document layout" }, { status: 500 })
  }
}
