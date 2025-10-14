/**
 * Activities Page - Main daily activities dashboard
 *
 * Shows:
 * - Daily summary with progress toward calorie burn goal
 * - List of activities grouped by date
 * - Edit/delete functionality
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useTranslation } from '@/lib/i18n'
import { getActivities, getDailySummary, deleteActivity } from '@/lib/api/activities'
import DailySummaryCard from '@/app/components/activities/DailySummaryCard'
import ActivityCard from '@/app/components/activities/ActivityCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { FAB } from '@/components/shared/FAB'
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import type { Activity, DailySummary } from '@/lib/types/activities'

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const emptyStateVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
}

export default function ActivitiesPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [activitiesByDate, setActivitiesByDate] = useState<Map<string, Activity[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadActivities = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Parallel fetch for better performance
      const [summaryData, activitiesResponse] = await Promise.all([
        getDailySummary(),
        getActivities({ limit: 50 })
      ])

      setSummary(summaryData)

      // Group activities by date
      const grouped = new Map<string, Activity[]>()
      activitiesResponse.activities.forEach(activity => {
        const date = new Date(activity.start_time).toISOString().split('T')[0]
        if (!grouped.has(date)) {
          grouped.set(date, [])
        }
        grouped.get(date)!.push(activity)
      })

      setActivitiesByDate(grouped)

      if (isRefresh) {
        toast.success('Activities refreshed!')
      }
    } catch (err) {
      console.error('Failed to load activities:', err)
      setError(t('activities.failedToLoad'))
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  const handleEdit = (id: string) => {
    // TODO: Implement edit functionality
    router.push(`/activities/${id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('activities.deleteActivityConfirm'))) return

    const toastId = toast.loading('Deleting activity...')

    try {
      await deleteActivity(id)
      toast.success('Activity deleted!', { id: toastId })
      // Refresh activities list
      await loadActivities()
    } catch (err) {
      console.error('Failed to delete activity:', err)
      toast.error('Failed to delete activity', { id: toastId })
    }
  }

  const handleRefresh = () => {
    loadActivities(true)
  }

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return t('activities.today')
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('activities.yesterday')
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  if (loading) {
    return (
      <>
        <LoadingScreen message={t('activities.loadingActivities')} showBottomNav />
        <BottomNav />
      </>
    )
  }

  const hasActivities = activitiesByDate.size > 0

  return (
    <div className="min-h-screen bg-iron-black pb-20">
      {/* Header - NEW CONSISTENT DESIGN */}
      <PageHeader
        title={t('activities.pageTitle')}
        showRefresh={true}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4">
            <p className="text-red-500 text-sm uppercase tracking-wider">{error}</p>
          </div>
        )}

        {/* Daily Summary */}
        {summary && hasActivities && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DailySummaryCard summary={summary} />
          </motion.div>
        )}

        {/* Activities List */}
        {!hasActivities ? (
          <EmptyState
            icon="💪"
            title="No Activities Yet"
            subtitle="Track your workouts to see your progress and hit your calorie goals"
            actionLabel="Log Your First Activity"
            onAction={() => router.push('/activities/log')}
          />
        ) : (
          <motion.div
            className="space-y-6"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {Array.from(activitiesByDate.entries())
              .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) // Sort by date desc
              .map(([date, activities]) => (
                <motion.div key={date} variants={cardVariants}>
                  {/* Date Separator */}
                  <div className="sticky top-16 z-[5] bg-iron-black py-2 px-1 border-b border-iron-gray mb-4">
                    <h3 className="text-sm font-medium text-iron-white">
                      {formatDateHeader(date)}
                    </h3>
                  </div>

                  {/* Activities for this date */}
                  <div className="space-y-4">
                    {activities.map(activity => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </div>

      {/* FAB - Floating Action Button */}
      <FAB
        href="/activities/log"
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
