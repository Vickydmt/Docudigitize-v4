"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCw, FileImage } from "lucide-react"

interface DocumentPreviewProps {
  imageUrl: string | null
  isProcessing?: boolean
}

export function DocumentPreview({ imageUrl, isProcessing = false }: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 10, 50))
  }

  const handleRotate = () => {
    setRotation((rotation + 90) % 360)
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
        <Button variant="outline" size="icon" onClick={handleRotate} className="h-8 w-8">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
      <div
        className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-slate-900 flex items-center justify-center"
        style={{ minHeight: "350px", height: "350px" }}
      >
        {imageUrl ? (
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
              src={imageUrl || "/placeholder.svg?height=300&width=400"}
              alt="Document preview"
              className="max-w-full max-h-full object-contain shadow-md"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            />
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
