// Mock data service to replace MongoDB for client-side use

import { v4 as uuidv4 } from "uuid"

// Define document type
export interface Document {
  _id: string
  name: string
  type: string
  language: string
  content: string
  translatedContent?: string
  translationLanguage?: string
  originalImage?: string
  processedImage?: string
  fileSize: number
  pages: number
  confidence: number
  userId: string
  createdAt: string
  settings: {
    enhanceImage: boolean
    confidenceThreshold: number
    processingMode: "standard" | "historical"
  }
}

// Get documents from localStorage or initialize with empty array
function getStoredDocuments(): Document[] {
  if (typeof window === "undefined") {
    return []
  }

  const storedDocs = localStorage.getItem("documents")
  if (storedDocs) {
    return JSON.parse(storedDocs)
  }

  // Initialize with empty array
  localStorage.setItem("documents", JSON.stringify([]))
  return []
}

// Save documents to localStorage
function saveDocuments(documents: Document[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("documents", JSON.stringify(documents))
  }
}

// Log activity when document actions are performed
function logActivity(type: string, description: string, documentId?: string, documentName?: string) {
  if (typeof window === "undefined") {
    return
  }

  const newActivity = {
    id: `act-${Date.now()}`,
    type,
    description,
    date: new Date().toISOString(),
    documentId,
    documentName,
  }

  const storedActivities = localStorage.getItem("userActivities")
  let activities = storedActivities ? JSON.parse(storedActivities) : []
  activities = [newActivity, ...activities]

  localStorage.setItem("userActivities", JSON.stringify(activities))
}

// Mock document service functions
export const mockDataService = {
  // Save a new document
  saveDocument: async (data: Omit<Document, "_id" | "createdAt">): Promise<string> => {
    const documents = getStoredDocuments()
    const newId = uuidv4()

    const newDocument: Document = {
      ...data,
      _id: newId,
      createdAt: new Date().toISOString(),
    }

    documents.push(newDocument)
    saveDocuments(documents)

    // Log activity
    logActivity("upload", `Uploaded new document: ${data.name}`, newId, data.name)

    return newId
  },

  // Get all documents for a user
  getUserDocuments: async (userId: string): Promise<Document[]> => {
    const documents = getStoredDocuments()
    return documents
      .filter((doc) => doc.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  // Get a single document by ID
  getDocumentById: async (id: string): Promise<Document | null> => {
    const documents = getStoredDocuments()
    const document = documents.find((doc) => doc._id === id)
    return document || null
  },

  // Update a document
  updateDocument: async (id: string, data: Partial<Document>): Promise<boolean> => {
    const documents = getStoredDocuments()
    const index = documents.findIndex((doc) => doc._id === id)

    if (index === -1) {
      return false
    }

    const oldDocument = documents[index]
    documents[index] = {
      ...oldDocument,
      ...data,
    }

    saveDocuments(documents)

    // Log activity based on what was updated
    if (data.content && !data.translatedContent) {
      logActivity("process", `Processed document with OCR: ${oldDocument.name}`, id, oldDocument.name)
    } else if (data.translatedContent) {
      logActivity(
        "translate",
        `Translated document to ${data.translationLanguage}: ${oldDocument.name}`,
        id,
        oldDocument.name,
      )
    }

    return true
  },

  // Delete a document
  deleteDocument: async (id: string): Promise<boolean> => {
    const documents = getStoredDocuments()
    const documentToDelete = documents.find((doc) => doc._id === id)
    const filteredDocuments = documents.filter((doc) => doc._id !== id)

    if (filteredDocuments.length === documents.length) {
      return false
    }

    saveDocuments(filteredDocuments)

    // Log activity
    if (documentToDelete) {
      logActivity("delete", `Deleted document: ${documentToDelete.name}`, id, documentToDelete.name)
    }

    return true
  },

  // Download document content
  downloadDocument: async (id: string): Promise<boolean> => {
    const documents = getStoredDocuments()
    const document = documents.find((doc) => doc._id === id)

    if (!document) {
      return false
    }

    // Log activity
    logActivity("download", `Downloaded document text: ${document.name}`, id, document.name)

    return true
  },
}
