export interface DocumentSettings {
  enhanceImage: boolean
  confidenceThreshold: number
  processingMode: "standard" | "historical"
}

export const defaultSettings: DocumentSettings = {
  enhanceImage: true,
  confidenceThreshold: 70,
  processingMode: "historical",
}
