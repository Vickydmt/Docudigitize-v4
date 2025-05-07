/**
 * Layout analyzer using client-side JavaScript
 * This replaces the Python layout-parser implementation with a pure JavaScript solution
 */

import Tesseract from "tesseract.js"

export interface LayoutBlock {
  type: string
  bbox: number[]
  text: string
  confidence?: number
}

export interface LayoutAnalysisResult {
  layout: LayoutBlock[]
  text: string
  structuredContent: Record<string, string[]>
  metadata?: Record<string, any>
  documentType?: string
  classificationConfidence?: number
}

/**
 * Simple layout analysis using Tesseract.js
 * This is a simplified version that doesn't require Python dependencies
 */
export async function analyzeLayout(imageFile: File): Promise<LayoutAnalysisResult> {
  try {
    // Create a URL for the image file
    const imageUrl = URL.createObjectURL(imageFile)

    // Recognize text with Tesseract.js (with hOCR)
    const { data } = await Tesseract.recognize(imageUrl, "eng", {
      logger: (m) => console.log(m),
    })

    // Release the object URL
    URL.revokeObjectURL(imageUrl)

    // Extract layout information from hOCR
    const layout: LayoutBlock[] = []
    const structuredContent: Record<string, string[]> = {
      Text: [],
      Title: [],
      List: [],
      Table: [],
      Figure: [],
    }

    // Process paragraphs as blocks
    data.paragraphs.forEach((paragraph, index) => {
      // Determine block type based on heuristics
      let blockType = "Text"

      // Simple heuristic: first paragraph might be a title
      if (index === 0 && paragraph.text.length < 100) {
        blockType = "Title"
      }
      // Lists often have bullet points or numbers
      else if (paragraph.text.match(/^[\s]*[•\-*\d]+[.)]*\s/)) {
        blockType = "List"
      }
      // Tables often have multiple spaces or tabs
      else if (paragraph.text.includes("\t") || paragraph.text.match(/\s{3,}/)) {
        blockType = "Table"
      }

      // Create layout block
      const block: LayoutBlock = {
        type: blockType,
        bbox: [paragraph.bbox.x0, paragraph.bbox.y0, paragraph.bbox.x1, paragraph.bbox.y1],
        text: paragraph.text,
        confidence: paragraph.confidence,
      }

      layout.push(block)

      // Add to structured content
      if (!structuredContent[blockType]) {
        structuredContent[blockType] = []
      }
      structuredContent[blockType].push(paragraph.text)
    })

    // Sort layout by vertical position (top to bottom)
    layout.sort((a, b) => a.bbox[1] - b.bbox[1])

    return {
      layout,
      text: data.text,
      structuredContent,
    }
  } catch (error) {
    console.error("Layout analysis error:", error)
    return {
      layout: [],
      text: "",
      structuredContent: { Text: [] },
    }
  }
}

/**
 * Create a visualization of the layout
 */
export function visualizeLayout(imageUrl: string, layout: LayoutBlock[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      // Draw the original image
      ctx.drawImage(img, 0, 0)

      // Draw boxes for each layout block
      layout.forEach((block) => {
        const [x, y, right, bottom] = block.bbox
        const width = right - x
        const height = bottom - y

        // Set style based on block type
        let color = "rgba(0, 0, 255, 0.3)" // Default blue for text

        switch (block.type) {
          case "Title":
            color = "rgba(128, 0, 128, 0.3)" // Purple
            break
          case "List":
            color = "rgba(0, 128, 0, 0.3)" // Green
            break
          case "Table":
            color = "rgba(255, 165, 0, 0.3)" // Orange
            break
          case "Figure":
            color = "rgba(255, 0, 0, 0.3)" // Red
            break
        }

        // Draw rectangle
        ctx.fillStyle = color
        ctx.fillRect(x, y, width, height)

        // Draw border
        ctx.strokeStyle = color.replace("0.3", "0.8")
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, width, height)

        // Add label
        ctx.fillStyle = "white"
        ctx.strokeStyle = "black"
        ctx.lineWidth = 3
        ctx.font = "12px Arial"
        ctx.strokeText(block.type, x + 5, y + 15)
        ctx.fillText(block.type, x + 5, y + 15)
      })

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/png")
      resolve(dataUrl)
    }

    img.onerror = () => {
      reject(new Error("Failed to load image for layout visualization"))
    }

    img.src = imageUrl
  })
}
