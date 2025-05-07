"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { X, Plus, Tag } from "lucide-react"
import { motion } from "framer-motion"

interface DocumentTagsProps {
  documentId: string
  initialTags?: string[]
  onTagsChange?: (tags: string[]) => void
  readOnly?: boolean
}

export function DocumentTags({ documentId, initialTags = [], onTagsChange, readOnly = false }: DocumentTagsProps) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load tags from localStorage on mount
  useEffect(() => {
    try {
      const savedTags = localStorage.getItem(`document-tags-${documentId}`)
      if (savedTags) {
        const parsedTags = JSON.parse(savedTags)
        if (Array.isArray(parsedTags)) {
          setTags(parsedTags)
        }
      } else if (initialTags.length > 0) {
        // If no saved tags but we have initial tags, save them
        localStorage.setItem(`document-tags-${documentId}`, JSON.stringify(initialTags))
      }
    } catch (error) {
      console.error("Error loading tags:", error)
    }
  }, [documentId, initialTags])

  // Save tags to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(`document-tags-${documentId}`, JSON.stringify(tags))
      if (onTagsChange) {
        onTagsChange(tags)
      }
    } catch (error) {
      console.error("Error saving tags:", error)
    }
  }, [tags, documentId, onTagsChange])

  const addTag = () => {
    const trimmedValue = inputValue.trim()

    if (!trimmedValue) return

    // Check if tag already exists
    if (tags.includes(trimmedValue)) {
      toast({
        title: "Tag already exists",
        description: `The tag "${trimmedValue}" already exists for this document.`,
        variant: "destructive",
      })
      return
    }

    // Add the new tag
    setTags([...tags, trimmedValue])
    setInputValue("")

    // Focus the input for adding more tags
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    } else if (e.key === "," || e.key === " ") {
      // Allow adding tags with comma or space
      e.preventDefault()
      addTag()
    }
  }

  if (readOnly) {
    return (
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">No tags</span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Badge variant="secondary" className="px-2 py-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 rounded-full hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove tag {tag}</span>
              </button>
            </Badge>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tags..."
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!inputValue.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">Press Enter or comma to add a tag</p>
    </div>
  )
}
