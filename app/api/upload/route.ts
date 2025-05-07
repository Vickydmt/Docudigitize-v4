import { type NextRequest, NextResponse } from "next/server"
import { uploadToAzure } from "@/lib/azure-storage"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "documents"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload to Azure Blob Storage
    const url = await uploadToAzure(file, folder)

    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error("Error uploading to storage:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
