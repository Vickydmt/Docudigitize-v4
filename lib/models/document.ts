import type { ObjectId } from "mongodb"

export interface Document {
  _id?: ObjectId
  name: string
  type: string
  language: string
  content: string
  originalImage: string
  processedImage?: string
  fileSize: number
  pages: number
  confidence: number
  userId: string
  createdAt: Date
  settings: {
    enhanceImage: boolean
    confidenceThreshold: number
    processingMode: "standard" | "historical"
    useAI: boolean
  }
}

export interface DocumentWithId extends Document {
  _id: ObjectId
}
