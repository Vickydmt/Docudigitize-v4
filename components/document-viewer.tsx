"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCw, FileImage, AlertTriangle } from "lucide-react"
import { ensureAzureUrlHasSasToken } from "@/lib/azure-storage"

interface DocumentViewerProps {
  imageUrl: string | null
  isProcessing?: boolean
  onRetry?: () => void
}

export function DocumentViewer({ imageUrl: initialImageUrl, isProcessing = false, onRetry }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 10, 50))
  }

  const handleRotate = () => {
    setRotation((rotation + 90) % 360)
  }

  // Reset image error state when imageUrl changes and ensure SAS token
  useEffect(() => {
    if (initialImageUrl) {
      // Ensure the URL has the SAS token if it's an Azure Blob Storage URL
      const urlWithSas = ensureAzureUrlHasSasToken(initialImageUrl)

      // Store the image URL in sessionStorage to persist across page refreshes
      sessionStorage.setItem("lastViewedImage", urlWithSas)

      // Add cache-busting parameter to force a fresh load
      const url = new URL(urlWithSas)
      url.searchParams.set("t", Date.now().toString())
      setImageUrl(url.toString())
    } else {
      // Try to retrieve from sessionStorage if no image URL is provided
      const storedImage = sessionStorage.getItem("lastViewedImage")
      if (storedImage) {
        const urlWithSas = ensureAzureUrlHasSasToken(storedImage)
        const url = new URL(urlWithSas)
        url.searchParams.set("t", Date.now().toString())
        setImageUrl(url.toString())
      }
    }
    setImageError(false)
  }, [initialImageUrl])

  const handleImageError = () => {
    setImageError(true)
    console.error("Failed to load image:", imageUrl)

    // Try to refresh the image URL with a cache-busting parameter and SAS token
    if (imageUrl) {
      setTimeout(() => {
        const urlWithSas = ensureAzureUrlHasSasToken(imageUrl.split("?")[0])
        const url = new URL(urlWithSas)
        url.searchParams.set("t", Date.now().toString())
        setImageUrl(url.toString())
      }, 1000) // Add a delay before retrying
    }
  }

  return (
    <Card className="flex flex-col h-full border overflow-hidden document-preview shadow-sm">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut} className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Slider
            value={[zoom]}
            min={50}
            max={200}
            step={5}
            className="w-28"
            onValueChange={(value) => setZoom(value[0])}
          />
          <Button variant="outline" size="icon" onClick={handleZoomIn} className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handleRotate} className="h-8 w-8">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-slate-900 flex items-center justify-center"
        style={{ minHeight: "350px", height: "350px" }}
      >
        {imageUrl && !imageError ? (
          <div
            className="relative transition-transform duration-200 ease-in-out"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              maxHeight: "100%",
              maxWidth: "100%",
            }}
          >
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Document preview"
              className="max-w-full max-h-full object-contain shadow-md"
              style={{ maxHeight: "calc(100vh - 200px)" }}
              onError={handleImageError}
              crossOrigin="anonymous"
              key={imageUrl} // Add a key to force re-render when URL changes
            />
          </div>
        ) : imageError ? (
          <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full">
            <AlertTriangle className="h-16 w-16 mb-4 text-amber-500" />
            <p className="font-medium mb-2">Failed to load image</p>
            <p className="text-sm max-w-xs mb-4">The document image could not be loaded</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full">
            <FileImage className="h-16 w-16 mb-4 text-muted-foreground/50" />
            <p className="font-medium mb-2">No document uploaded</p>
            <p className="text-sm max-w-xs">Upload a document to see preview</p>
          </div>
        )}
      </div>
    </Card>
  )
}
