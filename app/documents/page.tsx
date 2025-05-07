"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { getUserDocumentsAction, deleteDocumentAction } from "@/lib/document-actions"
import { FileText, Search, Upload, Loader2, Trash2, Download, Eye } from "lucide-react"
import { motion } from "framer-motion"
import ErrorBoundary from "@/components/error-boundary"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Document {
  _id: string
  name: string
  type: string
  language: string
  createdAt: string
  pages: number
  confidence: number
  content: string
  originalImage?: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Check login status whenever the component mounts
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const userLoggedIn = localStorage.getItem("isLoggedIn") === "true"
        setIsLoggedIn(userLoggedIn)

        // Get user ID from localStorage
        const user = localStorage.getItem("user")
        if (user) {
          const userData = JSON.parse(user)
          setUserId(userData.id)
        }
      } catch (err) {
        console.error("Error checking login status:", err)
        setError("Failed to check login status")
      } finally {
        setIsLoaded(true)
      }
    }

    checkLoginStatus()

    // Listen for auth changes
    window.addEventListener("auth-change", checkLoginStatus)
    return () => {
      window.removeEventListener("auth-change", checkLoginStatus)
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDocuments(documents)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = documents.filter(
        (doc) => doc.name.toLowerCase().includes(query) || doc.type.toLowerCase().includes(query),
      )
      setFilteredDocuments(filtered)
    }
  }, [searchQuery, documents])

  // Add a useEffect to ensure the page loads properly
  useEffect(() => {
    // Force a re-render after component mounts to ensure proper loading
    const timer = setTimeout(() => {
      if (documents.length === 0 && !isLoading && userId) {
        // If documents are empty but we have a userId, try fetching again
        setIsLoading(true)
        getUserDocumentsAction(userId)
          .then((docs) => {
            setDocuments(docs)
            setFilteredDocuments(docs)
          })
          .catch((error) => {
            console.error("Error refreshing documents:", error)
          })
          .finally(() => {
            setIsLoading(false)
          })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [documents.length, isLoading, userId])

  // Add this function to persist document images to localStorage
  const persistDocumentImages = (docs: Document[]) => {
    docs.forEach((doc) => {
      if (doc.originalImage) {
        localStorage.setItem(`doc-image-${doc._id}`, doc.originalImage)
      }
    })
  }

  // Fetch documents when userId is available
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setError(null)
        const docs = await getUserDocumentsAction(userId)

        // Store document images in localStorage for persistence
        persistDocumentImages(docs)

        setDocuments(docs)
        setFilteredDocuments(docs)
      } catch (error) {
        console.error("Error fetching documents:", error)
        setError("Failed to load documents. Please try refreshing the page.")
        toast({
          title: "Failed to load documents",
          description: "There was an error loading your documents",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded && userId) {
      fetchDocuments()
    } else if (isLoaded) {
      setIsLoading(false)
    }
  }, [userId, isLoaded, toast])

  const handleDeleteDocument = async (documentId: string) => {
    setIsDeleting(true)
    try {
      await deleteDocumentAction(documentId)

      // Update the documents list after deletion
      setDocuments(documents.filter((doc) => doc._id !== documentId))
      setFilteredDocuments(filteredDocuments.filter((doc) => doc._id !== documentId))

      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted",
      })
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Delete failed",
        description: "There was an error deleting the document",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDocumentToDelete(null)
    }
  }

  const downloadText = (text: string, filename: string) => {
    try {
      // Create a Blob with the text content
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" })

      // Create a URL for the blob
      const url = URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${filename}.txt`)

      // Append to the document, click it, and remove it
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "Your file is being downloaded",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download failed",
        description: "There was an error downloading the file",
        variant: "destructive",
      })
    }
  }

  const getFilteredDocuments = () => {
    if (activeTab === "all") {
      return filteredDocuments
    } else if (activeTab === "recent") {
      return [...filteredDocuments]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6)
    } else if (activeTab === "historical") {
      return filteredDocuments.filter((doc) => doc.type === "historical")
    } else if (activeTab === "manuscripts") {
      return filteredDocuments.filter((doc) => doc.type === "manuscript")
    }
    return filteredDocuments
  }

  const getLanguageName = (languageCode: string): string => {
    const languages: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      bn: "Bengali",
      ta: "Tamil",
      te: "Telugu",
      mr: "Marathi",
      gu: "Gujarati",
      kn: "Kannada",
      ml: "Malayalam",
      pa: "Punjabi",
      ur: "Urdu",
      auto: "Auto-detected",
    }

    return languages[languageCode] || languageCode
  }

  const getQualityLabel = (confidence: number): string => {
    if (confidence >= 90) return "High (90%+)"
    if (confidence >= 70) return "Medium (70-89%)"
    return "Low (<70%)"
  }

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <motion.div
        className="container mx-auto py-10 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">My Documents</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <p>Please log in to view your documents</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold">My Documents</h1>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search documents..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button asChild className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black">
                  <Link href="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-md p-4 mb-6">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          )}

          <div className="mb-6">
            <div className="flex space-x-1 overflow-x-auto">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setActiveTab("all")}
              >
                All Documents
              </Button>
              <Button
                variant={activeTab === "recent" ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setActiveTab("recent")}
              >
                Recently Added
              </Button>
              <Button
                variant={activeTab === "historical" ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setActiveTab("historical")}
              >
                Historical
              </Button>
              <Button
                variant={activeTab === "manuscripts" ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setActiveTab("manuscripts")}
              >
                Manuscripts
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : getFilteredDocuments().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredDocuments().map((doc) => (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg truncate pr-2">{doc.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => setDocumentToDelete(doc._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <span className="font-medium capitalize">{doc.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Language:</span>
                        <span className="font-medium">{getLanguageName(doc.language)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Pages:</span>
                        <span className="font-medium">{doc.pages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">OCR Quality:</span>
                        <span className="font-medium">{getQualityLabel(doc.confidence)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/documents/${doc._id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadText(doc.content, doc.name)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? "No documents match your search criteria" : "You haven't uploaded any documents yet"}
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild>
                  <Link href="/upload">Upload Your First Document</Link>
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => documentToDelete && handleDeleteDocument(documentToDelete)}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ErrorBoundary>
  )
}
