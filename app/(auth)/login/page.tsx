'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/api/auth'
import { getCurrentUser } from '@/lib/api/users'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()

  // Check if user is already logged in with a VALID session
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const user = await getCurrentUser()
        // If we get here, token is valid - redirect to dashboard
        if (user.onboarding_completed) {
          window.location.href = '/dashboard'
        } else {
          window.location.href = '/onboarding'
        }
      } catch (error) {
        // Token is invalid or doesn't exist - show login page
        setCheckingSession(false)
      }
    }
    checkExistingSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await login({ email, password })

      // Use window.location.href for hard redirect to ensure cookies are loaded
      // router.push() can fail because middleware checks cookies before they're set
      if (!response.user.onboarding_completed) {
        window.location.href = '/onboarding'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      // Log error silently for debugging

      // Show detailed error message
      if (err?.type === 'NetworkError') {
        setError('Unable to connect to server. Please check the Railway CORS configuration.')
      } else {
        setError(err?.detail || err?.message || 'Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login with Google')
      setLoading(false)
    }
  }

  // Show loading while checking existing session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-iron-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iron-orange mx-auto mb-4"></div>
          <p className="text-iron-gray uppercase tracking-wider">Checking session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iron-black flex items-center justify-center px-6 py-12">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-iron-black via-iron-dark-gray to-iron-black -z-10" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center text-iron-gray hover:text-iron-orange transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-black text-gradient-orange uppercase">
            Welcome Back
          </h1>
          <p className="text-iron-gray uppercase tracking-wider">
            Sign in to continue your journey
          </p>
        </div>

        {/* Form container */}
        <div className="bg-iron-dark-gray border-2 border-iron-gray p-8 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-iron-orange/10 border-2 border-iron-orange text-iron-orange p-4">
              <p className="font-semibold">Error: {error}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-iron-gray uppercase text-xs tracking-wider font-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-iron-black border-2 border-iron-gray text-iron-white focus:border-iron-orange focus:outline-none transition-colors"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-iron-gray uppercase text-xs tracking-wider font-semibold">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-iron-black border-2 border-iron-gray text-iron-white focus:border-iron-orange focus:outline-none transition-colors"
                placeholder="••••••••"
                disabled={loading}
              />
              <p className="text-xs text-iron-gray">
                Passwords must be 8+ characters with uppercase, lowercase, numbers, and symbols
              </p>
            </div>

            {/* Forgot password link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-iron-orange hover:text-[#FF5722] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-iron-orange text-iron-black font-bold text-lg uppercase tracking-wider hover:bg-[#FF5722] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-iron-gray"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-iron-dark-gray px-2 text-iron-gray">Or</span>
            </div>
          </div>

          {/* Google login button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full px-8 py-4 border-2 border-iron-gray text-iron-white font-bold text-lg uppercase tracking-wider hover:border-iron-orange hover:text-iron-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          {/* Sign up link */}
          <div className="text-center pt-4">
            <p className="text-iron-gray">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-iron-orange hover:text-[#FF5722] font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-xs text-iron-gray">
            Protected by modern encryption and security standards
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <Link href="/privacy" className="text-iron-gray hover:text-iron-orange transition-colors">
              Privacy Policy
            </Link>
            <span className="text-iron-gray">•</span>
            <Link href="/terms" className="text-iron-gray hover:text-iron-orange transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
