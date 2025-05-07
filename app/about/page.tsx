import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, BookOpen, Users, History, Clock, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">About DocuDigitize</h1>
          <p className="text-xl text-muted-foreground">
            Preserving the past through digital innovation for future generations
          </p>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              DocuDigitize was founded with the mission to make historical documents accessible to everyone. We believe
              that our shared historical records should be preserved, digitized, and made available to researchers,
              educators, students, and the general public.
            </p>
            <p className="text-lg text-muted-foreground">
              Through cutting-edge OCR technology and AI-powered document analysis, we're bridging the gap between
              handwritten historical documents and the digital age.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="overflow-hidden transition duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <History className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Our Story</h3>
                    <p className="text-muted-foreground">
                      Founded in 2022 by a team of historians, archivists, and AI engineers, DocuDigitize began as a
                      project to digitize rare manuscripts in danger of being lost to time. Today, we've expanded to
                      help institutions and individuals worldwide preserve their historical documents.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Our Approach</h3>
                    <p className="text-muted-foreground">
                      We combine advanced OCR techniques with specialized algorithms for historical document analysis.
                      Our platform can detect and process handwritten text across multiple languages, preserving the
                      original content while making it searchable and accessible.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Multilingual OCR</h3>
                </div>
                <p className="text-sm text-muted-foreground pl-11">
                  Support for 10+ languages, including regional dialects and historical scripts
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Historical Optimization</h3>
                </div>
                <p className="text-sm text-muted-foreground pl-11">
                  Specialized algorithms for handling aged paper, faded ink, and period-specific handwriting
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Collaborative Platform</h3>
                </div>
                <p className="text-sm text-muted-foreground pl-11">
                  Share, translate, and collaborate on historical document preservation projects
                </p>
              </div>
            </div>
          </section>

          <section className="bg-muted/50 p-8 rounded-lg">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Join the Historical Preservation Movement</h2>
              <p className="text-muted-foreground">
                Start digitizing your historical documents today and contribute to our shared heritage
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <Button asChild size="lg" className="transition duration-300 transform hover:scale-[1.02]">
                  <Link href="/upload">
                    Start Digitizing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="transition duration-300 transform hover:scale-[1.02]"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
