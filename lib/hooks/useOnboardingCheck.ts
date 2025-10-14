/**
 * Onboarding Check Hook
 *
 * Redirects to /onboarding if user hasn't completed it
 * Redirects to / (landing) if user is not authenticated (401)
 * Use in dashboard and protected pages
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/api/users'
import { ApiRequestError } from '@/lib/api/client'

export function useOnboardingCheck() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const user = await getCurrentUser()

        if (!user.onboarding_completed) {
          router.push('/onboarding')
        } else {
          setOnboardingComplete(true)
        }
      } catch (error) {
        // Check if it's a 401 error (unauthorized/session expired)
        if (error instanceof ApiRequestError && error.status === 401) {
          console.warn('[Auth] Session expired or invalid. Redirecting to login...')
          // Note: Global 401 handler in API client will also trigger
          // But we add this as a backup in case the redirect didn't happen
          router.push('/')
        } else {
          // Other errors (network, etc.) - log but don't redirect
          console.error('Failed to check onboarding status:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    checkOnboarding()
  }, [router])

  return { loading, onboardingComplete }
}
