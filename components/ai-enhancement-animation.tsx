"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Wand2, FileText, CheckCircle } from "lucide-react"

interface AIEnhancementAnimationProps {
  isEnhancing: boolean
  onComplete: () => void
}

export function AIEnhancementAnimation({ isEnhancing, onComplete }: AIEnhancementAnimationProps) {
  const [text, setText] = useState("")
  const [enhancedText, setEnhancedText] = useState("")
  const [showAnimation, setShowAnimation] = useState(false)
  const [stage, setStage] = useState(0)
  const [corrections, setCorrections] = useState<{ original: string; corrected: string }[]>([])

  useEffect(() => {
    if (isEnhancing) {
      setShowAnimation(true)
      setText(
        "The quick brown fox jumps over the lazy d0g. Th1s text has s0me OCR err0rs that need to be fixed. The h1storical d0cument was wr1tten in 1845 and c0ntains valuable inf0rmation.",
      )
      setCorrections([
        { original: "d0g", corrected: "dog" },
        { original: "Th1s", corrected: "This" },
        { original: "s0me", corrected: "some" },
        { original: "err0rs", corrected: "errors" },
        { original: "h1storical", corrected: "historical" },
        { original: "d0cument", corrected: "document" },
        { original: "wr1tten", corrected: "written" },
        { original: "c0ntains", corrected: "contains" },
        { original: "inf0rmation", corrected: "information" },
      ])

      // Stage 1: Analyzing
      setStage(1)

      const timer1 = setTimeout(() => {
        // Stage 2: Correcting
        setStage(2)

        let currentText = text
        const correctionTimers: NodeJS.Timeout[] = []

        corrections.forEach((correction, index) => {
          const timer = setTimeout(
            () => {
              currentText = currentText.replace(correction.original, correction.corrected)
              setEnhancedText(currentText)
            },
            300 * (index + 1),
          )

          correctionTimers.push(timer)
        })

        // Stage 3: Finalizing
        const timer2 = setTimeout(
          () => {
            setStage(3)

            // Stage 4: Complete
            setTimeout(() => {
              setShowAnimation(false)
              onComplete()
            }, 1500)
          },
          300 * (corrections.length + 1),
        )

        return () => {
          correctionTimers.forEach((timer) => clearTimeout(timer))
          clearTimeout(timer2)
        }
      }, 2000)

      return () => clearTimeout(timer1)
    }
  }, [isEnhancing, onComplete, text, corrections])

  if (!showAnimation) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        className="bg-card border rounded-lg shadow-lg p-8 max-w-2xl w-full relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Magic particles background */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/30"
              style={{
                width: Math.random() * 10 + 5,
                height: Math.random() * 10 + 5,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
                x: [0, Math.random() * 20 - 10],
                y: [0, Math.random() * 20 - 10],
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center mb-6">
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="mr-2"
          >
            <Wand2 className="h-6 w-6 text-primary" />
          </motion.div>
          <h2 className="text-xl font-bold">AI Text Enhancement</h2>
        </div>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground">Analyzing</span>
            <span className="text-xs text-muted-foreground">Correcting</span>
            <span className="text-xs text-muted-foreground">Finalizing</span>
            <span className="text-xs text-muted-foreground">Complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{
                width: stage === 1 ? "25%" : stage === 2 ? "50%" : stage === 3 ? "75%" : "100%",
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Original OCR Text
            </h3>
            <div className="p-4 border rounded-md bg-muted/50 h-40 overflow-auto">
              <p className="font-mono text-sm">
                {text.split(" ").map((word, index) => {
                  const correction = corrections.find((c) => c.original === word)
                  return (
                    <span key={index} className={correction ? "text-red-500 dark:text-red-400" : ""}>
                      {word}{" "}
                    </span>
                  )
                })}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              Enhanced Text
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
                className="ml-2"
              >
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </motion.div>
            </h3>
            <div className="p-4 border rounded-md bg-muted/50 h-40 overflow-auto">
              <AnimatePresence>
                {enhancedText ? (
                  <motion.p
                    className="font-mono text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {enhancedText.split(" ").map((word, index) => {
                      const correction = corrections.find((c) => c.corrected === word && c.original !== word)
                      return (
                        <span key={index} className={correction ? "text-green-500 dark:text-green-400" : ""}>
                          {word}{" "}
                        </span>
                      )
                    })}
                  </motion.p>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <motion.div
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      {stage === 1 ? "Analyzing text..." : "Enhancing text..."}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {stage === 1
                ? "Analyzing document structure and content..."
                : stage === 2
                  ? "Correcting OCR errors and improving text..."
                  : stage === 3
                    ? "Finalizing enhanced document..."
                    : "Enhancement complete!"}
            </div>
            {stage === 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Magic wand effect */}
        <motion.div
          className="absolute bottom-0 right-0 pointer-events-none"
          animate={{
            y: [0, -10, 0],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Wand2 className="h-20 w-20 text-primary/10" />
        </motion.div>
      </motion.div>
    </div>
  )
}
