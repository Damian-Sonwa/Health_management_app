import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-blue-50/80 to-purple-50/80 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">NuviaCare Privacy Policy</CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              <strong>Effective Date:</strong> October 7, 2025
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <p>
                NuviaCare ("we", "our", or "us") is a digital health application designed to help patients, doctors, and pharmacies communicate and manage healthcare-related services. Your privacy is very important to us, and this Privacy Policy explains how we collect, use, store, and protect your information.
              </p>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
                <p>We may collect the following types of information:</p>
                
                <h3 className="text-xl font-semibold mt-4 mb-2">a. Personal Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>User role (Patient, Doctor, Pharmacy)</li>
                  <li>Account credentials</li>
                </ul>

                <h3 className="text-xl font-semibold mt-4 mb-2">b. Health-Related Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Medication requests and prescriptions</li>
                  <li>Appointment details</li>
                  <li>Health-related notes shared within the app</li>
                </ul>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                  <p className="font-semibold">NuviaCare does <strong>not</strong> provide medical diagnosis or emergency services.</p>
                </div>

                <h3 className="text-xl font-semibold mt-4 mb-2">c. Usage &amp; Device Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Device type and operating system</li>
                  <li>IP address</li>
                  <li>App usage data (pages visited, actions taken)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
                <p>We use collected information to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide and improve app services</li>
                  <li>Facilitate communication via phone calls, video calls, and email messaging</li>
                  <li>Manage user accounts and roles</li>
                  <li>Ensure platform security and fraud prevention</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">3. Information Sharing</h2>
                <p>We do <strong>not sell or rent</strong> your personal data.</p>
                <p>We may share information:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Between authorized users (e.g., patient and doctor)</li>
                  <li>With trusted service providers (hosting, analytics, communication services)</li>
                  <li>When required by law or legal process</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">4. Data Security</h2>
                <p>We implement industry-standard security measures including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Encryption</li>
                  <li>Secure authentication</li>
                  <li>Access control based on user roles</li>
                </ul>
                <p className="mt-4">However, no system is 100% secure, and we cannot guarantee absolute security.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">5. Data Retention</h2>
                <p>We retain personal and health information only as long as necessary to provide services or comply with legal obligations.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">6. Your Rights</h2>
                <p>Depending on your location, you may have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access your data</li>
                  <li>Request correction or deletion</li>
                  <li>Withdraw consent</li>
                </ul>
                <p className="mt-4">Requests can be made via: <strong>[Insert Support Email]</strong></p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">7. Third-Party Services</h2>
                <p>NuviaCare may integrate third-party tools for phone calls, video calls, or email messaging. Their use is governed by their respective privacy policies.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">8. Children&apos;s Privacy</h2>
                <p>NuviaCare is not intended for children under 18 without parental or guardian consent.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">9. Changes to This Policy</h2>
                <p>We may update this Privacy Policy periodically. Continued use of NuviaCare means acceptance of the updated policy.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-6 mb-4">10. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, contact us at:</p>
                <p><strong>Email:</strong> [Insert Contact Email]</p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

