'use client'

/**
 * Error Boundary Component
 *
 * Catches React errors in child components and displays a fallback UI
 * Prevents the entire app from crashing when an error occurs
 */

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // You can also log the error to an error reporting service
    // e.g., Sentry, LogRocket, etc.
    this.setState({ error, errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
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
                An unexpected error occurred. Don&apos;t worry, you can try again.
              </p>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="card-glass p-4 border-2 border-iron-orange/30">
                <h3 className="text-xs text-iron-gray uppercase tracking-wider mb-2">
                  Error Details (Development Mode)
                </h3>
                <pre className="text-xs text-iron-orange overflow-auto max-h-40 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={this.handleReset}
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

    return this.props.children
  }
}

export default ErrorBoundary
