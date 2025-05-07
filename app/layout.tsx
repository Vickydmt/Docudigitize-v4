import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { UnifiedAssistant } from "@/components/unified-assistant"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "DocuDigitize - OCR Document Processing",
  description: "Advanced OCR document processing and digitization platform",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <UnifiedAssistant />
        </ThemeProvider>
      </body>
    </html>
  )
}
