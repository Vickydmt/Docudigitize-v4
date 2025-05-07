// lib/pdf-utils.ts

// Utility functions for exporting extracted and translated text

export function downloadAsPDF(
  originalText: string,
  translatedText: string,
  sourceLanguage: string,
  targetLanguage: string,
): void {
  // In a real implementation, you would use a library like jsPDF
  // to generate a PDF with the original and translated text

  // For this example, we'll just download as text with some formatting
  const content = `
ORIGINAL TEXT (${getLanguageName(sourceLanguage)})
------------------------
${originalText}

TRANSLATED TEXT (${getLanguageName(targetLanguage)})
------------------------
${translatedText}
  `

  downloadAsText(content, `translation-${sourceLanguage}-to-${targetLanguage}`)
}

function getLanguageName(languageCode: string): string {
  const languages: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    bn: "Bengali",
    ta: "Tamil",
    te: "Telugu",
    mr: "Marathi",
    gu: "Gujarati",
    kn: "Kannada",
    ml: "Malayalam",
    pa: "Punjabi",
    ur: "Urdu",
    auto: "Auto-detected",
  }

  return languages[languageCode] || languageCode
}

export function downloadAsText(text: string, filename: string): void {
  // Method 1: Using Blob and createObjectURL
  const tryBlobDownload = () => {
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${filename}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      return true
    } catch (error) {
      console.error("Blob download method failed:", error)
      return false
    }
  }

  // Method 2: Using data URI
  const tryDataURIDownload = () => {
    try {
      const dataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = dataUri
      a.download = `${filename}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return true
    } catch (error) {
      console.error("Data URI download method failed:", error)
      return false
    }
  }

  // Method 3: Open in new window
  const tryWindowOpen = () => {
    try {
      const dataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
      const newWindow = window.open(dataUri, "_blank")
      if (!newWindow) {
        alert("Please allow popups for this website to download the file")
        return false
      }
      return true
    } catch (error) {
      console.error("Window open method failed:", error)
      return false
    }
  }

  // Try each method in sequence
  if (!tryBlobDownload() && !tryDataURIDownload() && !tryWindowOpen()) {
    // All methods failed
    console.error("All download methods failed")

    // Last resort: show text in an alert for copy-paste
    const shouldShowText = confirm("Would you like to see the text to copy manually?")
    if (shouldShowText) {
      alert(`${filename}:\n\n${text.substring(0, 1000)}${text.length > 1000 ? "...(text truncated)" : ""}`)
    }
  }
}
