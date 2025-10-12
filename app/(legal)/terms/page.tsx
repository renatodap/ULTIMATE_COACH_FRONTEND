import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen py-8 sm:py-12 md:py-16 px-4 sm:px-6">
      <div className="fixed inset-0 bg-gradient-to-br from-iron-black via-iron-black to-iron-dark-gray -z-10" />

      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-6 sm:mb-8 text-sm sm:text-base text-iron-orange hover:text-iron-white transition-colors"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient-orange mb-6 sm:mb-8">
          TERMS OF SERVICE
        </h1>

        <div className="card-glass p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 text-iron-white">
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">1. Acceptance of Terms</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              By accessing and using SHARPENED (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">2. Description of Service</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              SHARPENED provides AI-powered fitness and nutrition coaching, including meal logging, workout tracking, personalized program generation, and AI chat assistance. The Service uses advanced AI technology including Claude AI for coaching and guidance.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">3. Medical Disclaimer</h2>
            <div className="space-y-3 text-sm sm:text-base text-iron-gray leading-relaxed">
              <p className="font-semibold text-iron-white">
                SHARPENED IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE.
              </p>
              <p>
                The information provided by SHARPENED is for general informational and educational purposes only. It is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or fitness program.
              </p>
              <p>
                Never disregard professional medical advice or delay in seeking it because of something you have read or received through SHARPENED. If you think you may have a medical emergency, call your doctor or emergency services immediately.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">4. User Accounts</h2>
            <div className="space-y-3 text-sm sm:text-base text-iron-gray leading-relaxed">
              <p>You are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Providing accurate and complete information during registration</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">5. User Data and Privacy</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              Your use of SHARPENED is also governed by our <Link href="/privacy" className="text-iron-orange hover:underline">Privacy Policy</Link>. We collect and process your health and fitness data to provide personalized coaching. You retain all rights to your data and may request deletion at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">6. Acceptable Use</h2>
            <div className="space-y-3 text-sm sm:text-base text-iron-gray leading-relaxed">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Upload malicious code or engage in any activity that interferes with the Service</li>
                <li>Impersonate any person or entity</li>
                <li>Harass, abuse, or harm another person through the Service</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">7. AI-Generated Content</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              SHARPENED uses AI (Claude AI) to generate coaching advice, meal plans, and workout recommendations. While we strive for accuracy, AI-generated content may contain errors or may not be suitable for your specific situation. Always use your best judgment and consult with healthcare professionals before making significant changes to your diet or exercise routine.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">8. Limitation of Liability</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              SHARPENED and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service, including any injuries, health issues, or damages arising from following AI-generated advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">9. Third-Party Services</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              The Service may integrate with third-party services (Strava, Garmin, etc.). Your use of these integrations is subject to their respective terms of service and privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">10. Changes to Terms</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">11. Termination</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for any breach of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">12. Contact</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              For questions about these Terms of Service, please contact us at: <a href="mailto:persimmonautomation@gmail.com" className="text-iron-orange hover:underline">persimmonautomation@gmail.com</a>
            </p>
          </section>

          <footer className="pt-8 mt-8 border-t border-iron-gray/30 text-sm text-iron-gray">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
