import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function FAQPage() {
  return (
    <div className="container mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about our historical document digitization platform
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border rounded-lg overflow-hidden transition-all duration-200">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-all">
              What types of documents can I digitize with DocuDigitize?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-2">
              <p className="text-muted-foreground">
                DocuDigitize is designed to handle a wide range of historical documents including handwritten
                manuscripts, letters, historical records, certificates, official documents, and old printed materials.
                Our platform is optimized for documents that are challenging to process with standard OCR software, such
                as documents with aged paper, faded ink, or historical handwriting styles.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border rounded-lg overflow-hidden transition-all duration-200">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-all">
              What file formats does DocuDigitize support?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-2">
              <p className="text-muted-foreground">
                Our platform supports various file formats including PDF, JPEG, PNG, and TIFF. For best results, we
                recommend uploading high-resolution scans (at least 300 DPI) to ensure the OCR process can accurately
                detect the text in your documents.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border rounded-lg overflow-hidden transition-all duration-200">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-all">
              How accurate is the OCR processing?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-2">
              <p className="text-muted-foreground">
                OCR accuracy depends on several factors including document quality, handwriting clarity, and language.
                Our advanced OCR technology typically achieves 85-95% accuracy for well-preserved documents with clear
                handwriting. Historical documents with faded text or unusual handwriting styles may have lower accuracy,
                but our specialized algorithms are designed to handle these challenges better than standard OCR
                solutions.
              </p>
              <p className="mt-2 text-muted-foreground">
                You can improve accuracy by using our image enhancement tools before processing and adjusting the
                confidence threshold in the advanced settings.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border rounded-lg overflow-hidden transition-all duration-200">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-all">
              What languages does DocuDigitize support?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-2">
              <p className="text-muted-foreground">
                DocuDigitize supports multiple languages including English, Hindi, Bengali, Tamil, Telugu, Marathi,
                Gujarati, Kannada, Malayalam, Punjabi, and Urdu. You can select the source language during document
                upload, or use our auto-detection feature. Our translation capabilities allow you to translate the
                extracted text into any of these languages.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border rounded-lg overflow-hidden transition-all duration-200">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-all">
              Is my data secure? Who can access my documents?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-2">
              <p className="text-muted-foreground">
                We take data security very seriously. All uploaded documents and extracted text are encrypted both in
                transit and at rest. Your documents are only accessible to you and anyone you explicitly share them
                with. We do not claim ownership of your content, and you retain all rights to your documents.
              </p>
              <p className="mt-2 text-muted-foreground">
                For more details, please refer to our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border rounded-lg overflow-hidden transition-all duration-200">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-all">
              How does the historical document processing mode work?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-2">
              <p className="text-muted-foreground">
                The historical document processing mode uses specialized algorithms trained on thousands of historical
                documents from different periods. It includes enhanced preprocessing for aged paper, specialized
                recognition patterns for period-specific handwriting styles, and contextual analysis to improve accuracy
                for archaic language and terminology. This mode is recommended for documents over 50 years old or
                documents with distinctive historical handwriting styles.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border rounded-lg overflow-hidden transition-all duration-200">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-all">
              Can I export or download my digitized documents?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-2">
              <p className="text-muted-foreground">
                Yes, you can download your digitized documents in various formats. We support plain text exports, which
                are ideal for further processing or analysis. You can also download PDFs that include both the original
                document and the extracted text. For translated documents, you can download both the original and
                translated text together.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8" className="border rounded-lg overflow-hidden transition-all duration-200">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-all">
              Do you offer services for large-scale digitization projects?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-2">
              <p className="text-muted-foreground">
                Yes, we offer specialized solutions for museums, libraries, archives, and other institutions with large
                collections of historical documents. Our enterprise services include bulk processing, customized
                workflows, API access, and dedicated support. Please{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  contact us
                </Link>{" "}
                to discuss your specific needs and how we can help with your large-scale digitization project.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 text-center">
          <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="transition duration-300 transform hover:scale-[1.02]">
              <Link href="/contact">
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="transition duration-300 transform hover:scale-[1.02]">
              <Link href="/upload">Try the Platform</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
