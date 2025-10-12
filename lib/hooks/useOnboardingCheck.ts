/**
 * Onboarding Check Hook
 *
 * Redirects to /onboarding if user hasn't completed it
 * Use in dashboard and protected pages
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/api/users'

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
        // User not authenticated - middleware will handle redirect
        console.error('Failed to check onboarding status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkOnboarding()
  }, [router])

  return { loading, onboardingComplete }
}
