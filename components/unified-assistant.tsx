"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, Send, X, Minimize, Maximize, User, Mic, MessageSquare } from "lucide-react"

// Define the SpeechRecognition type for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
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
}

// Action commands that will trigger navigation or UI changes
const ACTION_COMMANDS: Record<string, { action: string; param?: string }> = {
  "go to upload": { action: "navigate", param: "/upload" },
  "go to documents": { action: "navigate", param: "/documents" },
  "go to dashboard": { action: "navigate", param: "/dashboard" },
  "go to login": { action: "navigate", param: "/login" },
  "go to about": { action: "navigate", param: "/about" },
  "go to how it works": { action: "navigate", param: "/how-it-works" },
  "login with test user": { action: "loginTest" },
  logout: { action: "logout" },
  "dark mode": { action: "darkMode" },
  "light mode": { action: "lightMode" },
}

export function UnifiedAssistant() {
  const [assistantType, setAssistantType] = useState<"chat" | "voice">("chat")
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
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
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [showTranscript, setShowTranscript] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  // Load preferred assistant from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem("preferredAssistant") as "chat" | "voice" | null
    if (savedPreference) {
      setAssistantType(savedPreference)
    }

    // Listen for assistant type changes from header
    const handleAssistantTypeChange = (event: CustomEvent) => {
      if (event.detail && event.detail.type) {
        setAssistantType(event.detail.type)
      }
    }

    window.addEventListener("assistant-type-change", handleAssistantTypeChange as EventListener)

    return () => {
      window.removeEventListener("assistant-type-change", handleAssistantTypeChange as EventListener)
    }
  }, [])

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    const isSpeechRecognitionSupported = "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    setIsSpeechSupported(isSpeechRecognitionSupported)

    if (!isSpeechRecognitionSupported) {
      console.error("Speech recognition not supported in this browser")
      return
    }

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = "en-US"

    // Set up event handlers
    recognitionRef.current.onstart = () => {
      setIsListening(true)
      setShowTranscript(true)
      setTranscript("Listening...")
    }

    recognitionRef.current.onresult = (event: any) => {
      const interimTranscript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("")

      setTranscript(interimTranscript)

      // Only process command when result is final
      if (event.results[0].isFinal) {
        processVoiceCommand(interimTranscript)
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event.error)
      setIsListening(false)

      if (event.error === "no-speech") {
        setTranscript("No speech detected. Please try again.")
      } else if (event.error === "network") {
        setTranscript("Network error. Please check your connection.")
      } else {
        setTranscript("Error: " + event.error)
      }

      // Hide transcript after a delay
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setShowTranscript(false)
      }, 3000)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)

      // Don't hide transcript immediately to allow user to read the response
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setShowTranscript(false)
      }, 5000)
    }

    return () => {
      // Clean up
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (error) {
          console.error("Error aborting speech recognition:", error)
        }
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

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
          "Go to statistics tab",
          "Download document",
          "Show correction tool",
        ]
      } else if (currentPath.includes("/upload")) {
        newSuggestions = ["Upload a document", "Process document", "Select language", "Go to documents"]
      } else if (currentPath === "/") {
        newSuggestions = ["How does OCR work?", "Go to upload page", "Show my documents", "Login with test user"]
      }

      setSuggestions(newSuggestions)
    }

    generateSuggestions()
  }, [])

  // Toggle assistant visibility
  const toggleAssistant = () => {
    setIsOpen(!isOpen)
    if (assistantType === "voice" && !isOpen) {
      startListening()
    }
  }

  // Toggle assistant type
  const toggleAssistantType = () => {
    const newType = assistantType === "chat" ? "voice" : "chat"
    setAssistantType(newType)
    localStorage.setItem("preferredAssistant", newType)

    // Dispatch event for header to update
    window.dispatchEvent(
      new CustomEvent("assistant-type-change", {
        detail: { type: newType },
      }),
    )

    // If switching to voice and assistant is open, start listening
    if (newType === "voice" && isOpen) {
      startListening()
    }
  }

  // CHAT ASSISTANT FUNCTIONS

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
          }
          break
        }
      }

      // Generate response using pattern matching
      const response = generateChatResponse(input)

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
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
      setSuggestions(["What document types do you support?", "How accurate is the OCR?", "Go to upload page"])
    } else if (lowerInput.includes("translate") || lowerInput.includes("language")) {
      setSuggestions([
        "What languages do you support?",
        "How does translation work?",
        "Can I translate historical documents?",
      ])
    } else if (lowerInput.includes("login") || lowerInput.includes("account")) {
      setSuggestions(["Login with test user", "How do I create an account?", "Go to login page"])
    } else {
      // Default suggestions
      setSuggestions(["How does OCR work?", "What languages do you support?", "Go to upload page"])
    }
  }

  const generateChatResponse = (userInput: string): string => {
    const lowercaseInput = userInput.toLowerCase()

    // Check for exact matches in predefined responses
    for (const [key, response] of Object.entries(PREDEFINED_RESPONSES)) {
      if (lowercaseInput.includes(key)) {
        return response
      }
    }

    // Pattern matching for more complex queries
    if (lowercaseInput.includes("upload") && lowercaseInput.includes("document")) {
      return "To upload a document, go to the Upload page and either drag and drop your file or click to browse. We support JPG, PNG, and other image formats."
    }

    if (lowercaseInput.includes("process") || lowercaseInput.includes("extract")) {
      return "Our document processing uses advanced OCR technology to extract text from your documents. After uploading, you can enhance the image, select the language, and adjust settings for optimal results."
    }

    if (lowercaseInput.includes("account") || lowercaseInput.includes("register") || lowercaseInput.includes("login")) {
      return "You can create an account by clicking the Register button in the top right corner. If you already have an account, click Login. Your documents will be saved to your account for future access."
    }

    if (lowercaseInput.includes("download") || lowercaseInput.includes("export")) {
      return "After processing your document, you can download the extracted text as a plain text file. If you've translated the document, you can download the translation as well."
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

  // VOICE ASSISTANT FUNCTIONS

  // Process voice commands
  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase().trim()
    console.log("Processing command:", lowerCommand)

    // Add the command as a user message in chat history
    const userMessage: Message = {
      role: "user",
      content: command,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Navigation commands
    if (lowerCommand.includes("go to document") || lowerCommand.includes("open document")) {
      setResponse("Opening documents page")
      speakResponse("Opening documents page")
      router.push("/documents")
    } else if (lowerCommand.includes("go to upload") || lowerCommand.includes("open upload")) {
      setResponse("Opening upload page")
      speakResponse("Opening upload page")
      router.push("/upload")
    } else if (lowerCommand.includes("go to dashboard") || lowerCommand.includes("open dashboard")) {
      setResponse("Opening dashboard")
      speakResponse("Opening dashboard")
      router.push("/dashboard")
    } else if (lowerCommand.includes("go to setting") || lowerCommand.includes("open setting")) {
      setResponse("Opening settings")
      speakResponse("Opening settings")
      router.push("/settings")
    } else if (lowerCommand.includes("go to about") || lowerCommand.includes("open about")) {
      setResponse("Opening about page")
      speakResponse("Opening about page")
      router.push("/about")
    } else if (lowerCommand.includes("go to contact") || lowerCommand.includes("open contact")) {
      setResponse("Opening contact page")
      speakResponse("Opening contact page")
      router.push("/contact")
    } else if (lowerCommand.includes("go to faq") || lowerCommand.includes("open faq")) {
      setResponse("Opening FAQ page")
      speakResponse("Opening FAQ page")
      router.push("/faq")
    } else if (lowerCommand.includes("go to home") || lowerCommand.includes("open home")) {
      setResponse("Going to home page")
      speakResponse("Going to home page")
      router.push("/")
    }
    // Action commands
    else if (lowerCommand.includes("upload document") || lowerCommand.includes("upload a document")) {
      setResponse("Taking you to upload page")
      speakResponse("Taking you to upload page")
      router.push("/upload")
    } else if (lowerCommand.includes("translate document") || lowerCommand.includes("translate a document")) {
      setResponse("Taking you to documents page")
      speakResponse("Taking you to documents page")
      router.push("/documents")
    } else if (lowerCommand.includes("logout") || lowerCommand.includes("sign out")) {
      setResponse("Signing you out")
      speakResponse("Signing you out")

      // Perform logout
      localStorage.setItem("isLoggedIn", "false")
      localStorage.removeItem("user")

      // Dispatch custom event for header to update
      window.dispatchEvent(new Event("auth-change"))

      router.push("/login")
    } else if (lowerCommand.includes("switch to chat")) {
      setResponse("Switching to chat assistant")
      speakResponse("Switching to chat assistant")
      setAssistantType("chat")
      localStorage.setItem("preferredAssistant", "chat")

      // Dispatch event for header to update
      window.dispatchEvent(
        new CustomEvent("assistant-type-change", {
          detail: { type: "chat" },
        }),
      )
    } else if (lowerCommand.includes("help") || lowerCommand.includes("what can you do")) {
      const helpResponse =
        "I can help you navigate the app, upload documents, and more. Try saying 'go to documents' or 'upload document'."
      setResponse(helpResponse)
      speakResponse(helpResponse)

      // Add the response to chat history
      const assistantMessage: Message = {
        role: "assistant",
        content: helpResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } else {
      const defaultResponse = "Sorry, I didn't understand that command. Try saying 'help' for assistance."
      setResponse(defaultResponse)
      speakResponse(defaultResponse)

      // Add the response to chat history
      const assistantMessage: Message = {
        role: "assistant",
        content: defaultResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }
  }

  // Speak response using speech synthesis
  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  // Start listening
  const startListening = () => {
    try {
      if (recognitionRef.current && !isListening) {
        recognitionRef.current.start()
      }
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      toast({
        title: "Voice Recognition Error",
        description: "There was a problem starting voice recognition. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.abort()
      } catch (error) {
        console.error("Error stopping speech recognition:", error)
      }
    }
  }

  // RENDER FUNCTIONS

  const renderChatAssistant = () => {
    if (!isOpen || assistantType !== "chat") return null

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
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-primary-foreground hover:bg-primary/20"
                  onClick={() => setIsOpen(false)}
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
                    {isLoading && (
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
                      onChange={(e) => setInput(e.target.value)}
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

  const renderVoiceAssistant = () => {
    if (!isOpen || assistantType !== "voice") return null

    return (
      <>
        {/* Microphone button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startListening}
            className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-black text-white dark:bg-white dark:text-black"
            }`}
            aria-label="Voice Assistant"
          >
            <Mic className="h-6 w-6" />
          </motion.button>
        </motion.div>

        {/* Transcript display */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 right-6 z-50 bg-background/90 backdrop-blur-sm border rounded-lg p-4 shadow-lg max-w-xs"
            >
              <div className="text-sm font-medium mb-1">{isListening ? "Listening..." : "I heard:"}</div>
              <div className="text-base">{transcript}</div>
              {response && <div className="mt-2 pt-2 border-t text-sm text-primary">{response}</div>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unsupported browser message */}
        {!isSpeechSupported && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 right-6 z-50 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg max-w-xs"
          >
            <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Voice Assistant Not Supported</div>
            <div className="text-xs text-red-600 dark:text-red-400">
              Your browser doesn't support voice recognition. Please try using Chrome, Edge, or Safari.
            </div>
          </motion.div>
        )}
      </>
    )
  }

  // Main assistant button
  const renderAssistantButton = () => {
    if (isOpen) return null

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={toggleAssistant}
            className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80"
            size="icon"
            aria-label={assistantType === "chat" ? "Chat Assistant" : "Voice Assistant"}
          >
            {assistantType === "voice" ? <Mic className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <>
      {renderAssistantButton()}
      {renderChatAssistant()}
      {renderVoiceAssistant()}
    </>
  )
}
