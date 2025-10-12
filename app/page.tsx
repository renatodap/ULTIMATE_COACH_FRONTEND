import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-iron-black">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-iron-black via-iron-dark-gray to-iron-black -z-10" />

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-0">
        {/* Hero section */}
        <section className="flex flex-col items-center justify-center text-center space-y-10 sm:space-y-12">
          {/* Brand */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-gradient-orange leading-none">
              SHARPENED
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-iron-gray uppercase tracking-widest">
              AI Fitness Coach
            </p>
          </div>

          {/* Description */}
          <p className="max-w-lg sm:max-w-xl md:max-w-2xl text-base sm:text-lg md:text-xl text-iron-gray leading-relaxed px-4">
            Transform your fitness journey with AI-powered coaching, smart meal tracking,
            and personalized workout plans. Your 24/7 fitness companion.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 sm:pt-8 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/signup"
              className="px-8 sm:px-12 py-4 sm:py-5 bg-iron-orange text-iron-black font-bold text-lg sm:text-xl uppercase tracking-wider hover:bg-[#FF5722] transition-all hover:scale-105 active:scale-95 text-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 sm:px-12 py-4 sm:py-5 border-2 border-iron-gray text-iron-white font-bold text-lg sm:text-xl uppercase tracking-wider hover:border-iron-orange hover:text-iron-orange transition-all hover:scale-105 active:scale-95 text-center"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features section */}
        <section className="pt-12 sm:pt-16 pb-12 sm:pb-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          <div className="bg-iron-dark-gray border-2 border-iron-gray p-6 sm:p-8 space-y-3 sm:space-y-4 hover:border-iron-orange transition-colors">
            <div className="text-4xl sm:text-5xl">🤖</div>
            <h3 className="text-xl sm:text-2xl font-bold text-iron-white uppercase">AI Coach</h3>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              Get personalized guidance from an AI that understands your goals and adapts to your progress.
            </p>
          </div>

          <div className="bg-iron-dark-gray border-2 border-iron-gray p-6 sm:p-8 space-y-3 sm:space-y-4 hover:border-iron-orange transition-colors">
            <div className="text-4xl sm:text-5xl">📸</div>
            <h3 className="text-xl sm:text-2xl font-bold text-iron-white uppercase">Photo Tracking</h3>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              Snap a picture of your meal and let AI analyze nutrition instantly. No manual entry needed.
            </p>
          </div>

          <div className="bg-iron-dark-gray border-2 border-iron-gray p-6 sm:p-8 space-y-3 sm:space-y-4 hover:border-iron-orange transition-colors">
            <div className="text-4xl sm:text-5xl">📊</div>
            <h3 className="text-xl sm:text-2xl font-bold text-iron-white uppercase">Smart Analytics</h3>
            <p className="text-sm sm:text-base text-iron-gray leading-relaxed">
              Track your progress with intelligent insights and data-driven recommendations.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 text-center text-iron-gray text-sm">
          <p>Built with Next.js, FastAPI & Claude AI</p>
          <div className="mt-4 space-x-6">
            <Link href="/privacy" className="hover:text-iron-orange transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-iron-orange transition-colors">
              Terms
            </Link>
          </div>
        </footer>
      </main>
    </div>
  )
}
