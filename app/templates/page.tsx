'use client'

/**
 * Templates Page - DISABLED FOR WEEK 1 MVP
 *
 * Week 1 ruthless scope cut: Redirecting to /coach
 * Templates will be accessible through coach chat in future weeks.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/shared/LoadingScreen'

export default function TemplatesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/coach')
  }, [router])

  return <LoadingScreen message="Redirecting to Coach..." />
}
