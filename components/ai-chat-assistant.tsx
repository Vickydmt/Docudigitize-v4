"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, Send, X, Minimize, Maximize, User, FileText, Download, ImageIcon, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIChatAssistantProps {
  isOpen: boolean
  onClose: () => void
  onMinimize: () => void
  isMinimized: boolean
  onSwitchToVoice: () => void
}

// Predefined responses for common questions
const PREDEFINED_RESPONSES: Record<string, string> = {
  hello: "Hello! How can I assist you with document digitization today?",
  hi: "Hi there! How can I help you with your documents?",
  "how are you": "I'm functioning well, thank you! How can I assist you with document digitization?",
  "what can you do":
    "I can help you with information about our OCR technology, document processing, translation features, and guide you through using our platform.",
  ocr: "Our OCR (Optical Character Recognition) technology can extract text from various document types, including handwritten historical documents. We support multiple languages and provide high accuracy results.",
  languages:
    "DocuDigitize supports translation between multiple languages including English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and Urdu.",
  translate:
    "You can translate your extracted document text to multiple languages. After processing your document, go to the 'Translate' tab to select your target language.",
  "document types":
    "We support various document types including historical manuscripts, birth certificates, marriage certificates, property deeds, legal contracts, letters, and general certificates.",
  pricing:
    "DocuDigitize offers a free tier with basic features and premium plans starting at $9.99/month for advanced features like batch processing and priority support.",
  "thank you": "You're welcome! Is there anything else I can help you with?",
  thanks: "You're welcome! Is there anything else I can help you with?",
  "how it works":
    "DocuDigitize works by uploading your document, processing it with our advanced OCR technology, and then providing you with editable, searchable text. You can also translate the extracted text to different languages.",
  help: "I'd be happy to help! You can ask me about OCR technology, document processing, supported languages, or how to use specific features of our platform.",
  "go to upload": "I'll help you navigate to the upload page.",
  "go to documents": "I'll help you navigate to the documents page.",
  "go to dashboard": "I'll help you navigate to the dashboard.",
  login: "I'll help you navigate to the login page.",
  logout: "I'll help you log out of your account.",
  "dark mode": "I'll switch the interface to dark mode for you.",
  "light mode": "I'll switch the interface to light mode for you.",
  "switch to voice": "I'll switch to voice assistant mode for you.",
  // New responses
  "batch processing":
    "Our batch processing feature allows you to upload and process multiple documents at once. This is available in our premium plans.",
  "export formats": "You can export your processed documents in various formats including PDF, DOCX, TXT, and JSON.",
  accuracy:
    "Our OCR technology achieves over 95% accuracy for printed documents and up to 85% for handwritten documents, depending on clarity.",
  "api access":
    "Yes, we provide API access for developers to integrate our OCR capabilities into their applications. Check our documentation for details.",
  "document statistics":
    "Our document statistics feature provides insights about your processed text, including word count, character count, and language distribution.",
  "document comparison":
    "You can compare different versions of the same document to track changes and improvements in the OCR results.",
  "document security":
    "All your documents are encrypted both in transit and at rest. We use industry-standard security protocols to protect your data.",
  "bulk export":
    "You can export multiple documents at once using our bulk export feature available in the Documents page.",
  "ocr accuracy":
    "Our OCR accuracy depends on document quality. For best results, upload clear, high-resolution images with good contrast.",
  "supported file types": "We support various file types including PDF, JPG, PNG, TIFF, and BMP.",
  "historical documents":
    "Yes, our OCR is specially trained to handle historical documents with older typefaces and handwriting styles.",
  "document enhancement":
    "We offer automatic document enhancement features like deskewing, denoising, and contrast adjustment to improve OCR results.",
}

