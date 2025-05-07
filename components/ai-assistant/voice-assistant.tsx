"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"

// Define the SpeechRecognition type for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [showTranscript, setShowTranscript] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const recognitionRef = useRef<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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
        processCommand(interimTranscript)
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

  // Process voice commands
  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase().trim()
    console.log("Processing command:", lowerCommand)
    setIsProcessing(true)

    // Add command to history
    setCommandHistory((prev) => [lowerCommand, ...prev.slice(0, 4)])

    // Navigation commands
    if (lowerCommand.includes("go to document") || lowerCommand.includes("open document")) {
      setResponse("Opening documents page")
      if (!isMuted) speakResponse("Opening documents page")
      router.push("/documents")
    } else if (lowerCommand.includes("go to upload") || lowerCommand.includes("open upload")) {
      setResponse("Opening upload page")
      if (!isMuted) speakResponse("Opening upload page")
      router.push("/upload")
    } else if (lowerCommand.includes("go to dashboard") || lowerCommand.includes("open dashboard")) {
      setResponse("Opening dashboard")
      if (!isMuted) speakResponse("Opening dashboard")
      router.push("/dashboard")
    } else if (lowerCommand.includes("go to setting") || lowerCommand.includes("open setting")) {
      setResponse("Opening settings")
      if (!isMuted) speakResponse("Opening settings")
      router.push("/settings")
    } else if (lowerCommand.includes("go to about") || lowerCommand.includes("open about")) {
      setResponse("Opening about page")
      if (!isMuted) speakResponse("Opening about page")
      router.push("/about")
    } else if (lowerCommand.includes("go to contact") || lowerCommand.includes("open contact")) {
      setResponse("Opening contact page")
      if (!isMuted) speakResponse("Opening contact page")
      router.push("/contact")
    } else if (lowerCommand.includes("go to faq") || lowerCommand.includes("open faq")) {
      setResponse("Opening FAQ page")
      if (!isMuted) speakResponse("Opening FAQ page")
      router.push("/faq")
    } else if (lowerCommand.includes("go to home") || lowerCommand.includes("open home")) {
      setResponse("Going to home page")
      if (!isMuted) speakResponse("Going to home page")
      router.push("/")
    }
    // Action commands
    else if (lowerCommand.includes("upload document") || lowerCommand.includes("upload a document")) {
      setResponse("Taking you to upload page")
      if (!isMuted) speakResponse("Taking you to upload page")
      router.push("/upload")
    } else if (lowerCommand.includes("translate document") || lowerCommand.includes("translate a document")) {
      setResponse("Taking you to documents page")
      if (!isMuted) speakResponse("Taking you to documents page")
      router.push("/documents")
    } else if (lowerCommand.includes("logout") || lowerCommand.includes("sign out")) {
      setResponse("Signing you out")
      if (!isMuted) speakResponse("Signing you out")

      // Perform logout
      localStorage.setItem("isLoggedIn", "false")
      localStorage.removeItem("user")

      // Dispatch custom event for header to update
      window.dispatchEvent(new Event("auth-change"))

      router.push("/login")
    } else if (lowerCommand.includes("help") || lowerCommand.includes("what can you do")) {
      const helpResponse =
        "I can help you navigate the app, upload documents, and more. Try saying 'go to documents' or 'upload document'."
      setResponse(helpResponse)
      if (!isMuted) speakResponse(helpResponse)
    }
    // New commands
    else if (lowerCommand.includes("mute") || lowerCommand.includes("stop speaking")) {
      setIsMuted(true)
      setResponse("Voice responses muted")
      // Don't speak this response since we're muting
    } else if (lowerCommand.includes("unmute") || lowerCommand.includes("start speaking")) {
      setIsMuted(false)
      setResponse("Voice responses unmuted")
      speakResponse("Voice responses unmuted")
    } else if (lowerCommand.includes("dark mode") || lowerCommand.includes("night mode")) {
      document.documentElement.classList.add("dark")
      setResponse("Dark mode activated")
      if (!isMuted) speakResponse("Dark mode activated")
    } else if (lowerCommand.includes("light mode") || lowerCommand.includes("day mode")) {
      document.documentElement.classList.remove("dark")
      setResponse("Light mode activated")
      if (!isMuted) speakResponse("Light mode activated")
    } else if (lowerCommand.includes("download") || lowerCommand.includes("export")) {
      setResponse("Preparing document for download")
      if (!isMuted) speakResponse("Preparing document for download")
      toast({
        title: "Document Export",
        description: "Your document has been prepared for download.",
      })
    } else if (lowerCommand.includes("statistics") || lowerCommand.includes("analytics")) {
      setResponse("Showing document statistics")
      if (!isMuted) speakResponse("Showing document statistics")
      router.push("/documents")
    } else if (lowerCommand.includes("compare") || lowerCommand.includes("comparison")) {
      setResponse("Opening document comparison tool")
      if (!isMuted) speakResponse("Opening document comparison tool")
      router.push("/documents")
    } else if (lowerCommand.includes("enhance") || lowerCommand.includes("improve quality")) {
      setResponse("Enhancing document quality")
      if (!isMuted) speakResponse("Enhancing document quality")
      toast({
        title: "Document Enhancement",
        description: "Document enhancement has been applied.",
      })
    } else if (lowerCommand.includes("batch") || lowerCommand.includes("process multiple")) {
      setResponse("Starting batch processing")
      if (!isMuted) speakResponse("Starting batch processing")
      router.push("/upload")
    } else if (lowerCommand.includes("search") && lowerCommand.includes("document")) {
      const searchTerm = lowerCommand.replace("search", "").replace("document", "").replace("for", "").trim()
      setResponse(`Searching for documents containing "${searchTerm}"`)
      if (!isMuted) speakResponse(`Searching for documents containing ${searchTerm}`)
      router.push("/documents")
    } else if (lowerCommand.includes("create folder") || lowerCommand.includes("new folder")) {
      setResponse("Creating new folder")
      if (!isMuted) speakResponse("Creating new folder")
      toast({
        title: "New Folder",
        description: "New folder has been created.",
      })
    } else if (lowerCommand.includes("delete") || lowerCommand.includes("remove document")) {
      setResponse("Moving document to trash")
      if (!isMuted) speakResponse("Moving document to trash")
      toast({
        title: "Delete Document",
        description: "Document has been moved to trash.",
        variant: "destructive",
      })
    } else {
      setResponse("Sorry, I didn't understand that command. Try saying 'help' for assistance.")
      if (!isMuted) speakResponse("Sorry, I didn't understand that command. Try saying help for assistance.")
    }

    setIsProcessing(false)
  }

  // Speak response using speech synthesis
  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window && !isMuted) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (isMuted) {
      speakResponse("Voice responses unmuted")
    } else {
      setResponse("Voice responses muted")
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

  return (
    <>
      {/* Microphone button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="flex flex-col items-end space-y-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className="h-10 w-10 rounded-full shadow-lg flex items-center justify-center bg-gray-200 dark:bg-gray-800"
            aria-label={isMuted ? "Unmute Voice Assistant" : "Mute Voice Assistant"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Volume2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleListening}
            className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-black text-white dark:bg-white dark:text-black"
            }`}
            aria-label="Voice Assistant"
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </motion.button>
        </div>
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

            {/* Command history */}
            {commandHistory.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-muted-foreground mb-1">Recent commands:</div>
                <div className="space-y-1">
                  {commandHistory.map((cmd, index) => (
                    <div key={index} className="text-xs text-muted-foreground truncate">
                      {cmd}
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {/* Processing indicator */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg"
        >
          Processing command...
        </motion.div>
      )}
    </>
  )
}
