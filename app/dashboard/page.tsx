'use client'

/**
 * Dashboard Page - DISABLED FOR WEEK 1 MVP
 *
 * Week 1 ruthless scope cut: Redirecting to /coach
 * This page will be re-enabled in future weeks when we implement
 * the full dashboard with smart actions and insights.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/shared/LoadingScreen'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/coach')
  }, [router])

  return <LoadingScreen message="Redirecting to Coach..." />
}
