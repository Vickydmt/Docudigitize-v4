"use client"

import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ProcessingAnimationProps {
  progress: number
}

export function ProcessingAnimation({ progress }: ProcessingAnimationProps) {
  const progressText =
    progress < 30
      ? "Analyzing document structure..."
      : progress < 60
        ? "Extracting text with OCR..."
        : progress < 90
          ? "Processing results..."
          : "Finalizing document..."

  return (
    <div className="w-full flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <Progress value={progress} className="w-full h-2 mb-2" />
      <p className="text-base font-medium">{progressText}</p>
      <p className="text-sm text-muted-foreground mt-1">{progress.toFixed(0)}% complete</p>
    </div>
  )
}
