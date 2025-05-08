"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Download, Trash2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Document } from "@/lib/mock-data-service"
import { deleteDocumentAction } from "@/lib/document-actions"
import { useToast } from "@/components/ui/use-toast"
import { ensureAzureUrlHasSasToken } from "@/lib/azure-storage"
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

export function DocumentCard({ document, onDelete }: { document: Document; onDelete?: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  useEffect(() => {
    // Process and store document image URL
    if (document.originalImage) {
      // Ensure the URL has the SAS token if it's an Azure Blob Storage URL
      const urlWithSas = ensureAzureUrlHasSasToken(document.originalImage)

      // Add cache-busting parameter
      const url = new URL(urlWithSas)
      url.searchParams.set("t", Date.now().toString())
      const finalUrl = url.toString()

      // Store in localStorage and state
      localStorage.setItem(`doc-image-${document._id}`, finalUrl)
      setThumbnailUrl(finalUrl)
    } else {
      // Try to retrieve from localStorage if not available
      const storedImage = localStorage.getItem(`doc-image-${document._id}`)
      if (storedImage) {
        setThumbnailUrl(storedImage)
      } else {
        setThumbnailUrl("/placeholder.svg?height=200&width=200")
      }
    }
  }, [document._id, document.originalImage])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteDocumentAction(document._id)
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted",
      })
      if (onDelete) onDelete()
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Delete failed",
        description: "There was an error deleting the document",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Improved downloadText function with direct download approach
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

      // Fallback method for browsers that don't support the Blob approach
      try {
        const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
        const newWindow = window.open(dataUrl, "_blank")
        if (!newWindow) {
          alert("Please allow popups for this website to download the file")
        }
      } catch (fallbackError) {
        console.error("Fallback download error:", fallbackError)
        alert("Unable to download file. Please try again or use a different browser.")
      }
    }
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If image fails to load, replace with placeholder
    e.currentTarget.src = "/placeholder.svg?height=200&width=200"

    // Try to reload with Azure SAS token
    if (document.originalImage) {
      setTimeout(() => {
        // Ensure the URL has the SAS token
        const urlWithSas = ensureAzureUrlHasSasToken(document.originalImage.split("?")[0])

        // Add cache-busting parameter
        const url = new URL(urlWithSas)
        url.searchParams.set("t", Date.now().toString())
        const finalUrl = url.toString()

        e.currentTarget.src = finalUrl

        // Update localStorage and state
        localStorage.setItem(`doc-image-${document._id}`, finalUrl)
        setThumbnailUrl(finalUrl)
      }, 500)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{
          scale: 1.03,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          rotateY: 5,
        }}
        style={{ perspective: "1000px" }}
      >
        <Card className="overflow-hidden h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="truncate">{document.name}</CardTitle>
            <CardDescription className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {new Date(document.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <img
              src={thumbnailUrl || "/placeholder.svg?height=200&width=200"}
              alt={document.name}
              className="h-40 w-full object-cover"
              onError={handleImageError}
              crossOrigin="anonymous"
              loading="lazy"
              key={`${document._id}-${Date.now()}`} // Add timestamp to force re-render
            />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{document.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language:</span>
                <span className="font-medium">{getLanguageName(document.language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pages:</span>
                <span className="font-medium">{document.pages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">OCR Quality:</span>
                <span className="font-medium">{getQualityLabel(document.confidence)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="flex w-full gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/documents/${document._id}`}>View Document</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="icon" onClick={() => downloadText(document.content, document.name)}>
                  <Download className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document "{document.name}" and remove it
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function getLanguageName(languageCode: string): string {
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

function getQualityLabel(confidence: number): string {
  if (confidence >= 90) return "High (80%+)"
  if (confidence >= 70) return "Medium (70-89%)"
  return "Low (<70%)"
}
