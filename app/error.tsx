'use client'

/**
 * Global Error Page for Next.js App Router
 *
 * This catches errors in the entire app and displays a fallback UI
 */

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error page:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-iron-black">
      <div className="max-w-md w-full space-y-8">
        {/* Error Icon */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-iron-orange/10 border-2 border-iron-orange mb-4">
            <svg
              className="w-10 h-10 text-iron-orange"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-iron-white mb-2">
            SOMETHING WENT WRONG
          </h1>
          <p className="text-iron-gray text-sm">
            An unexpected error occurred. Don't worry, you can try again.
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="card-glass p-4 border-2 border-iron-orange/30">
            <h3 className="text-xs text-iron-gray uppercase tracking-wider mb-2">
              Error Details (Development Mode)
            </h3>
            <pre className="text-xs text-iron-orange overflow-auto max-h-40 whitespace-pre-wrap">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-primary w-full"
          >
            TRY AGAIN
          </button>
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="btn btn-secondary w-full"
          >
            GO TO HOME
          </button>
        </div>

        {/* Support Link */}
        <div className="text-center">
          <p className="text-xs text-iron-gray">
            Problem persists?{' '}
            <a
              href="mailto:support@ultimatecoach.app"
              className="text-iron-orange hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
