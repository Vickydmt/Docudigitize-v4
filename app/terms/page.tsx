import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <Button asChild variant="outline" size="sm" className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last Updated: April 3, 2024</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p>
              Welcome to DocuDigitize. These Terms of Service ("Terms") govern your use of our website and services,
              including our historical document digitization platform. By accessing or using our services, you agree to
              be bound by these Terms. If you disagree with any part of the Terms, you may not access the service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Definitions</h2>
            <ul className="space-y-2">
              <li>
                <strong>"Service"</strong> refers to the DocuDigitize website and historical document digitization
                platform.
              </li>
              <li>
                <strong>"User"</strong> refers to any individual who accesses or uses the Service.
              </li>
              <li>
                <strong>"Content"</strong> refers to documents, text, images, or other materials uploaded, processed, or
                stored through the Service.
              </li>
              <li>
                <strong>"OCR"</strong> refers to Optical Character Recognition, the technology used to convert images of
                text into machine-readable text.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Account Registration</h2>
            <p>
              To use certain features of the Service, you may be required to register for an account. You agree to
              provide accurate, current, and complete information during the registration process and to update such
              information to keep it accurate, current, and complete.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for any
              activities or actions under your password. You agree not to disclose your password to any third party. You
              must notify us immediately upon becoming aware of any breach of security or unauthorized use of your
              account.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Acceptable Use Policy</h2>
            <p>
              You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to
              use the Service:
            </p>
            <ul className="space-y-2 mt-4">
              <li>
                In any way that violates any applicable federal, state, local, or international law or regulation.
              </li>
              <li>
                To transmit, or procure the sending of, any advertising or promotional material, including any "junk
                mail," "chain letter," "spam," or any other similar solicitation.
              </li>
              <li>
                To impersonate or attempt to impersonate DocuDigitize, a DocuDigitize employee, another user, or any
                other person or entity.
              </li>
              <li>
                To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or
                which, as determined by us, may harm DocuDigitize or users of the Service.
              </li>
              <li>
                To upload, process, or store documents containing illegal, harmful, or sensitive personal information
                without proper authorization.
              </li>
              <li>
                To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service,
                the server on which the Service is stored, or any server, computer, or database connected to the
                Service.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Content and Intellectual Property Rights</h2>
            <p>
              <strong>Your Content:</strong> You retain all rights to the documents and content you upload to the
              Service. By uploading content to the Service, you grant DocuDigitize a limited license to use, store, and
              process that content for the purpose of providing and improving the Service.
            </p>
            <p>
              <strong>DocuDigitize Content:</strong> The Service and its original content, features, and functionality
              are and will remain the exclusive property of DocuDigitize and its licensors. The Service is protected by
              copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and
              trade dress may not be used in connection with any product or service without the prior written consent of
              DocuDigitize.
            </p>
            <p>
              <strong>Limitations on Content:</strong> You agree not to upload any content that:
            </p>
            <ul className="space-y-2 mt-4">
              <li>Infringes on the intellectual property rights of others.</li>
              <li>Contains personal or sensitive information about others without their consent.</li>
              <li>Contains illegal, harmful, or objectionable material.</li>
              <li>Violates any applicable laws or regulations.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Service Modification and Termination</h2>
            <p>
              DocuDigitize reserves the right to modify or discontinue, temporarily or permanently, the Service (or any
              part thereof) with or without notice. We shall not be liable to you or to any third party for any
              modification, suspension, or discontinuance of the Service.
            </p>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice
              or liability, under our sole discretion, for any reason whatsoever and without limitation, including but
              not limited to a breach of the Terms.
            </p>
            <p>
              If you wish to terminate your account, you may simply discontinue using the Service. All provisions of the
              Terms which by their nature should survive termination shall survive termination, including, without
              limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an "as is" and "as available" basis without any warranties of any kind, either
              express or implied. DocuDigitize expressly disclaims all warranties of any kind, whether express or
              implied, including but not limited to the implied warranties of merchantability, fitness for a particular
              purpose, and non-infringement.
            </p>
            <p>
              DocuDigitize does not warrant that the Service will be uninterrupted, timely, secure, or error-free, or
              that any errors in the Service will be corrected. This includes the accuracy of OCR processing, which may
              vary based on document quality, handwriting clarity, and other factors.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
            <p>
              In no event shall DocuDigitize, its directors, employees, partners, agents, suppliers, or affiliates be
              liable for any indirect, incidental, special, consequential, or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="space-y-2 mt-4">
              <li>Your access to or use of or inability to access or use the Service;</li>
              <li>Any conduct or content of any third party on the Service;</li>
              <li>Any content obtained from the Service; and</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content;</li>
              <li>Errors or inaccuracies in the OCR processing of your documents.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless DocuDigitize, its parent, subsidiaries, affiliates, and
              its licensors and service providers, and its and their respective officers, directors, employees,
              contractors, agents, licensors, suppliers, successors, and assigns from and against any claims,
              liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys'
              fees) arising out of or relating to your violation of these Terms or your use of the Service, including,
              but not limited to, your uploads or any use of the Service's content, services, and products other than as
              expressly authorized in these Terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the Commonwealth of
              Massachusetts, United States, without regard to its conflict of law provisions.
            </p>
            <p>
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those
              rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining
              provisions of these Terms will remain in effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us:</p>
            <ul className="space-y-2 mt-4">
              <li>By email: legal@docudigitize.com</li>
              <li>By phone: +1 (800) 555-1234</li>
              <li>By mail: 123 Digital Ave, Suite 400, Boston, MA 02110</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
