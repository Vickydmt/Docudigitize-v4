"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface LayoutBlock {
  type: string
  bbox: number[]
  text: string
}

interface LayoutAnalysisProps {
  imageUrl: string | null
  layoutData: LayoutBlock[]
  isLoading?: boolean
}

const colorMap: Record<string, string> = {
  Text: "bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
  Title:
    "bg-purple-100 border-purple-400 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
  List: "bg-green-100 border-green-400 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300",
  Table: "bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300",
  Figure: "bg-rose-100 border-rose-400 text-rose-800 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-300",
}

export function LayoutAnalysisViewer({ imageUrl, layoutData, isLoading = false }: LayoutAnalysisProps) {
  const [selectedBlock, setSelectedBlock] = useState<LayoutBlock | null>(null)

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Document Layout Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Analyzing document layout...</p>
        </CardContent>
      </Card>
    )
  }

  if (!imageUrl || !layoutData || layoutData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Document Layout Analysis</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground">No layout data available. Upload a document to analyze its structure.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Document Layout Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visual" className="w-full">
          <TabsList>
            <TabsTrigger value="visual">Visual Layout</TabsTrigger>
            <TabsTrigger value="structured">Structured Content</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="mt-4">
            <div className="relative border rounded-md overflow-hidden bg-white dark:bg-slate-900">
              <img src={imageUrl || "/placeholder.svg"} alt="Document" className="max-w-full h-auto" />

              {layoutData.map((block, index) => {
                const [x, y, right, bottom] = block.bbox
                const width = right - x
                const height = bottom - y

                const colorClass =
                  colorMap[block.type] ||
                  "bg-gray-100 border-gray-400 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"

                return (
                  <div
                    key={index}
                    className={`absolute border-2 ${selectedBlock === block ? "border-4" : ""} ${colorClass} bg-opacity-20 hover:bg-opacity-40 transition-all cursor-pointer`}
                    style={{
                      left: `${(x / 1000) * 100}%`,
                      top: `${(y / 1000) * 100}%`,
                      width: `${(width / 1000) * 100}%`,
                      height: `${(height / 1000) * 100}%`,
                    }}
                    onClick={() => setSelectedBlock(block === selectedBlock ? null : block)}
                  >
                    <Badge className={`absolute top-0 left-0 ${colorClass} border-0`}>{block.type}</Badge>
                  </div>
                )
              })}
            </div>

            {selectedBlock && (
              <div className="mt-4 p-4 border rounded-md">
                <h3 className="font-medium mb-2">Selected {selectedBlock.type}</h3>
                <p className="whitespace-pre-wrap">{selectedBlock.text}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="structured" className="mt-4">
            <div className="space-y-6">
              {Object.entries(
                layoutData.reduce(
                  (acc, block) => {
                    if (!acc[block.type]) acc[block.type] = []
                    acc[block.type].push(block)
                    return acc
                  },
                  {} as Record<string, LayoutBlock[]>,
                ),
              ).map(([type, blocks]) => (
                <div key={type} className="space-y-2">
                  <h3 className="font-medium">
                    {type} ({blocks.length})
                  </h3>
                  <div className="space-y-2">
                    {blocks.map((block, idx) => (
                      <div key={idx} className="p-3 border rounded-md">
                        <p className="whitespace-pre-wrap">{block.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
