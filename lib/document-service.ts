// This file now just re-exports the server actions for client components to use
// No MongoDB imports here to avoid client-side errors

import {
  saveDocumentAction,
  getUserDocumentsAction,
  getDocumentByIdAction,
  updateDocumentAction,
  deleteDocumentAction,
} from "./document-actions"

// Re-export the server actions with the original names for backward compatibility
export const saveDocument = saveDocumentAction
export const getUserDocuments = getUserDocumentsAction
export const getDocumentById = getDocumentByIdAction
export const updateDocument = updateDocumentAction
export const deleteDocument = deleteDocumentAction
