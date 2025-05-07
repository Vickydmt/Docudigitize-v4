"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// Import the upload form component with SSR disabled
const UploadForm = dynamic(() => import("@/components/upload-form"), {
  ssr: false,
  loading: () => <LoadingFallback />,
})

function LoadingFallback() {
  return (
    <div className="container mx-auto py-10 px-4 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-lg">Loading...</p>
      </div>
    </div>
  )
}

export default function UploadClient() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UploadForm />
    </Suspense>
  )
}
