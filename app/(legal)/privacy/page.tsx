import Link from 'next/link'

export default function PrivacyPolicyPage() {
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
          PRIVACY POLICY
        </h1>

        <div className="card-glass p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 text-iron-white">
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">1. Information We Collect</h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-iron-gray leading-relaxed">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-iron-white mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Name and email address (provided during registration)</li>
                  <li>Profile information (age, weight, height, fitness goals)</li>
                  <li>Authentication credentials (securely hashed)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-iron-white mb-2">Health & Fitness Data</h3>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Meal logs (foods, calories, macronutrients)</li>
                  <li>Workout data (exercises, sets, reps, weight)</li>
                  <li>Photos of meals (stored securely, processed by AI)</li>
                  <li>Voice recordings (processed for meal/workout logging, not permanently stored)</li>
                  <li>Activity data from connected services (Strava, Garmin)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-iron-white mb-2">Usage Data</h3>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>AI coach chat conversations (to provide context-aware coaching)</li>
                  <li>App usage patterns and preferences</li>
                  <li>Device information and IP address</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">2. How We Use Your Information</h2>
            <div className="space-y-3 text-sm sm:text-base text-iron-gray leading-relaxed">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Provide personalized AI coaching and recommendations</li>
                <li>Track your fitness and nutrition progress</li>
                <li>Generate custom workout programs and meal plans</li>
                <li>Process photos and voice inputs for meal/workout logging</li>
                <li>Improve our AI models and Service quality</li>
                <li>Send you important updates about your account</li>
                <li>Respond to your support requests</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">3. AI Processing & Third-Party Services</h2>
            <div className="space-y-4 text-sm sm:text-base text-iron-gray leading-relaxed">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-iron-white mb-2">Claude AI by Anthropic</h3>
                <p>
                  We use Claude AI to process your text, voice, and image inputs to provide coaching advice. Your data is sent to Anthropic&apos;s servers for processing in accordance with <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-iron-orange hover:underline">Anthropic&apos;s Privacy Policy</a>.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-iron-white mb-2">Supabase (Database & Storage)</h3>
                <p>
                  Your data is stored securely on Supabase infrastructure with encryption at rest and in transit. Learn more at <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-iron-orange hover:underline">Supabase Privacy Policy</a>.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-iron-white mb-2">Third-Party Integrations</h3>
                <p>
                  If you connect third-party services (Strava, Garmin), we access only the data you explicitly authorize. These services have their own privacy policies.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">4. Data Security</h2>
            <div className="space-y-3 text-sm sm:text-base text-iron-gray leading-relaxed">
              <p>We implement industry-standard security measures:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Passwords are hashed using bcrypt (never stored in plain text)</li>
                <li>HTTPS encryption for all data transmission</li>
                <li>Database encryption at rest</li>
                <li>Row-level security policies in Supabase</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication for all API endpoints</li>
              </ul>
              <p className="pt-2">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">5. Data Sharing</h2>
            <div className="space-y-3 text-sm sm:text-base text-iron-gray leading-relaxed">
              <p className="font-semibold text-iron-white">We do NOT sell your personal data.</p>
              <p>We may share your information only in these limited circumstances:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong className="text-iron-white">Service Providers:</strong> Claude AI (Anthropic), Supabase - only to provide the Service</li>
                <li><strong className="text-iron-white">Legal Requirements:</strong> If required by law or to protect our legal rights</li>
                <li><strong className="text-iron-white">With Your Consent:</strong> When you explicitly authorize sharing</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">6. Your Data Rights</h2>
            <div className="space-y-3 text-sm sm:text-base text-iron-gray leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong className="text-iron-white">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-iron-white">Correction:</strong> Update or correct your information</li>
                <li><strong className="text-iron-white">Deletion:</strong> Request deletion of your account and data</li>
                <li><strong className="text-iron-white">Export:</strong> Download your data in a portable format</li>
                <li><strong className="text-iron-white">Opt-Out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="pt-2">
                To exercise these rights, contact us at <a href="mailto:persimmonautomation@gmail.com" className="text-iron-orange hover:underline">persimmonautomation@gmail.com</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">7. Data Retention</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              We retain your personal data for as long as your account is active or as needed to provide the Service. When you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal compliance.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              SHARPENED is not intended for children under 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">9. International Users</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              Your data may be transferred to and processed in countries other than your own. By using SHARPENED, you consent to the transfer of your information to the United States and other countries where our service providers operate.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">10. Cookies & Tracking</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              We use essential cookies to maintain your login session. We do not use third-party advertising or tracking cookies. You can control cookie preferences in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">11. Changes to Privacy Policy</h2>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the Service. Your continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-iron-orange mb-3 sm:mb-4">12. Contact Us</h2>
            <div className="text-sm sm:text-base text-iron-gray leading-relaxed space-y-2">
              <p>For privacy-related questions or requests:</p>
              <p>Email: <a href="mailto:persimmonautomation@gmail.com" className="text-iron-orange hover:underline">persimmonautomation@gmail.com</a></p>
              <p>General Support: <a href="mailto:persimmonautomation@gmail.com" className="text-iron-orange hover:underline">persimmonautomation@gmail.com</a></p>
            </div>
          </section>

          <footer className="pt-8 mt-8 border-t border-iron-gray/30 text-sm text-iron-gray">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
