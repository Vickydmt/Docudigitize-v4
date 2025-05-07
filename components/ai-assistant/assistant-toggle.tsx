"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AIChatAssistant } from "@/components/ai-chat-assistant"
import { VoiceAssistant } from "@/components/ai-assistant/voice-assistant"
import { useToast } from "@/components/ui/use-toast"

export function AssistantToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [assistantType, setAssistantType] = useState<"chat" | "voice">("chat")
  const [isListening, setIsListening] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { toast } = useToast()

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Load preferred assistant from localStorage
    const savedPreference = localStorage.getItem("preferredAssistant") as "chat" | "voice" | null
    if (savedPreference) {
      setAssistantType(savedPreference)
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Handle assistant button click
  const toggleAssistant = () => {
    if (assistantType === "voice") {
      // For voice assistant, toggle listening state
      setIsOpen(!isOpen)
    } else {
      // For chat assistant, toggle open state
      setIsOpen(!isOpen)
      setIsMinimized(false)
    }
  }

  // Handle listening state changes from voice assistant
  const handleListeningChange = (listening: boolean) => {
    setIsListening(listening)
  }

  // Handle minimize for chat assistant
  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // Switch between chat and voice modes
  const switchAssistantType = () => {
    const newType = assistantType === "chat" ? "voice" : "chat"
    setAssistantType(newType)
    localStorage.setItem("preferredAssistant", newType)

    // Close current assistant before switching
    setIsOpen(false)
    setIsListening(false)

    // Show toast notification
    toast({
      title: `Switched to ${newType === "chat" ? "Chat" : "Voice"} Assistant`,
      description: `You can now ${newType === "chat" ? "chat with" : "talk to"} the assistant.`,
    })

    // Reopen after a short delay
    setTimeout(() => {
      setIsOpen(true)
    }, 300)
  }

  return (
    <>
      {/* Main assistant button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={toggleAssistant}
            className={`h-14 w-14 rounded-full shadow-lg ${
              assistantType === "voice" && isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-gradient-to-r from-primary to-primary/80"
            }`}
            size="icon"
            aria-label={assistantType === "chat" ? "Chat Assistant" : "Voice Assistant"}
          >
            {assistantType === "voice" ? <Mic className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          </Button>
        </motion.div>
      </motion.div>

      {/* Switch assistant type button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-24 z-50"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={switchAssistantType}
            className="h-10 w-10 rounded-full shadow-md"
            size="icon"
            variant="outline"
            aria-label={`Switch to ${assistantType === "chat" ? "Voice" : "Chat"} Assistant`}
          >
            {assistantType === "chat" ? <Mic className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          </Button>
        </motion.div>
      </motion.div>

      {/* Chat Assistant */}
      <AnimatePresence>
        {isOpen && assistantType === "chat" && (
          <AIChatAssistant
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onMinimize={handleMinimize}
            isMinimized={isMinimized}
            onSwitchToVoice={switchAssistantType}
          />
        )}
      </AnimatePresence>

      {/* Voice Assistant */}
      <VoiceAssistant isActive={isOpen && assistantType === "voice"} onListeningChange={handleListeningChange} />
    </>
  )
}
