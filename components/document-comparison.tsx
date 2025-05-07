"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  ArrowLeftRight,
  Download,
  RefreshCw,
  Copy,
  Check,
  Wand2,
  FileText,
  Highlighter,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Document } from "@/lib/mock-data-service"
import { diffChars, diffWords, diffLines, diffSentences } from "diff"
import { correctDocument } from "@/lib/document-correction"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface DocumentComparisonProps {
  documents: Document[]
  onClose?: () => void
}

export function DocumentComparison({ documents, onClose }: DocumentComparisonProps) {
  const [selectedDoc1, setSelectedDoc1] = useState<string>("")
  const [selectedDoc2, setSelectedDoc2] = useState<string>("")
  const [doc1Content, setDoc1Content] = useState<string>("")
  const [doc2Content, setDoc2Content] = useState<string>("")
  const [diffMode, setDiffMode] = useState<"chars" | "words" | "lines" | "sentences">("words")
  const [diffResult, setDiffResult] = useState<any[]>([])
  const [isComparing, setIsComparing] = useState(false)
  const [isCorrecting, setIsCorrecting] = useState(false)
  const [showSideBySide, setShowSideBySide] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [highlightThreshold, setHighlightThreshold] = useState(3)
  const [autoCorrect, setAutoCorrect] = useState(true)
  const [diffStats, setDiffStats] = useState<{
    additions: number
    deletions: number
    unchanged: number
    similarity: number
  }>({
    additions: 0,
    deletions: 0,
    unchanged: 0,
    similarity: 100,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Set default selections if documents are available
    if (documents.length >= 2) {
      setSelectedDoc1(documents[0]._id)
      setSelectedDoc2(documents[1]._id)
    } else if (documents.length === 1) {
      setSelectedDoc1(documents[0]._id)
    }
  }, [documents])

  useEffect(() => {
    // Update content when selections change
    if (selectedDoc1) {
      const doc = documents.find((d) => d._id === selectedDoc1)
      if (doc) setDoc1Content(doc.content)
    }

    if (selectedDoc2) {
      const doc = documents.find((d) => d._id === selectedDoc2)
      if (doc) setDoc2Content(doc.content)
    }
  }, [selectedDoc1, selectedDoc2, documents])

  useEffect(() => {
    // Handle fullscreen mode
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isFullscreen])

  const compareDocuments = async () => {
    if (!doc1Content || !doc2Content) {
      toast({
        title: "Missing content",
        description: "Please select two documents to compare",
        variant: "destructive",
      })
      return
    }

    setIsComparing(true)

    try {
      // Apply auto-correction if enabled
      let content1 = doc1Content
      let content2 = doc2Content

      if (autoCorrect) {
        setIsCorrecting(true)
        content1 = await correctDocument(doc1Content)
        content2 = await correctDocument(doc2Content)
        setIsCorrecting(false)
      }

      let result
      switch (diffMode) {
        case "chars":
          result = diffChars(content1, content2)
          break
        case "words":
          result = diffWords(content1, content2)
          break
        case "lines":
          result = diffLines(content1, content2)
          break
        case "sentences":
          result = diffSentences(content1, content2)
          break
        default:
          result = diffWords(content1, content2)
      }

      setDiffResult(result)

      // Calculate diff statistics
      let additions = 0
      let deletions = 0
      let unchanged = 0

      result.forEach((part) => {
        if (part.added) {
          additions += part.value.length
        } else if (part.removed) {
          deletions += part.value.length
        } else {
          unchanged += part.value.length
        }
      })

      const totalLength = additions + deletions + unchanged
      const similarity = Math.round((unchanged / (totalLength - additions)) * 100)

      setDiffStats({
        additions,
        deletions,
        unchanged,
        similarity: isNaN(similarity) ? 100 : similarity,
      })
    } catch (error) {
      console.error("Comparison error:", error)
      toast({
        title: "Comparison failed",
        description: "There was an error comparing the documents",
        variant: "destructive",
      })
    } finally {
      setIsComparing(false)
    }
  }

  const downloadComparison = () => {
    try {
      // Create a formatted text representation of the diff
      let diffText = "Document Comparison Results\n"
      diffText += "=========================\n\n"

      const doc1 = documents.find((d) => d._id === selectedDoc1)
      const doc2 = documents.find((d) => d._id === selectedDoc2)

      diffText += `Document 1: ${doc1?.name || "Unknown"}\n`
      diffText += `Document 2: ${doc2?.name || "Unknown"}\n\n`
      diffText += `Comparison Mode: ${diffMode}\n\n`
      diffText += `Similarity: ${diffStats.similarity}%\n`
      diffText += `Additions: ${diffStats.additions} characters\n`
      diffText += `Deletions: ${diffStats.deletions} characters\n`
      diffText += `Unchanged: ${diffStats.unchanged} characters\n\n`
      diffText += "Differences:\n"
      diffText += "------------\n\n"

      diffResult.forEach((part) => {
        const prefix = part.added ? "+ " : part.removed ? "- " : "  "
        diffText += prefix + part.value.split("\n").join("\n" + prefix) + "\n"
      })

      // Create and trigger download
      const blob = new Blob([diffText], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `comparison-${doc1?.name || "doc1"}-${doc2?.name || "doc2"}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "Your comparison results are being downloaded",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download failed",
        description: "There was an error downloading the comparison results",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = () => {
    try {
      // Format the diff result for clipboard
      let clipboardText = ""
      diffResult.forEach((part) => {
        const prefix = part.added ? "+ " : part.removed ? "- " : "  "
        clipboardText += prefix + part.value.split("\n").join("\n" + prefix) + "\n"
      })

      navigator.clipboard.writeText(clipboardText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: "Copied to clipboard",
        description: "The comparison results have been copied to your clipboard",
      })
    } catch (error) {
      console.error("Copy error:", error)
      toast({
        title: "Copy failed",
        description: "There was an error copying to clipboard",
        variant: "destructive",
      })
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Function to highlight significant changes
  const highlightSignificantChanges = (text: string, isRemoved: boolean) => {
    if (text.length < highlightThreshold) return text

    return (
      <span
        className={
          isRemoved ? "bg-red-200 dark:bg-red-900/50 font-semibold" : "bg-green-200 dark:bg-green-900/50 font-semibold"
        }
      >
        {text}
      </span>
    )
  }

  return (
    <div ref={containerRef} className={`${isFullscreen ? "fixed inset-0 z-50 p-4 bg-background" : "w-full"}`}>
      <Card className="w-full bg-background shadow-lg border-0">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Document Comparison Tool</CardTitle>
            <div className="flex items-center space-x-2">
              {onClose && !isFullscreen && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document 1</label>
                <Select value={selectedDoc1} onValueChange={setSelectedDoc1}>
                  <SelectTrigger className="bg-white dark:bg-gray-950">
                    <SelectValue placeholder="Select document" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map((doc) => (
                      <SelectItem key={doc._id} value={doc._id}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Document 2</label>
                <Select value={selectedDoc2} onValueChange={setSelectedDoc2}>
                  <SelectTrigger className="bg-white dark:bg-gray-950">
                    <SelectValue placeholder="Select document" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map((doc) => (
                      <SelectItem key={doc._id} value={doc._id}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <Label htmlFor="diff-mode" className="text-sm">
                    Comparison Mode
                  </Label>
                  <Select value={diffMode} onValueChange={(value: any) => setDiffMode(value)}>
                    <SelectTrigger id="diff-mode" className="w-[140px] bg-white dark:bg-gray-950">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chars">Characters</SelectItem>
                      <SelectItem value="words">Words</SelectItem>
                      <SelectItem value="sentences">Sentences</SelectItem>
                      <SelectItem value="lines">Lines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-correct" checked={autoCorrect} onCheckedChange={setAutoCorrect} />
                    <Label htmlFor="auto-correct" className="text-sm">
                      Auto-correct
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Apply intelligent correction before comparison</p>
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={compareDocuments}
                        disabled={isComparing || isCorrecting || !selectedDoc1 || !selectedDoc2}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                      >
                        {isComparing || isCorrecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {isCorrecting ? "Correcting..." : "Comparing..."}
                          </>
                        ) : (
                          <>
                            <ArrowLeftRight className="h-4 w-4 mr-2" />
                            Compare Documents
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Compare the selected documents using the chosen mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {diffResult.length > 0 && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                    <div>
                      <h3 className="text-lg font-medium">Comparison Results</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        >
                          {diffStats.similarity}% Similar
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        >
                          +{diffStats.additions} Added
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        >
                          -{diffStats.deletions} Removed
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={copyToClipboard}>
                              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                              {copied ? "Copied" : "Copy"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy comparison results to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={downloadComparison}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download comparison results as text file</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="highlight-threshold" className="text-sm">
                        Highlight Threshold: {highlightThreshold} characters
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Highlighter className="h-4 w-4 text-muted-foreground" />
                        <Slider
                          id="highlight-threshold"
                          min={1}
                          max={20}
                          step={1}
                          value={[highlightThreshold]}
                          onValueChange={(value) => setHighlightThreshold(value[0])}
                          className="w-[100px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4 bg-white dark:bg-gray-950 overflow-auto max-h-[400px] shadow-inner">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {diffResult.map((part, index) => (
                        <span
                          key={index}
                          className={
                            part.added
                              ? "text-green-800 dark:text-green-400"
                              : part.removed
                                ? "text-red-800 dark:text-red-400"
                                : ""
                          }
                        >
                          {part.added || part.removed
                            ? highlightSignificantChanges(part.value, part.removed)
                            : part.value}
                        </span>
                      ))}
                    </pre>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            <Tabs defaultValue="original">
              <TabsList className="w-full">
                <TabsTrigger value="original" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Original Documents
                </TabsTrigger>
                <TabsTrigger value="side-by-side" className="flex-1">
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Side by Side
                </TabsTrigger>
                <TabsTrigger value="corrected" className="flex-1">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Auto-Corrected
                </TabsTrigger>
              </TabsList>

              <TabsContent value="original" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Document 1</h3>
                    <Textarea
                      value={doc1Content}
                      readOnly
                      className="min-h-[300px] font-mono text-sm bg-white dark:bg-gray-950 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Document 2</h3>
                    <Textarea
                      value={doc2Content}
                      readOnly
                      className="min-h-[300px] font-mono text-sm bg-white dark:bg-gray-950 resize-none"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="side-by-side" className="pt-4">
                <div className="overflow-auto border rounded-md">
                  <table className="w-full border-collapse">
                    <thead className="bg-muted">
                      <tr>
                        <th className="border p-2 text-left font-medium">Document 1</th>
                        <th className="border p-2 text-left font-medium">Document 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc1Content.split("\n").map((line, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50 dark:bg-gray-900"}
                        >
                          <td className="border p-2 font-mono text-sm whitespace-pre-wrap">{line}</td>
                          <td className="border p-2 font-mono text-sm whitespace-pre-wrap">
                            {doc2Content.split("\n")[i] || ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="corrected" className="space-y-4 pt-4">
                <div className="flex justify-center mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setIsCorrecting(true)
                      try {
                        const corrected1 = await correctDocument(doc1Content)
                        const corrected2 = await correctDocument(doc2Content)
                        setDoc1Content(corrected1)
                        setDoc2Content(corrected2)
                        toast({
                          title: "Auto-correction applied",
                          description: "Documents have been corrected using AI-powered analysis",
                        })
                      } catch (error) {
                        console.error("Correction error:", error)
                        toast({
                          title: "Correction failed",
                          description: "There was an error applying auto-correction",
                          variant: "destructive",
                        })
                      } finally {
                        setIsCorrecting(false)
                      }
                    }}
                    disabled={isCorrecting}
                  >
                    {isCorrecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Correcting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Apply Auto-Correction
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Document 1 (Corrected)</h3>
                    <Textarea
                      value={doc1Content}
                      onChange={(e) => setDoc1Content(e.target.value)}
                      className="min-h-[300px] font-mono text-sm bg-white dark:bg-gray-950"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Document 2 (Corrected)</h3>
                    <Textarea
                      value={doc2Content}
                      onChange={(e) => setDoc2Content(e.target.value)}
                      className="min-h-[300px] font-mono text-sm bg-white dark:bg-gray-950"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
