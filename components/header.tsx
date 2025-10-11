'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              Carousel AI
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
