'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthErrorMessage, { AuthSuccessMessage, getUserFriendlyErrorMessage } from '@/components/auth/AuthErrorMessage'
import { ErrorLogger, ErrorCategory, ErrorSeverity } from '@/lib/logging/ErrorLogger'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to send reset email')
      }

      // Log successful password reset request
      ErrorLogger.log({
        category: ErrorCategory.AUTH_VERIFICATION,
        severity: ErrorSeverity.INFO,
        message: 'Password reset email requested',
        userEmail: email
      })

      setSuccess(true)
    } catch (err) {
      // Log error with ErrorLogger
      ErrorLogger.log({
        category: ErrorCategory.AUTH_VERIFICATION,
        severity: ErrorSeverity.ERROR,
        message: 'Password reset request failed',
        error: err,
        userEmail: email
      })

      // Show user-friendly error message
      setError(getUserFriendlyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 animate-fade-in">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-iron-black via-iron-black to-iron-dark-gray -z-10" />

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md space-y-6 sm:space-y-8">
        {/* Back link */}
        <Link
          href="/login"
          className="text-iron-gray hover:text-iron-orange transition-colors text-sm inline-block"
        >
          ← Back to Login
        </Link>

        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-4 animate-slide-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-orange uppercase">
            Reset Password
          </h1>
          <p className="text-iron-gray text-xs sm:text-sm sm:text-base uppercase tracking-wider">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Form card */}
        <div className="bg-iron-dark-gray border-2 border-iron-gray p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs text-iron-gray uppercase tracking-widest font-semibold">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              {/* Error message */}
              {error && <AuthErrorMessage message={error} onDismiss={() => setError('')} />}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-base sm:text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-iron-black border-t-transparent animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center animate-fade-in">
              {/* Success icon */}
              <div className="w-16 h-16 mx-auto bg-iron-orange/20 border-2 border-iron-orange flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-iron-orange"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* Success message */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-iron-white uppercase tracking-wider">
                  EMAIL SENT
                </h2>
                <p className="text-iron-gray text-sm leading-relaxed">
                  We&apos;ve sent a password reset link to <strong className="text-iron-white">{email}</strong>.
                  Check your inbox and follow the instructions to reset your password.
                </p>
                <p className="text-iron-gray text-xs pt-2">
                  Didn&apos;t receive the email? Check your spam folder or try again in a few minutes.
                </p>
              </div>

              {/* Back to login button */}
              <Link
                href="/login"
                className="btn btn-secondary w-full text-base sm:text-lg inline-block"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>

        {/* Footer text */}
        <div className="text-center space-y-2">
          <p className="text-xs sm:text-sm text-iron-gray">
            Remember your password?{' '}
            <Link href="/login" className="text-iron-orange hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
