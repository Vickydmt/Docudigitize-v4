"use client"

import { mockDataService, type Document } from "./mock-data-service"

// Save a new document
export async function saveDocumentAction(data: Omit<Document, "_id" | "createdAt">): Promise<string> {
  try {
    return await mockDataService.saveDocument(data)
  } catch (error) {
    console.error("Error saving document:", error)
    throw new Error("Failed to save document")
  }
}

// Get all documents for a user
export async function getUserDocumentsAction(userId: string): Promise<Document[]> {
  try {
    return await mockDataService.getUserDocuments(userId)
  } catch (error) {
    console.error("Error getting documents:", error)
    throw new Error("Failed to get documents")
  }
}

// Get a single document by ID
export async function getDocumentByIdAction(id: string): Promise<Document | null> {
  try {
    return await mockDataService.getDocumentById(id)
  } catch (error) {
    console.error("Error getting document:", error)
    throw new Error("Failed to get document")
  }
}

// Update a document
export async function updateDocumentAction(id: string, data: Partial<Document>): Promise<boolean> {
  try {
    return await mockDataService.updateDocument(id, data)
  } catch (error) {
    console.error("Error updating document:", error)
    throw new Error("Failed to update document")
  }
}

// Delete a document
export async function deleteDocumentAction(id: string): Promise<boolean> {
  try {
    return await mockDataService.deleteDocument(id)
  } catch (error) {
    console.error("Error deleting document:", error)
    throw new Error("Failed to delete document")
  }
}

// Get all documents (for comparison purposes)
export async function getAllDocumentsAction(): Promise<Document[]> {
  try {
    // In a real application, you might fetch all documents from a database.
    // For this mock implementation, we'll return all documents for all users.
    const allDocuments: Document[] = []
    const localStorageKeys = Object.keys(localStorage)

    localStorageKeys.forEach((key) => {
      if (key === "documents") {
        const storedDocs = localStorage.getItem(key)
        if (storedDocs) {
          const parsedDocs = JSON.parse(storedDocs)
          if (Array.isArray(parsedDocs)) {
            allDocuments.push(...parsedDocs)
          }
        }
      }
    })

    return allDocuments
  } catch (error) {
    console.error("Error getting all documents:", error)
    throw new Error("Failed to get all documents")
  }
}
