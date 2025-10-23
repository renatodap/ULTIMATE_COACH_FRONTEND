'use client'

/**
 * Weight Tracking Page - DISABLED FOR WEEK 1 MVP
 *
 * Week 1 ruthless scope cut: Redirecting to /coach
 * Weight logging will be re-implemented as chat-based logging in Week 5.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/shared/LoadingScreen'

export default function WeightPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/coach')
  }, [router])

  return <LoadingScreen message="Redirecting to Coach..." />
}
