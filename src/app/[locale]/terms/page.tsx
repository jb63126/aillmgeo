import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-4xl font-black text-transparent">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700">
                These Terms of Service (&quot;Terms&quot;) govern your use of
                FlowQL&apos;s website and services (&quot;Service&quot;)
                operated by FlowQL (&quot;us&quot;, &quot;we&quot;, or
                &quot;our&quot;).
              </p>

              <p className="text-gray-700">
                By accessing or using our Service, you agree to be bound by
                these Terms. If you disagree with any part of these terms, then
                you may not access the Service.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-2xl">Use of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                  Permitted Use
                </h3>
                <p className="text-gray-700">
                  You may use FlowQL to analyze websites and understand how AI
                  systems reference your content. This includes generating
                  reports, analyzing LLM responses, and optimizing your content
                  strategy.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                  Prohibited Use
                </h3>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  <li>
                    Using the service to analyze websites you do not own or have
                    permission to analyze
                  </li>
                  <li>
                    Attempting to reverse engineer or compromise our systems
                  </li>
                  <li>
                    Using the service for any illegal or unauthorized purpose
                  </li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Interfering with or disrupting the service or servers</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-2xl">
                Account Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                When you create an account with FlowQL, you are responsible for:
              </p>
              <ul className="list-inside list-disc space-y-2 text-gray-700">
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>
                  Promptly updating your account information when it changes
                </li>
                <li>
                  Notifying us immediately of any unauthorized use of your
                  account
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-2xl">Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                FlowQL and its original content, features, and functionality are
                owned by FlowQL and are protected by international copyright,
                trademark, patent, trade secret, and other intellectual property
                laws.
              </p>

              <p className="text-gray-700">
                You retain ownership of any content you provide to the service.
                By using FlowQL, you grant us a limited license to process and
                analyze your content solely for the purpose of providing our
                services.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-2xl">Privacy and Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Your privacy is important to us. Our Privacy Policy explains how
                we collect, use, and protect your information when you use our
                Service. By using our Service, you agree to the collection and
                use of information in accordance with our Privacy Policy.
              </p>

              <p className="text-gray-700">
                We process website content and generate analysis reports. We do
                not store or retain analyzed website content beyond what is
                necessary to provide our services.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-2xl">
                Disclaimers and Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                  Service Disclaimer
                </h3>
                <p className="text-gray-700">
                  FlowQL provides AI analysis and insights, but we make no
                  guarantees about the accuracy, completeness, or reliability of
                  our analysis. The service is provided &quot;as is&quot;
                  without warranties of any kind.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                  Limitation of Liability
                </h3>
                <p className="text-gray-700">
                  In no event shall FlowQL be liable for any indirect,
                  incidental, special, consequential, or punitive damages,
                  including without limitation, loss of profits, data, use,
                  goodwill, or other intangible losses.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-2xl">Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We reserve the right to modify or replace these Terms at any
                time. If a revision is material, we will provide at least 30
                days notice prior to any new terms taking effect.
              </p>

              <p className="text-gray-700">
                Your continued use of the Service after any such changes
                constitutes your acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-2xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please
                contact us at:
              </p>
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="font-semibold text-gray-800">FlowQL</p>
                <p className="text-gray-700">Email: legal@flowql.com</p>
                <p className="text-gray-700">Website: https://www.flowql.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
