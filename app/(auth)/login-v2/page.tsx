'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/api/auth'
import { supabase } from '@/lib/supabase'

export default function LoginPageV2() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login({ email, password })
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 animate-fade-in">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-iron-black via-iron-black to-iron-dark-gray -z-10" />

      {/* Animated background pattern */}
      <div className="fixed inset-0 opacity-5 -z-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--iron-orange) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-lg space-y-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-iron-gray hover:text-iron-orange transition-colors text-sm group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center space-y-4 animate-slide-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-iron-orange/10 border-2 border-iron-orange mb-4">
            <svg className="w-10 h-10 text-iron-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gradient-orange tracking-tight">
            WELCOME BACK
          </h1>
          <p className="text-iron-gray text-sm uppercase tracking-wider">
            Continue your transformation
          </p>
        </div>

        {/* Form card */}
        <div className="card-glass p-8 sm:p-10 space-y-8 border-2 border-iron-gray/20 animate-fade-in backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email input */}
            <div className="space-y-3">
              <label htmlFor="email" className="block text-xs text-iron-gray uppercase tracking-widest font-semibold">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs text-iron-gray uppercase tracking-widest font-semibold">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-iron-orange hover:text-[#FF5722] transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-iron-orange/10 border-2 border-iron-orange text-iron-orange text-sm animate-fade-in rounded">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="font-bold">ERROR:</strong> {error}
                  </div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-lg py-4 hover:shadow-lg hover:shadow-iron-orange/20 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-iron-black border-t-transparent rounded-full animate-spin" />
                  LOGGING IN...
                </span>
              ) : (
                'LOG IN'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-iron-gray/30" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-iron-black px-4 text-iron-gray uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-secondary w-full text-lg py-4 flex items-center justify-center gap-4 hover:shadow-lg hover:shadow-iron-gray/10 transition-all"
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
            {loading ? 'CONNECTING...' : 'GOOGLE'}
          </button>

          {/* Sign up link */}
          <div className="text-center pt-4">
            <p className="text-sm text-iron-gray">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-iron-orange hover:text-[#FF5722] font-semibold uppercase tracking-wider transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-center space-y-3">
          <p className="text-xs text-iron-gray">
            Secure authentication powered by modern encryption
          </p>
          <p className="text-xs text-iron-gray">
            By logging in, you agree to our{' '}
            <Link href="/terms" className="text-iron-orange hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-iron-orange hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
