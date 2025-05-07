import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last Updated: April 3, 2024</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p>
              Welcome to DocuDigitize. We respect your privacy and are committed to protecting your personal data. This
              privacy policy will inform you about how we handle your personal data when you visit our website and use
              our services, and tell you about your privacy rights and how the law protects you.
            </p>
            <p>
              This privacy policy applies to all users of DocuDigitize, including those who upload, process, and manage
              historical documents through our platform. Please read this privacy policy carefully to understand our
              practices regarding your personal data.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Data We Collect</h2>
            <p>We may collect, use, store, and transfer different kinds of personal data about you:</p>
            <ul className="space-y-2 mt-4">
              <li>
                <strong>Identity Data:</strong> Includes first name, last name, username or similar identifier.
              </li>
              <li>
                <strong>Contact Data:</strong> Includes email address and telephone numbers.
              </li>
              <li>
                <strong>Technical Data:</strong> Includes internet protocol (IP) address, your login data, browser type
                and version, time zone setting and location, browser plug-in types and versions, operating system and
                platform, and other technology on the devices you use to access this website.
              </li>
              <li>
                <strong>Usage Data:</strong> Includes information about how you use our website and services.
              </li>
              <li>
                <strong>Document Data:</strong> Includes the content of documents you upload to our platform for
                processing, including any text extracted from these documents.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal
              data in the following circumstances:
            </p>
            <ul className="space-y-2 mt-4">
              <li>To provide and maintain our service, including to monitor the usage of our service.</li>
              <li>To manage your account and provide you with customer support.</li>
              <li>
                To process and complete transactions, and send you related information, including purchase confirmations
                and invoices.
              </li>
              <li>To improve and personalize your experience on our platform.</li>
              <li>To develop and improve our services, including OCR and translation features.</li>
              <li>To communicate with you, including sending service-related notices and promotional messages.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Document Data and Content</h2>
            <p>
              DocuDigitize is designed to process historical documents and extract text using OCR technology. When you
              upload documents to our platform:
            </p>
            <ul className="space-y-2 mt-4">
              <li>You retain all rights to your documents and the content within them.</li>
              <li>We process your documents solely to provide the OCR and translation services you request.</li>
              <li>We do not claim ownership of your content or documents.</li>
              <li>
                We do not use the content of your documents for purposes other than providing our services unless you
                explicitly consent to such use.
              </li>
              <li>
                We may analyze document processing in aggregate, anonymized form to improve our OCR algorithms and
                service quality.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Data Security</h2>
            <p>
              We have implemented appropriate security measures to prevent your personal data from being accidentally
              lost, used, or accessed in an unauthorized way, altered, or disclosed. These measures include:
            </p>
            <ul className="space-y-2 mt-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Access controls and authentication measures</li>
              <li>Regular security assessments</li>
              <li>Employee training on security best practices</li>
              <li>Monitoring systems for unusual activity</li>
            </ul>
            <p>
              We limit access to your personal data to those employees, agents, contractors, and other third parties who
              have a business need to know. They will only process your personal data on our instructions and they are
              subject to a duty of confidentiality.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Your Data Protection Rights</h2>
            <p>Depending on your location, you may have the following data protection rights:</p>
            <ul className="space-y-2 mt-4">
              <li>
                <strong>Right to Access:</strong> You have the right to request copies of your personal data.
              </li>
              <li>
                <strong>Right to Rectification:</strong> You have the right to request that we correct any information
                you believe is inaccurate or complete information you believe is incomplete.
              </li>
              <li>
                <strong>Right to Erasure:</strong> You have the right to request that we erase your personal data, under
                certain conditions.
              </li>
              <li>
                <strong>Right to Restrict Processing:</strong> You have the right to request that we restrict the
                processing of your personal data, under certain conditions.
              </li>
              <li>
                <strong>Right to Object to Processing:</strong> You have the right to object to our processing of your
                personal data, under certain conditions.
              </li>
              <li>
                <strong>Right to Data Portability:</strong> You have the right to request that we transfer the data we
                have collected to another organization, or directly to you, under certain conditions.
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at privacy@docudigitize.com. We will respond to your
              request within 30 days.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and store certain
              information. Cookies are files with a small amount of data which may include an anonymous unique
              identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being
              sent.
            </p>
            <p>We use cookies for the following purposes:</p>
            <ul className="space-y-2 mt-4">
              <li>To maintain your session and authenticate you when you log in</li>
              <li>To remember your preferences and settings</li>
              <li>To understand how you use our platform</li>
              <li>To improve our services based on your usage patterns</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
            <p>
              Our service is not intended for use by children under the age of 16. We do not knowingly collect
              personally identifiable information from children under 16. If you are a parent or guardian and you are
              aware that your child has provided us with personal data, please contact us so that we can take
              appropriate action.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "last updated" date at the top of this page. You are advised
              to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective
              when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul className="space-y-2 mt-4">
              <li>By email: privacy@docudigitize.com</li>
              <li>By phone: +1 (800) 555-1234</li>
              <li>By mail: 123 Digital Ave, Suite 400, Boston, MA 02110</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
