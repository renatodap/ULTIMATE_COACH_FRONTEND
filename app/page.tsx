/**
 * Landing Page
 *
 * Main landing page composed of modular section components
 * Each section is independently maintainable and testable
 */

'use client'

import HeroSection from '@/components/landing/HeroSection'
import SpeakYourLanguageSection from '@/components/landing/SpeakYourLanguageSection'
import PermanentMemorySection from '@/components/landing/PermanentMemorySection'
import DailyAdaptationSection from '@/components/landing/DailyAdaptationSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-iron-black">
      {/* Background gradient with particles */}
      <div className="fixed inset-0 bg-gradient-to-br from-iron-black via-iron-dark-gray to-iron-black -z-10">
        <div className="absolute inset-0 opacity-30">
          <div className="particles"></div>
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10">
        <HeroSection />
        <SpeakYourLanguageSection />
        <PermanentMemorySection />
        <DailyAdaptationSection />
        <HowItWorksSection />
        <FeaturesSection />
        <Footer />
      </main>

      {/* CSS for particles animation */}
      <style jsx>{`
        .particles {
          width: 100%;
          height: 100%;
          background-image:
            radial-gradient(2px 2px at 20% 30%, rgba(255, 69, 0, 0.4), transparent),
            radial-gradient(2px 2px at 60% 70%, rgba(255, 69, 0, 0.4), transparent),
            radial-gradient(1px 1px at 50% 50%, rgba(255, 69, 0, 0.4), transparent),
            radial-gradient(1px 1px at 80% 10%, rgba(255, 69, 0, 0.4), transparent),
            radial-gradient(2px 2px at 90% 60%, rgba(255, 69, 0, 0.4), transparent),
            radial-gradient(1px 1px at 33% 80%, rgba(255, 69, 0, 0.4), transparent),
            radial-gradient(2px 2px at 79% 90%, rgba(255, 69, 0, 0.4), transparent);
          background-size: 200% 200%;
          background-position: 0% 0%;
          animation: particleFloat 20s ease-in-out infinite;
        }

        @keyframes particleFloat {
          0%, 100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
        }
      `}</style>
    </div>
  )
}
