import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUp, FileText, Search, RotateCw, Sparkles, Languages } from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">How DocuDigitize Works</h1>
          <p className="text-xl text-muted-foreground">
            Transform historical documents into accessible digital text in a few simple steps
          </p>
        </div>

        <div className="space-y-16">
          <section>
            <div className="relative">
              <div className="absolute left-9 top-4 w-[2px] h-[calc(100%-2rem)] bg-border z-0"></div>
              <div className="space-y-12 relative z-10">
                <div className="flex items-start group">
                  <div className="mr-6 bg-background shadow-sm border-2 border-border rounded-full p-4 transition-all duration-300 group-hover:border-primary">
                    <FileUp className="h-6 w-6 text-primary" />
                  </div>
                  <div className="pt-2">
                    <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      1. Upload Your Document
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Upload your historical document in various formats including PDF, JPG, PNG, and TIFF. Our system
                      accepts documents of various qualities and conditions.
                    </p>
                    <Card className="overflow-hidden transition duration-300 hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="font-medium">Supported Document Types:</div>
                          <ul className="grid grid-cols-2 gap-2 text-sm">
                            <li className="flex items-center">
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                              Historical manuscripts
                            </li>
                            <li className="flex items-center">
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                              Handwritten letters
                            </li>
                            <li className="flex items-center">
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                              Official documents
                            </li>
                            <li className="flex items-center">
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                              Old books & journals
                            </li>
                            <li className="flex items-center">
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                              Census records
                            </li>
                            <li className="flex items-center">
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                              Legal documents
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="mr-6 bg-background shadow-sm border-2 border-border rounded-full p-4 transition-all duration-300 group-hover:border-primary">
                    <RotateCw className="h-6 w-6 text-primary" />
                  </div>
                  <div className="pt-2">
                    <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      2. Configure Processing Settings
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Customize the OCR process according to your document's specific needs. Select the language,
                      document type, and processing mode to get optimal results.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="overflow-hidden transition duration-300 hover:shadow-md">
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">Processing Modes</h3>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 mt-1.5"></span>
                              <span>
                                <strong>Standard:</strong> Best for typed documents and clear handwriting
                              </span>
                            </li>
                            <li className="flex items-start">
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 mt-1.5"></span>
                              <span>
                                <strong>Historical:</strong> Specialized for aged documents and period handwriting
                              </span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="overflow-hidden transition duration-300 hover:shadow-md">
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">Enhancement Options</h3>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 mt-1.5"></span>
                              <span>Image pre-processing for better contrast</span>
                            </li>
                            <li className="flex items-start">
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 mt-1.5"></span>
                              <span>Deskewing and noise reduction</span>
                            </li>
                            <li className="flex items-start">
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 mt-1.5"></span>
                              <span>Confidence threshold adjustment</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="mr-6 bg-background shadow-sm border-2 border-border rounded-full p-4 transition-all duration-300 group-hover:border-primary">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="pt-2">
                    <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      3. OCR Processing
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Our advanced OCR technology processes your document, carefully extracting the text while
                      preserving the original content and structure. The AI system the text while preserving the
                      original content and structure. The AI system intelligently recognizes handwriting patterns,
                      adapts to different styles, and handles various document qualities.
                    </p>
                    <Card className="overflow-hidden transition duration-300 hover:shadow-md">
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2">OCR Technology Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 mt-1.5"></span>
                            <span>Advanced handwriting recognition algorithms</span>
                          </div>
                          <div className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 mt-1.5"></span>
                            <span>Period-specific text analysis</span>
                          </div>
                          <div className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 mt-1.5"></span>
                            <span>Contextual language processing</span>
                          </div>
                          <div className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 mt-1.5"></span>
                            <span>Multi-language support</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="mr-6 bg-background shadow-sm border-2 border-border rounded-full p-4 transition-all duration-300 group-hover:border-primary">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="pt-2">
                    <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      4. Review & Edit Results
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      After processing, you can review the extracted text, make any necessary edits, and save the
                      document. Our platform provides a detailed view of the original document alongside the digital
                      text.
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="mr-6 bg-background shadow-sm border-2 border-border rounded-full p-4 transition-all duration-300 group-hover:border-primary">
                    <Languages className="h-6 w-6 text-primary" />
                  </div>
                  <div className="pt-2">
                    <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      5. Translate & Export
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Translate the extracted text into multiple languages to make historical documents accessible to a
                      wider audience. Export your document in various formats including text files and PDFs.
                    </p>
                    <Card className="overflow-hidden transition duration-300 hover:shadow-md">
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2">Available Languages</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                          <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                            English
                          </div>
                          <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                            Hindi
                          </div>
                          <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                            Bengali
                          </div>
                          <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                            Tamil
                          </div>
                          <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                            Telugu
                          </div>
                          <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                            Marathi
                          </div>
                          <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                            Gujarati
                          </div>
                          <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                            And more...
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="mr-6 bg-background shadow-sm border-2 border-border rounded-full p-4 transition-all duration-300 group-hover:border-primary">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <div className="pt-2">
                    <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      6. Access & Search
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      All your processed documents are stored in your personal library where you can search, organize,
                      and access them anytime. The digital text is fully searchable, making research easier.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-muted/50 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Digitize Your Historical Documents?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of researchers, historians, and institutions who are preserving history with DocuDigitize.
              Get started with your first document today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="transition duration-300 transform hover:scale-[1.02]">
                <Link href="/upload">Start Digitizing Now</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="transition duration-300 transform hover:scale-[1.02]"
              >
                <Link href="/faq">Read FAQs</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
