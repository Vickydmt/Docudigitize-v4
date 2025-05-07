export async function translateText(text: string, targetLanguage: string, sourceLanguage = "auto"): Promise<string> {
  try {
    const apiKey = "AIzaSyA2xoFUwlBNOK112_DwXJy2Pq5Tqlp_7PA" // Your API key

    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        source: sourceLanguage !== "auto" ? sourceLanguage : undefined,
        format: "text",
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()

    return data.data.translations[0].translatedText
  } catch (error) {
    console.error("Translation error:", error)
    throw new Error("Failed to translate text")
  }
}

// Function to get language names for display
export function getLanguageName(languageCode: string): string {
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
