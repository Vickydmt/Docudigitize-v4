"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { uploadToStorage } from "@/lib/supabase-storage"

interface FileUploaderProps {
  onUploadComplete: (url: string, file: File) => void
  accept?: string
  maxSize?: number // in MB
  className?: string
}

export function FileUploader({
  onUploadComplete,
  accept = "image/*,.pdf",
  maxSize = 10, // Default 10MB
  className = "",
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size exceeds ${maxSize}MB limit`)
        return
      }

      setError(null)
      setIsUploading(true)
      setUploadProgress(10) // Start progress

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 300)

        // Upload to Supabase Storage
        const url = await uploadToStorage(file)

        clearInterval(progressInterval)
        setUploadProgress(100)
        onUploadComplete(url, file)
      } catch (error) {
        console.error("Upload error:", error)
        setError("Failed to upload file. Please try again.")
      } finally {
        setIsUploading(false)
      }
    },
    [maxSize, onUploadComplete],
  )

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {accept.split(",").join(", ")} (Max {maxSize}MB)
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
