"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, Pause, Play } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TextToSpeechProps {
  text: string
  compact?: boolean
  language?: string
}

export function TextToSpeech({ text, compact = false, language = "en" }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [rate, setRate] = useState(1)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Get available voices
      const getVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        setVoices(availableVoices)

        // Try to find a voice for the specified language
        const langVoice = availableVoices.find((voice) => voice.lang.startsWith(language))
        if (langVoice) {
          setSelectedVoice(langVoice)
        } else if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0])
        }
      }

      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = getVoices
      }

      getVoices()

      // Clean up
      return () => {
        stopSpeaking()
      }
    } else {
      setIsSupported(false)
    }
  }, [language])

  const speak = () => {
    if (!text || !isSupported) return

    // Cancel any ongoing speech
    stopSpeaking()

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    // Set voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    // Set language
    utterance.lang = language

    // Set rate
    utterance.rate = rate

    // Set up event handlers
    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    utterance.onerror = (event) => {
      console.error("Speech synthesis error", event)
      setIsSpeaking(false)
      setIsPaused(false)
    }

    // Speak the text
    window.speechSynthesis.speak(utterance)
  }

  const pauseSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const resumeSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
    }
  }

  const handleRateChange = (value: number[]) => {
    setRate(value[0])

    // Update rate of current utterance if speaking
    if (isSpeaking && utteranceRef.current) {
      stopSpeaking()
      speak()
    }
  }

  if (!isSupported) {
    return null
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={isSpeaking ? stopSpeaking : speak}>
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isSpeaking ? "Stop" : "Listen"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {isSpeaking ? (
          <>
            <Button variant="outline" size="sm" onClick={isPaused ? resumeSpeaking : pauseSpeaking}>
              {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button variant="outline" size="sm" onClick={stopSpeaking}>
              <VolumeX className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={speak}>
            <Volume2 className="h-4 w-4 mr-2" />
            Listen
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm">Speed:</span>
        <Slider value={[rate]} min={0.5} max={2} step={0.1} onValueChange={handleRateChange} className="w-32" />
        <span className="text-sm">{rate.toFixed(1)}x</span>
      </div>
    </div>
  )
}