// Action commands that will trigger navigation or UI changes
const ACTION_COMMANDS: Record<string, { action: string; param?: string }> = {
  "go to upload": { action: "navigate", param: "/upload" },
  "go to documents": { action: "navigate", param: "/documents" },
  "go to dashboard": { action: "navigate", param: "/dashboard" },
  "go to login": { action: "navigate", param: "/login" },
  "go to about": { action: "navigate", param: "/about" },
  "go to how it works": { action: "navigate", param: "/how-it-works" },
  "go to settings": { action: "navigate", param: "/settings" },
  "go to faq": { action: "navigate", param: "/faq" },
  "go to contact": { action: "navigate", param: "/contact" },
  "go to privacy": { action: "navigate", param: "/privacy" },
  "go to terms": { action: "navigate", param: "/terms" },
  "login with test user": { action: "loginTest" },
  logout: { action: "logout" },
  "dark mode": { action: "darkMode" },
  "light mode": { action: "lightMode" },
  "switch to voice": { action: "switchToVoice" },
  "export document": { action: "exportDocument" },
  "download document": { action: "downloadDocument" },
  "share document": { action: "shareDocument" },
  "delete document": { action: "deleteDocument" },
  "create new folder": { action: "createFolder" },
  "batch process": { action: "batchProcess" },
  "show statistics": { action: "showStatistics" },
  "compare documents": { action: "compareDocuments" },
  "enhance document": { action: "enhanceDocument" },
  "translate document": { action: "translateDocument" },
}

