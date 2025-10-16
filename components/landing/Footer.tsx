/**
 * Footer Component
 *
 * Site footer with links, disclaimer, and copyright
 */

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-iron-black py-12 px-4 sm:px-6 border-t border-iron-gray">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Tech Stack */}
        <div className="text-center text-iron-gray text-xs sm:text-sm">
          <p>Powered by Claude AI • FastAPI • Supabase</p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-iron-gray text-xs sm:text-sm">
          <Link href="/privacy" className="hover:text-iron-orange transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-iron-orange transition-colors">
            Terms of Service
          </Link>
          <Link href="/cookies" className="hover:text-iron-orange transition-colors">
            Cookie Policy
          </Link>
          <Link href="/contact" className="hover:text-iron-orange transition-colors">
            Contact
          </Link>
        </div>

        {/* Contact Info */}
        <div className="text-center text-iron-gray text-xs space-y-1">
          <p>Contact: persimmonautomation@gmail.com</p>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-iron-dark-gray border-l-4 border-iron-orange p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-iron-white uppercase">Medical Disclaimer</h3>
          <p className="text-iron-gray text-xs">
            SHARPENED provides fitness guidance powered by AI. This is not medical advice.
            Consult healthcare professionals before starting any fitness program.
            Not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center text-iron-gray text-xs">
          <p>© 2025 SHARPENED. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
