'use client'

/**
 * Profile Page - DISABLED FOR WEEK 1 MVP
 *
 * Week 1 ruthless scope cut: Redirecting to /settings
 * Full profile view will be accessible through coach chat in future weeks.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/shared/LoadingScreen'

export default function ProfilePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/settings')
  }, [router])

  return <LoadingScreen message="Redirecting to Settings..." />
}
