import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, Search, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Historical Document Digitization Platform</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform handwritten historical documents into accessible digital text with OCR and multilingual support
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="flex flex-col items-center text-center p-6 transition-all duration-300 hover:shadow-lg">
          <Upload className="h-12 w-12 mb-4 text-primary" />
          <h2 className="text-2xl font-semibold mb-2">Upload Documents</h2>
          <p className="text-muted-foreground mb-4">
            Upload scanned historical documents in various image formats including JPG and PNG.
          </p>
          <div className="mt-auto">
            <Button asChild>
              <Link href="/upload">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col items-center text-center p-6 transition-all duration-300 hover:shadow-lg">
          <Search className="h-12 w-12 mb-4 text-primary" />
          <h2 className="text-2xl font-semibold mb-2">Search & Access</h2>
          <p className="text-muted-foreground mb-4">
            Search through digitized documents and access historical records with ease.
          </p>
          <div className="mt-auto">
            <Button variant="outline" asChild>
              <Link href="/documents">
                Browse Documents <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col items-center text-center p-6 transition-all duration-300 hover:shadow-lg">
          <FileText className="h-12 w-12 mb-4 text-primary" />
          <h2 className="text-2xl font-semibold mb-2">OCR Processing</h2>
          <p className="text-muted-foreground mb-4">
            About our advanced OCR technology to recognize handwritten text in multiple regional languages.
          </p>
          <div className="mt-auto">
            <Button variant="outline" asChild>
              <Link href="/how-it-works">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      <div className="bg-muted rounded-lg p-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Preserving History Through Technology</h2>
            <p className="text-lg mb-4">
              Our platform uses cutting-edge AI and OCR technology to digitize handwritten historical documents, making
              them searchable, accessible, and available in multiple regional languages.
            </p>
            <Button size="lg" asChild>
              <Link href="/upload">Start Digitizing Now</Link>
            </Button>
          </div>
          <div className="flex justify-center">
            <img
              src="/placeholder.svg?height=300&width=400"
              alt="Document digitization illustration"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Upload Document</h3>
            <p className="text-muted-foreground">Upload your scanned historical document in JPG, or PNG format.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">2. OCR Processing</h3>
            <p className="text-muted-foreground">Our AI analyzes and extracts text from handwritten documents.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Access & Translate</h3>
            <p className="text-muted-foreground">
              View, search, and translate the digitized text in multiple languages.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
