import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, TrendingUp } from 'lucide-react'
import { Header } from '@/components/header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50">
      <Header />
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-100 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-700">
              AI-Powered Carousel Generation
            </span>
          </div>

          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
            Generate Instagram Carousels
            <br />
            in Minutes, Not Hours
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Automated research, AI-powered copywriting, professional design, and
            instant publishing. Create viral-worthy carousels about AI topics with
            one click.
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <Link
              href="/register"
              className="px-8 py-4 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/examples"
              className="px-8 py-4 bg-white text-brand-600 rounded-lg font-semibold hover:bg-gray-50 transition border-2 border-brand-200"
            >
              See Examples
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-600 mb-2">5-10min</div>
              <div className="text-gray-600">Generation Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-600 mb-2">$2.60</div>
              <div className="text-gray-600">Cost per Carousel</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-600 mb-2">8-10</div>
              <div className="text-gray-600">Slides Generated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Create Viral Carousels
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-brand-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Research</h3>
            <p className="text-gray-600">
              Automatic topic research using Perplexity, Reddit, and Twitter APIs.
              Get trending insights in seconds.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Copywriting</h3>
            <p className="text-gray-600">
              Claude AI generates scroll-stopping hooks, engaging copy, and
              optimized captions with hashtags.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Professional Design</h3>
            <p className="text-gray-600">
              DALL-E 3 generates stunning visuals. Automatic composition and
              brand-consistent styling.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl p-12 text-center text-white max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Ready to 10x Your Content Output?
          </h2>
          <p className="text-xl mb-8 text-brand-100">
            Join creators generating viral AI content effortlessly.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-600 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Start Creating Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
