import axios from "axios"

const GOOGLE_VISION_API_KEY = "AIzaSyA2xoFUwlBNOK112_DwXJy2Pq5Tqlp_7PA"
const GOOGLE_VISION_ENDPOINT = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`

export async function processImage(file: File): Promise<string> {
  try {
    // Convert file to base64
    const base64Image = await fileToBase64(file)

    const requestData = {
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: "TEXT_DETECTION" }],
        },
      ],
    }

    // Call Google Vision API
    const response = await axios.post(GOOGLE_VISION_ENDPOINT, requestData, {
      headers: { "Content-Type": "application/json" },
    })

    return extractTextFromResponse(response.data)
  } catch (error) {
    console.error("OCR Error:", error)
    throw new Error("Failed to process image")
  }
}

// Convert file to Base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result?.toString().split(",")[1] || "")
    reader.onerror = (error) => reject(error)
  })
}

// Extract text from Google Vision response
function extractTextFromResponse(data: any): string {
  return data.responses?.[0]?.fullTextAnnotation?.text || "No text found"
}
