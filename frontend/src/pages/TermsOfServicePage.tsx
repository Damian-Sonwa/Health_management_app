import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-blue-50/80 to-purple-50/80 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">NuviaCare Terms of Service</CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              <strong>Effective Date:</strong> October 7, 2025
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <p>
                By accessing or using NuviaCare, you agree to these Terms of Service ("Terms"). If you do not agree, do not use the app.
              </p>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">1. Eligibility</h2>
                <p>You must be at least 18 years old to use NuviaCare or have legal guardian consent.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">2. Nature of the Service</h2>
                <p>NuviaCare is a <strong>health communication and management platform</strong>. It:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Does NOT replace professional medical advice</li>
                  <li>Does NOT provide emergency services</li>
                </ul>
                <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
                  <p className="font-semibold">For emergencies, contact local emergency services immediately.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">3. User Responsibilities</h2>
                <p>You agree to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate information</li>
                  <li>Keep your login credentials secure</li>
                  <li>Use the app only for lawful healthcare-related purposes</li>
                </ul>
                <p className="mt-4">You must not:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Misuse the platform</li>
                  <li>Attempt unauthorized access</li>
                  <li>Upload harmful or misleading content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">4. Communication Features</h2>
                <p>NuviaCare supports:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>In-app phone calls</li>
                  <li>In-app video calls</li>
                  <li>Email messaging</li>
                </ul>
                <p className="mt-4">You consent to using these features for healthcare communication.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">5. Account Suspension</h2>
                <p>We reserve the right to suspend or terminate accounts that:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Violate these Terms</li>
                  <li>Engage in fraudulent or harmful behavior</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">6. Intellectual Property</h2>
                <p>All content, trademarks, and software associated with NuviaCare belong to NuviaCare. You may not copy or reuse them without permission.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">7. Limitation of Liability</h2>
                <p>NuviaCare is provided &quot;as is.&quot; We are not liable for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Medical outcomes</li>
                  <li>Data loss beyond reasonable control</li>
                  <li>Service interruptions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">8. Indemnification</h2>
                <p>You agree to indemnify and hold NuviaCare harmless from claims arising from misuse of the app.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">9. Governing Law</h2>
                <p>These Terms are governed by the laws of <strong>[Insert Country/State]</strong>.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">10. Changes to Terms</h2>
                <p>We may update these Terms at any time. Continued use indicates acceptance.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">11. Contact Information</h2>
                <p>For questions regarding these Terms:</p>
                <p><strong>Email:</strong> [Insert Contact Email]</p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

