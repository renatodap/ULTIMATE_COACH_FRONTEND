'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/api/users'
import { ErrorLogger, ErrorCategory, ErrorSeverity } from '@/lib/logging/ErrorLogger'

/**
 * Auth Callback Handler
 *
 * Handles email verification redirects from Supabase.
 *
 * Flow:
 * 1. User clicks verification link in email
 * 2. Supabase redirects to this page with auth tokens in URL
 * 3. This page exchanges tokens for session
 * 4. Redirects to /onboarding or /dashboard
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract token from URL hash (Supabase uses #access_token=...)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        // Also check URL query params (Supabase may use different formats)
        const queryAccessToken = searchParams?.get('access_token')
        const queryRefreshToken = searchParams?.get('refresh_token')
        const errorParam = searchParams?.get('error')
        const errorDescription = searchParams?.get('error_description')

        // Handle errors from Supabase
        if (errorParam) {
          ErrorLogger.log({
            category: ErrorCategory.AUTH,
            severity: ErrorSeverity.ERROR,
            message: 'Email verification callback error',
            error: new Error(errorDescription || errorParam)
          })
          setError(errorDescription || 'Email verification failed. Please try again.')
          // Redirect to login after 3 seconds
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        const finalAccessToken = accessToken || queryAccessToken
        const finalRefreshToken = refreshToken || queryRefreshToken

        // If no tokens found, try to exchange auth code
        if (!finalAccessToken && !finalRefreshToken) {
          const code = searchParams?.get('code')

          if (code) {
            // Exchange auth code for session
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

            if (exchangeError) {
              throw exchangeError
            }

            if (data.session) {
              ErrorLogger.log({
                category: ErrorCategory.AUTH,
                severity: ErrorSeverity.INFO,
                message: 'Email verification successful (code exchange)',
                userId: data.user?.id,
                userEmail: data.user?.email
              })

              // Get user profile to check onboarding status
              const user = await getCurrentUser()

              // Redirect based on onboarding status
              if (!user.onboarding_completed) {
                window.location.href = '/onboarding'
              } else {
                window.location.href = '/dashboard'
              }
              return
            }
          }

          // No tokens or code - invalid callback
          throw new Error('No authentication tokens or code found in callback URL')
        }

        // Set session with tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: finalAccessToken!,
          refresh_token: finalRefreshToken!,
        })

        if (sessionError) {
          throw sessionError
        }

        ErrorLogger.log({
          category: ErrorCategory.AUTH,
          severity: ErrorSeverity.INFO,
          message: 'Email verification successful',
          userId: data.user?.id,
          userEmail: data.user?.email
        })

        // Get user profile to check onboarding status
        const user = await getCurrentUser()

        // Redirect based on onboarding status
        if (!user.onboarding_completed) {
          window.location.href = '/onboarding'
        } else {
          window.location.href = '/dashboard'
        }

      } catch (err: any) {
        ErrorLogger.log({
          category: ErrorCategory.AUTH,
          severity: ErrorSeverity.ERROR,
          message: 'Failed to process email verification callback',
          error: err
        })

        console.error('Auth callback error:', err)
        setError('Failed to verify your email. Please try logging in.')

        // Redirect to login after 3 seconds
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-iron-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {error ? (
          <>
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-iron-white mb-4">
              Verification Failed
            </h1>
            <p className="text-iron-gray mb-6">{error}</p>
            <p className="text-sm text-iron-gray">
              Redirecting to login page...
            </p>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-iron-orange"></div>
            </div>
            <h1 className="text-2xl font-bold text-iron-white mb-4">
              Verifying your email...
            </h1>
            <p className="text-iron-gray">
              Please wait while we confirm your account.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