export function AIChatAssistant({ isOpen, onClose, onMinimize, isMinimized, onSwitchToVoice }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your DocuDigitize assistant. How can I help you with your document digitization today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([
    "How does OCR work?",
    "What languages do you support?",
    "Go to upload page",
    "Switch to voice assistant",
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Generate context-aware suggestions
  useEffect(() => {
    const generateSuggestions = () => {
      const currentPath = window.location.pathname

      // Default suggestions
      let newSuggestions = ["How does OCR work?", "What languages do you support?", "Go to upload page"]

      // Path-specific suggestions
      if (currentPath.includes("/documents")) {
        newSuggestions = [
          "Translate this document",
          "Show document statistics",
          "Download document",
          "Compare documents",
        ]
      } else if (currentPath.includes("/upload")) {
        newSuggestions = ["Upload a document", "Process document", "Select language", "Go to documents"]
      } else if (currentPath === "/") {
        newSuggestions = ["How does OCR work?", "Go to upload page", "Show my documents", "Login with test user"]
      } else if (currentPath.includes("/dashboard")) {
        newSuggestions = ["Recent documents", "Batch process", "Export documents", "Document statistics"]
      }

      // Always add "Switch to voice assistant" as a suggestion
      newSuggestions.push("Switch to voice assistant")

      setSuggestions(newSuggestions)
    }

    generateSuggestions()
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check for action commands first
      const lowerInput = input.toLowerCase().trim()
      let actionTaken = false

      for (const [key, value] of Object.entries(ACTION_COMMANDS)) {
        if (lowerInput.includes(key)) {
          // Handle the action
          if (value.action === "navigate" && value.param) {
            router.push(value.param)
            actionTaken = true
          } else if (value.action === "loginTest") {
            // Simulate login with test user
            localStorage.setItem("isLoggedIn", "true")
            localStorage.setItem(
              "user",
              JSON.stringify({
                id: "test_user_id",
                name: "Test User",
                email: "test@example.com",
              }),
            )
            window.dispatchEvent(new Event("auth-change"))
            router.push("/dashboard")
            actionTaken = true
          } else if (value.action === "logout") {
            localStorage.setItem("isLoggedIn", "false")
            localStorage.removeItem("user")
            window.dispatchEvent(new Event("auth-change"))
            router.push("/")
            actionTaken = true
          } else if (value.action === "darkMode") {
            document.documentElement.classList.add("dark")
            actionTaken = true
          } else if (value.action === "lightMode") {
            document.documentElement.classList.remove("dark")
            actionTaken = true
          } else if (value.action === "switchToVoice") {
            onSwitchToVoice()
            actionTaken = true
            return // Exit early to prevent adding assistant message
          } else if (value.action === "exportDocument" || value.action === "downloadDocument") {
            toast({
              title: "Document Export",
              description: "Your document has been prepared for download.",
              action: (
                <Button size="sm" variant="outline" className="gap-1">
                  <Download className="h-4 w-4" /> Download
                </Button>
              ),
            })
            actionTaken = true
          } else if (value.action === "shareDocument") {
            toast({
              title: "Share Document",
              description: "Document sharing link has been copied to clipboard.",
            })
            actionTaken = true
          } else if (value.action === "deleteDocument") {
            toast({
              title: "Delete Document",
              description: "Document has been moved to trash.",
              variant: "destructive",
            })
            actionTaken = true
          } else if (value.action === "createFolder") {
            toast({
              title: "New Folder",
              description: "New folder has been created.",
            })
            actionTaken = true
          } else if (value.action === "batchProcess") {
            toast({
              title: "Batch Processing",
              description: "Batch processing has been initiated.",
            })
            actionTaken = true
          } else if (value.action === "showStatistics") {
            router.push("/documents")
            actionTaken = true
          } else if (value.action === "compareDocuments") {
            router.push("/documents")
            actionTaken = true
          } else if (value.action === "enhanceDocument") {
            toast({
              title: "Document Enhancement",
              description: "Document enhancement has been applied.",
            })
            actionTaken = true
          } else if (value.action === "translateDocument") {
            router.push("/documents")
            actionTaken = true
          }
          break
        }
      }

      // Generate response using pattern matching
      const response = generateResponse(input)

      // Simulate typing effect
      let typedResponse = ""
      const fullResponse = response
      const typingInterval = setInterval(() => {
        if (typedResponse.length < fullResponse.length) {
          typedResponse = fullResponse.substring(0, typedResponse.length + 1)
          const assistantMessage: Message = {
            role: "assistant",
            content: typedResponse,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev.slice(0, -1), assistantMessage])
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
        }
      }, 20)

      // Initial empty message to start typing effect
      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Update suggestions based on the conversation
      updateSuggestions(input, response)

      // If an action was taken, add a follow-up message
      if (actionTaken) {
        setTimeout(() => {
          const followUpMessage: Message = {
            role: "assistant",
            content: "Is there anything else I can help you with?",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, followUpMessage])
        }, 1000)
      }
    } catch (error) {
      console.error("Chat error:", error)

      // Fallback response
      const assistantMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble processing your request. Please try again later.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const updateSuggestions = (userInput: string, response: string) => {
    // Generate new suggestions based on the conversation context
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes("ocr") || lowerInput.includes("document")) {
      setSuggestions([
        "What document types do you support?",
        "How accurate is the OCR?",
        "Go to upload page",
        "Document enhancement",
      ])
    } else if (lowerInput.includes("translate") || lowerInput.includes("language")) {
      setSuggestions([
        "What languages do you support?",
        "How does translation work?",
        "Can I translate historical documents?",
        "Translate this document",
      ])
    } else if (lowerInput.includes("login") || lowerInput.includes("account")) {
      setSuggestions(["Login with test user", "How do I create an account?", "Go to login page", "Account security"])
    } else if (lowerInput.includes("export") || lowerInput.includes("download")) {
      setSuggestions(["Export formats", "Bulk export", "Download document", "Share document"])
    } else if (lowerInput.includes("statistics") || lowerInput.includes("analytics")) {
      setSuggestions(["Show document statistics", "Word frequency analysis", "Document comparison", "Go to documents"])
    } else {
      // Default suggestions
      setSuggestions([
        "How does OCR work?",
        "What languages do you support?",
        "Go to upload page",
        "Switch to voice assistant",
      ])
    }
  }

  const generateResponse = (userInput: string): string => {
    const lowercaseInput = userInput.toLowerCase()

    // Check for voice assistant switch
    if (lowercaseInput.includes("switch to voice") || lowercaseInput.includes("voice assistant")) {
      setTimeout(() => {
        onSwitchToVoice()
      }, 500)
      return "Switching to voice assistant mode..."
    }

    // Check for exact matches in predefined responses
    for (const [key, response] of Object.entries(PREDEFINED_RESPONSES)) {
      if (lowercaseInput.includes(key)) {
        return response
      }
    }

    // Pattern matching for more complex queries
    if (lowercaseInput.includes("upload") && lowercaseInput.includes("document")) {
      return "To upload a document, go to the Upload page and either drag and drop your file or click to browse. We support JPG, PNG, PDF, and other image formats."
    }

    if (lowercaseInput.includes("process") || lowercaseInput.includes("extract")) {
      return "Our document processing uses advanced OCR technology to extract text from your documents. After uploading, you can enhance the image, select the language, and adjust settings for optimal results."
    }

    if (lowercaseInput.includes("account") || lowercaseInput.includes("register") || lowercaseInput.includes("login")) {
      return "You can create an account by clicking the Register button in the top right corner. If you already have an account, click Login. Your documents will be saved to your account for future access."
    }

    if (lowercaseInput.includes("download") || lowercaseInput.includes("export")) {
      return "After processing your document, you can download the extracted text in various formats including plain text, PDF, DOCX, and JSON. If you've translated the document, you can download the translation as well."
    }

    if (lowercaseInput.includes("batch") || lowercaseInput.includes("multiple")) {
      return "Our batch processing feature allows you to upload and process multiple documents at once. This saves time and is perfect for processing large collections of documents. This feature is available in our premium plans."
    }

    if (lowercaseInput.includes("compare") || lowercaseInput.includes("comparison")) {
      return "Our document comparison tool allows you to compare different versions of the same document or different OCR results. This helps you identify changes and improvements in the text extraction process."
    }

    if (
      lowercaseInput.includes("enhance") ||
      lowercaseInput.includes("improve") ||
      lowercaseInput.includes("quality")
    ) {
      return "We offer automatic document enhancement features like deskewing, denoising, contrast adjustment, and background removal. These tools help improve OCR accuracy by optimizing your document images before processing."
    }

    if (
      lowercaseInput.includes("security") ||
      lowercaseInput.includes("private") ||
      lowercaseInput.includes("secure")
    ) {
      return "We take document security seriously. All your documents are encrypted both in transit and at rest. We use industry-standard security protocols and do not share your data with third parties without your consent."
    }

    if (lowercaseInput.includes("historical") || lowercaseInput.includes("old") || lowercaseInput.includes("ancient")) {
      return "Our OCR technology is specially trained to handle historical documents with older typefaces, faded text, and unique handwriting styles. We've worked with libraries and archives to optimize our system for historical document digitization."
    }

    if (
      lowercaseInput.includes("api") ||
      lowercaseInput.includes("integration") ||
      lowercaseInput.includes("developer")
    ) {
      return "Yes, we provide API access for developers to integrate our OCR capabilities into their applications. Our RESTful API is well-documented and supports all the features available in our web interface. Check our documentation for details."
    }

    // Default response for unrecognized queries
    return "I'm not sure I understand your question. Could you please rephrase? I can help with information about OCR, document processing, translation, account management, and using our platform."
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setTimeout(() => {
      handleSend()
    }, 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)

    // Show typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    const timeout = setTimeout(() => {
      // Could implement smart suggestions based on what user is typing
    }, 500)

    setTypingTimeout(timeout)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card
          className={`w-80 md:w-96 shadow-xl backdrop-blur-sm bg-white/90 dark:bg-black/90 ${isMinimized ? "h-auto" : "h-[500px]"}`}
        >
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardTitle className="text-base font-medium flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              DocuDigitize Assistant
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary-foreground hover:bg-primary/20"
                onClick={onMinimize}
              >
                {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary-foreground hover:bg-primary/20"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              <CardContent className="p-4 h-[380px] overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`rounded-lg px-3 py-2 max-w-[80%] ${
                          message.role === "assistant"
                            ? "bg-muted text-foreground"
                            : "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          {message.role === "assistant" ? (
                            <Bot className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.role === "assistant" ? "Assistant" : "You"} •{" "}
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && !isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="rounded-lg px-3 py-2 bg-muted text-foreground">
                        <div className="flex items-center mb-1">
                          <Bot className="h-3 w-3 mr-1" />
                          <span className="text-xs opacity-70">
                            Assistant • {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="mt-4 mb-2">
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      title="Upload Document"
                      onClick={() => router.push("/upload")}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="View Documents"
                      onClick={() => router.push("/documents")}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Document Statistics"
                      onClick={() => handleSuggestionClick("Show document statistics")}
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Download Document"
                      onClick={() => handleSuggestionClick("Download document")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-muted/50"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-primary to-primary/80"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
