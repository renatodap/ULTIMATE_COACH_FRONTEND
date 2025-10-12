import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-iron-black">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-iron-black via-iron-dark-gray to-iron-black -z-10" />

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        {/* Hero section */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-12">
          {/* Brand */}
          <div className="space-y-6">
            <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black text-gradient-orange leading-none">
              SHARPENED
            </h1>
            <p className="text-2xl sm:text-3xl md:text-4xl text-iron-gray uppercase tracking-[0.2em]">
              AI Fitness Coach
            </p>
          </div>

          {/* Description */}
          <p className="max-w-2xl text-lg sm:text-xl text-iron-gray leading-relaxed">
            Transform your fitness journey with AI-powered coaching, smart meal tracking,
            and personalized workout plans. Your 24/7 fitness companion.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <Link
              href="/signup"
              className="px-12 py-5 bg-iron-orange text-iron-black font-bold text-xl uppercase tracking-wider hover:bg-[#FF5722] transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-12 py-5 border-2 border-iron-gray text-iron-white font-bold text-xl uppercase tracking-wider hover:border-iron-orange hover:text-iron-orange transition-all hover:scale-105 active:scale-95"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features section */}
        <section className="py-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-iron-dark-gray border-2 border-iron-gray p-8 space-y-4 hover:border-iron-orange transition-colors">
            <div className="text-5xl">🤖</div>
            <h3 className="text-2xl font-bold text-iron-white uppercase">AI Coach</h3>
            <p className="text-iron-gray">
              Get personalized guidance from an AI that understands your goals and adapts to your progress.
            </p>
          </div>

          <div className="bg-iron-dark-gray border-2 border-iron-gray p-8 space-y-4 hover:border-iron-orange transition-colors">
            <div className="text-5xl">📸</div>
            <h3 className="text-2xl font-bold text-iron-white uppercase">Photo Tracking</h3>
            <p className="text-iron-gray">
              Snap a picture of your meal and let AI analyze nutrition instantly. No manual entry needed.
            </p>
          </div>

          <div className="bg-iron-dark-gray border-2 border-iron-gray p-8 space-y-4 hover:border-iron-orange transition-colors">
            <div className="text-5xl">📊</div>
            <h3 className="text-2xl font-bold text-iron-white uppercase">Smart Analytics</h3>
            <p className="text-iron-gray">
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
