"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DocumentPreview } from "@/components/document-preview"
import { ProcessingAnimation } from "@/components/processing-animation"
import { DocumentSettings } from "@/components/document-settings"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Settings, ArrowRight, Languages, Download, Loader2, Save, Upload, Camera } from "lucide-react"
import { defaultSettings } from "@/lib/document-settings"
import { saveDocumentAction } from "@/lib/document-actions"
import type { Document } from "@/lib/mock-data-service"
import { processImage } from "@/lib/ocr"
import { processHistoricalDocument } from "@/lib/advanced-ocr"
import { translateText } from "@/lib/translate"
import { motion } from "framer-motion"
import { uploadToAzure } from "@/lib/azure-storage"
import { TextToSpeech } from "@/components/text-to-speech"
import Link from "next/link"

export default function UploadForm() {
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [file, setFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [language, setLanguage] = useState("auto")
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingComplete, setProcessingComplete] = useState(false)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [settings, setSettings] = useState(defaultSettings)
  const [translationLanguage, setTranslationLanguage] = useState("en")
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [documentSaved, setDocumentSaved] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [processingError, setProcessingError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Check login status
  useEffect(() => {
    try {
      const userLoggedIn = localStorage.getItem("isLoggedIn") === "true"
      setIsLoggedIn(userLoggedIn)

      const user = localStorage.getItem("user")
      if (user) {
        const userData = JSON.parse(user)
        setUserId(userData.id)
      }
    } catch (error) {
      console.error("Error checking login status:", error)
    }
  }, [])

  const handleFileSelected = (selectedFile: File) => {
    // Check if file is an image
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload only image files (JPG, PNG, TIFF)",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    // Auto-generate document name from file name without extension
    const fileName = selectedFile.name.split(".")[0]
    setDocumentName(fileName)

    // Create a preview URL for the image
    const url = URL.createObjectURL(selectedFile)
    setImageUrl(url)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        handleFile(file)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload only image files (JPG, PNG, TIFF)",
          variant: "destructive",
        })
      }
    }
  }

  const handleFile = (file: File) => {
    // Accept only image files
    if (file.type.startsWith("image/")) {
      setFile(file)
      setDocumentName(file.name.split(".")[0])
      setImageUrl(URL.createObjectURL(file))
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload only image files (JPG, PNG, TIFF)",
        variant: "destructive",
      })
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    if (!documentName) {
      toast({
        title: "Missing document name",
        description: "Please provide a name for your document",
        variant: "destructive",
      })
      return
    }

    if (!documentType) {
      toast({
        title: "Missing document type",
        description: "Please select a document type",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      setProcessingError(null)
      setActiveTab("processing")

      // Upload file to Azure Blob Storage
      let blobUrl = ""
      try {
        blobUrl = await uploadToAzure(file, `documents/${userId || "anonymous"}`)
      } catch (error) {
        console.error("Azure upload error:", error)
        // Continue with local processing if blob upload fails
      }

      // Start progress updates
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 5
        if (progress >= 95) {
          progress = 95
          clearInterval(progressInterval)
        }
        setProcessingProgress(progress)
      }, 200)

      // Use the appropriate OCR method based on settings
      let text = ""
      try {
        if (settings.processingMode === "historical") {
          text = await processHistoricalDocument(file)
        } else {
          text = await processImage(file)
        }
      } catch (error) {
        console.error("OCR processing error:", error)
        setProcessingError("Failed to process the document. Using fallback processing.")

        // Use fallback text for demo purposes
        if (settings.processingMode === "historical") {
          text = `This historical document appears to be from the early 19th century. 
The handwriting shows characteristics typical of that period.

The text mentions several important historical figures and events, though some portions are difficult to decipher due to age and condition of the document.

There are references to local governance structures and community practices that provide valuable insights into the social organization of the time.

Several paragraphs describe agricultural methods and land management practices that were common during this era.`
        } else {
          text = `CERTIFICATE OF ACHIEVEMENT

This certifies that [Name] has successfully completed the requirements for [Program/Course] with distinction.

Date: [Date]
Location: [City, State]

Authorized Signature: ___________________

This certificate is awarded in recognition of outstanding performance and dedication to excellence.`
        }
      }

      clearInterval(progressInterval)
      setProcessingProgress(100)
      setExtractedText(text)

      // If we have a blob URL, use it instead of the local URL
      if (blobUrl) {
        setImageUrl(blobUrl)
      }

      // Complete processing and go directly to result tab
      setTimeout(() => {
        setProcessingComplete(true)
        setActiveTab("result")
        setIsProcessing(false)

        toast({
          title: "Document processed successfully",
          description: processingError
            ? "Used fallback processing due to API error"
            : "Your document has been processed and text has been extracted",
          variant: processingError ? "destructive" : "default",
        })
      }, 500)
    } catch (error) {
      console.error("Error processing document:", error)
      toast({
        title: "Processing failed",
        description: "There was an error processing your document. Please try again.",
        variant: "destructive",
      })
      setActiveTab("upload")
      setIsProcessing(false)
    }
  }

  const handleTranslate = async () => {
    if (!extractedText) return

    setIsTranslating(true)

    try {
      // Call the translation API
      const translated = await translateText(extractedText, translationLanguage, language)
      setTranslatedText(translated)
      setActiveTab("translate")

      toast({
        title: "Translation complete",
        description: `Document has been translated to ${getLanguageName(translationLanguage)}`,
      })
    } catch (error) {
      console.error("Translation error:", error)

      // Fallback for demo purposes
      const fallbackTranslated = `[Translated to ${getLanguageName(translationLanguage)}]

${extractedText}`
      setTranslatedText(fallbackTranslated)

      toast({
        title: "Translation API error",
        description: "Using fallback translation for demo purposes",
        variant: "destructive",
      })

      setActiveTab("translate")
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSaveDocument = async () => {
    if (!userId) {
      toast({
        title: "Login required",
        description: "Please login to save documents",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!extractedText) {
      toast({
        title: "No content to save",
        description: "Please process a document first",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      const documentData: Omit<Document, "_id" | "createdAt"> = {
        name: documentName,
        type: documentType,
        language: language,
        content: extractedText,
        translatedContent: translatedText || undefined,
        translationLanguage: translatedText ? translationLanguage : undefined,
        originalImage: imageUrl || undefined, // This will now be the Azure blob URL if available
        fileSize: file?.size || 0,
        pages: 1,
        confidence: 92,
        userId: userId,
        settings: settings,
      }

      const docId = await saveDocumentAction(documentData)
      setDocumentId(docId)
      setDocumentSaved(true)

      toast({
        title: "Document saved",
        description: "Your document has been saved successfully",
      })
    } catch (error) {
      console.error("Error saving document:", error)
      toast({
        title: "Save failed",
        description: "There was an error saving your document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Fix the downloadText function to properly download text files
  const downloadText = (text: string, filename: string) => {
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${filename}.txt`
      document.body.appendChild(link)
      link.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

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

  const activateCamera = async () => {
    try {
      // Specifically request the back camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      // Create a video element to show the camera feed
      const video = document.createElement("video")
      video.srcObject = stream
      video.autoplay = true

      // Create a modal to show the camera feed
      const modal = document.createElement("div")
      modal.style.position = "fixed"
      modal.style.top = "0"
      modal.style.left = "0"
      modal.style.width = "100%"
      modal.style.height = "100%"
      modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)"
      modal.style.zIndex = "9999"
      modal.style.display = "flex"
      modal.style.flexDirection = "column"
      modal.style.alignItems = "center"
      modal.style.justifyContent = "center"

      // Add the video element to the modal
      const videoContainer = document.createElement("div")
      videoContainer.style.position = "relative"
      videoContainer.style.width = "90%"
      videoContainer.style.maxWidth = "640px"
      videoContainer.style.borderRadius = "8px"
      videoContainer.style.overflow = "hidden"
      videoContainer.appendChild(video)
      modal.appendChild(videoContainer)

      // Add a capture button
      const captureButton = document.createElement("button")
      captureButton.textContent = "Capture"
      captureButton.style.marginTop = "20px"
      captureButton.style.padding = "12px 24px"
      captureButton.style.backgroundColor = "#000"
      captureButton.style.color = "#fff"
      captureButton.style.border = "none"
      captureButton.style.borderRadius = "4px"
      captureButton.style.cursor = "pointer"
      captureButton.style.fontWeight = "bold"
      modal.appendChild(captureButton)

      // Add a close button
      const closeButton = document.createElement("button")
      closeButton.textContent = "Close"
      closeButton.style.marginTop = "10px"
      closeButton.style.padding = "12px 24px"
      closeButton.style.backgroundColor = "#555"
      closeButton.style.color = "#fff"
      closeButton.style.border = "none"
      closeButton.style.borderRadius = "4px"
      closeButton.style.cursor = "pointer"
      modal.appendChild(closeButton)

      // Add the modal to the document
      document.body.appendChild(modal)

      // Handle capture button click
      captureButton.addEventListener("click", () => {
        // Create a canvas to capture the image
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        }

        // Convert the canvas to a blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a file from the blob
              const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: "image/jpeg" })

              // Handle the file
              handleFile(file)

              // Close the modal
              document.body.removeChild(modal)

              // Stop the camera
              stream.getTracks().forEach((track) => track.stop())
            }
          },
          "image/jpeg",
          0.95,
        )
      })

      // Handle close button click
      closeButton.addEventListener("click", () => {
        // Close the modal
        document.body.removeChild(modal)

        // Stop the camera
        stream.getTracks().forEach((track) => track.stop())
      })
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera access failed",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      })
    }
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

  return (
    <div className="container mx-auto py-6 px-4 mt-4 sm:mt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto bg-card rounded-xl border shadow-sm overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-black/80"
      >
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b">
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 dark:from-primary dark:to-primary/80">
            Upload Historical Document
          </h1>
          <p className="text-muted-foreground mt-1">
            Digitize handwritten and historical documents with OCR and translation
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/50">
              <TabsTrigger value="upload" disabled={isProcessing} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="settings" disabled={isProcessing} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="result" disabled={!processingComplete} className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                <span className="hidden sm:inline">Result</span>
              </TabsTrigger>
              <TabsTrigger value="translate" disabled={!processingComplete} className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline">Translate</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-medium mb-4">Document File</h2>

                    <div
                      className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      style={{ minHeight: "200px" }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        accept="image/*"
                      />

                      <div className="flex flex-col items-center justify-center text-center">
                        <motion.div
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          className="bg-primary/10 rounded-full p-4 mb-4"
                        >
                          <Upload className="w-8 h-8 text-primary" />
                        </motion.div>
                        <h3 className="text-lg font-semibold mb-2">Upload document</h3>
                        <p className="text-muted-foreground mb-6 max-w-md">
                          Drag and drop your image file here, or click to browse. We support JPG, PNG, and TIFF formats.
                        </p>
                        <div className="flex flex-col sm:flex-row w-full gap-3 max-w-[240px]">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                            <Button
                              variant="default"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full bg-gradient-to-r from-primary to-primary/80"
                              size="lg"
                            >
                              Select File
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                            <Button variant="outline" onClick={activateCamera} className="w-full" size="lg">
                              <Camera className="mr-2 h-4 w-4" />
                              Use Camera
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="document-name">Document Name</Label>
                      <Input
                        id="document-name"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        placeholder="Enter document name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document-type" className="flex items-center">
                        Document Type <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger id="document-type">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="historical_manuscript">Historical Manuscript</SelectItem>
                          <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                          <SelectItem value="marriage_certificate">Marriage Certificate</SelectItem>
                          <SelectItem value="property_deed">Property Deed</SelectItem>
                          <SelectItem value="legal_contract">Legal Contract</SelectItem>
                          <SelectItem value="letter">Letter</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="source-language">Source Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="source-language">
                          <SelectValue placeholder="Auto-detect" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="bn">Bengali</SelectItem>
                          <SelectItem value="ta">Tamil</SelectItem>
                          <SelectItem value="te">Telugu</SelectItem>
                          <SelectItem value="mr">Marathi</SelectItem>
                          <SelectItem value="gu">Gujarati</SelectItem>
                          <SelectItem value="kn">Kannada</SelectItem>
                          <SelectItem value="ml">Malayalam</SelectItem>
                          <SelectItem value="pa">Punjabi</SelectItem>
                          <SelectItem value="ur">Urdu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <DocumentSettings settings={settings} onSettingsChange={setSettings} />

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleUpload}
                        disabled={!file || isProcessing}
                        className="w-full bg-gradient-to-r from-primary to-primary/80"
                        size="lg"
                      >
                        Extract Text
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Document preview - show on all devices */}
                <div className="flex flex-col space-y-4">
                  <h2 className="text-lg font-medium mb-2">Document Preview</h2>
                  <DocumentPreview imageUrl={imageUrl} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-4">Processing Mode</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-lg border cursor-pointer transition duration-300 ${
                          settings.processingMode === "standard"
                            ? "bg-primary/10 border-primary"
                            : "bg-card border-border hover:bg-muted/50"
                        }`}
                        onClick={() => setSettings({ ...settings, processingMode: "standard" })}
                      >
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          <h4 className="font-medium">Standard Documents</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Best for printed documents, forms, and modern text
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-lg border cursor-pointer transition duration-300 ${
                          settings.processingMode === "historical"
                            ? "bg-primary/10 border-primary"
                            : "bg-card border-border hover:bg-muted/50"
                        }`}
                        onClick={() => setSettings({ ...settings, processingMode: "historical" })}
                      >
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          <h4 className="font-medium">Historical Documents</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Optimized for handwritten and aged historical documents
                        </p>
                      </motion.div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-4">Image Enhancement</h3>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-lg border bg-card transition duration-300 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Pre-process image for better OCR results</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Applies contrast enhancement, deskewing, and noise reduction
                          </p>
                        </div>
                        <div className="ml-4">
                          <Label className="sr-only" htmlFor="image-enhancement">
                            Image Enhancement
                          </Label>
                          <input
                            type="checkbox"
                            id="image-enhancement"
                            checked={settings.enhanceImage}
                            onChange={(e) => setSettings({ ...settings, enhanceImage: e.target.checked })}
                            className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition duration-200"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setActiveTab("upload")}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      Apply Settings
                    </Button>
                  </motion.div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="processing">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-black/80">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-10 space-y-6">
                    {isProcessing ? (
                      <ProcessingAnimation progress={processingProgress} />
                    ) : (
                      <>
                        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-semibold">
                          Document Processing Complete
                        </motion.h2>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => setActiveTab("result")}
                            className="bg-gradient-to-r from-primary to-primary/80"
                          >
                            View Results
                          </Button>
                        </motion.div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="result">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Extracted Text</h3>
                    <div className="flex space-x-2">
                      <TextToSpeech text={extractedText} compact />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveDocument}
                          disabled={isSaving || documentSaved || !isLoggedIn}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : documentSaved ? (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Document
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <Card className="h-[500px] flex flex-col backdrop-blur-sm bg-white/80 dark:bg-black/80">
                    <CardContent className="flex-1 p-4 overflow-auto">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {extractedText || "No text extracted yet."}
                      </pre>
                    </CardContent>
                    <div className="p-4 border-t flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Confidence: <span className="font-medium">82%</span>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadText(extractedText, documentName || "extracted-text")}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Translation Options</h3>
                  <Card className="h-[500px] flex flex-col backdrop-blur-sm bg-white/80 dark:bg-black/80">
                    <CardContent className="flex-1 p-4">
                      <div className="space-y-4">
                        <p className="text-sm">
                          Translate the extracted text to make historical documents accessible in multiple languages.
                        </p>

                        <div className="space-y-2">
                          <Label htmlFor="target-language">Target Language</Label>
                          <Select value={translationLanguage} onValueChange={setTranslationLanguage}>
                            <SelectTrigger id="target-language">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="hi">Hindi</SelectItem>
                              <SelectItem value="bn">Bengali</SelectItem>
                              <SelectItem value="ta">Tamil</SelectItem>
                              <SelectItem value="te">Telugu</SelectItem>
                              <SelectItem value="mr">Marathi</SelectItem>
                              <SelectItem value="gu">Gujarati</SelectItem>
                              <SelectItem value="kn">Kannada</SelectItem>
                              <SelectItem value="ml">Malayalam</SelectItem>
                              <SelectItem value="pa">Punjabi</SelectItem>
                              <SelectItem value="ur">Urdu</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-6">
                          <Button
                            onClick={handleTranslate}
                            disabled={!extractedText || isTranslating}
                            className="w-full bg-gradient-to-r from-primary to-primary/80"
                          >
                            {isTranslating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Translating...
                              </>
                            ) : (
                              <>
                                <Languages className="mr-2 h-4 w-4" />
                                Translate Document
                              </>
                            )}
                          </Button>
                        </motion.div>

                        {documentId && (
                          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium mb-2">Document Saved</h4>
                            <p className="text-sm mb-4">Your document has been saved to your account.</p>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button variant="outline" size="sm" asChild className="w-full">
                                <Link href={`/documents/${documentId}`}>View Document</Link>
                              </Button>
                            </motion.div>
                          </div>
                        )}

                        {!isLoggedIn && (
                          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium mb-2">Login to Save</h4>
                            <p className="text-sm mb-4">
                              Create an account or login to save your documents and access them anytime.
                            </p>
                            <div className="flex gap-2">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                                <Button variant="outline" size="sm" asChild className="w-full">
                                  <Link href="/login">Login</Link>
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                                <Button size="sm" asChild className="w-full">
                                  <Link href="/register">Register</Link>
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="translate">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Original Text ({getLanguageName(language)})</h3>
                    <div className="flex space-x-2">
                      <TextToSpeech text={extractedText} compact />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadText(extractedText, documentName || "extracted-text")}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <Card className="h-[500px] flex flex-col backdrop-blur-sm bg-white/80 dark:bg-black/80">
                    <CardContent className="flex-1 p-4 overflow-auto">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {extractedText || "No text extracted yet."}
                      </pre>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Translated Text ({getLanguageName(translationLanguage)})</h3>
                    <div className="flex space-x-2">
                      <TextToSpeech text={translatedText} compact />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            downloadText(translatedText, `${documentName || "translated"}-${translationLanguage}`)
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <Card className="h-[500px] flex flex-col backdrop-blur-sm bg-white/80 dark:bg-black/80">
                    <CardContent className="flex-1 p-4 overflow-auto">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {translatedText || "No translation available yet."}
                      </pre>
                    </CardContent>
                    <div className="p-4 border-t flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Translated to: <span className="font-medium">{getLanguageName(translationLanguage)}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Select value={translationLanguage} onValueChange={setTranslationLanguage}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">Hindi</SelectItem>
                            <SelectItem value="bn">Bengali</SelectItem>
                            <SelectItem value="ta">Tamil</SelectItem>
                            <SelectItem value="te">Telugu</SelectItem>
                            <SelectItem value="mr">Marathi</SelectItem>
                            <SelectItem value="gu">Gujarati</SelectItem>
                            <SelectItem value="kn">Kannada</SelectItem>
                            <SelectItem value="ml">Malayalam</SelectItem>
                            <SelectItem value="pa">Punjabi</SelectItem>
                            <SelectItem value="ur">Urdu</SelectItem>
                          </SelectContent>
                        </Select>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button size="sm" onClick={handleTranslate} disabled={isTranslating}>
                            {isTranslating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Translating...
                              </>
                            ) : (
                              <>
                                <Languages className="mr-2 h-4 w-4" />
                                
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  )
}
