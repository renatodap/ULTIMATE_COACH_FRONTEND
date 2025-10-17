/**
 * Activities Page - Main daily activities dashboard
 *
 * Shows:
 * - Daily summary with progress toward calorie burn goal
 * - List of activities grouped by date
 * - Edit/delete functionality
 */

'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useTranslation } from '@/lib/i18n'
import { deleteActivity } from '@/lib/api/activities'
import { useActivitiesData } from '@/lib/hooks/useActivitiesData'
import DailySummaryCard from '@/components/shared/DailySummaryCard'
import ActivityCard from '@/app/components/activities/ActivityCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { FAB } from '@/components/shared/FAB'
import { BottomNav } from '@/components/BottomNav'
import { StickyMiniSummary } from '@/components/shared/StickyMiniSummary'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { useTimezone } from '@/lib/context/TimezoneContext'
import { formatRelativeDate } from '@/lib/utils/timezone'

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
  const { timezone } = useTimezone()

  // Use the new activities data hook
  const {
    summary,
    activitiesByDate,
    loading,
    refreshing,
    error,
    syncInProgress,
    refresh,
    totalActivities
  } = useActivitiesData({ timezone })

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
      await refresh()
    } catch (err) {
      console.error('Failed to delete activity:', err)
      toast.error('Failed to delete activity', { id: toastId })
    }
  }

  const handleRefresh = () => {
    refresh()
    toast.success('Activities refreshed!')
  }

  // Format date header with timezone awareness (Today, Yesterday, or date)
  const formatDateHeader = (dateStr: string) => {
    // Use timezone-aware relative date formatting
    const relativeDateStr = formatRelativeDate(dateStr, timezone)

    // Translate "Today" and "Yesterday"
    if (relativeDateStr === 'Today') {
      return t('activities.today')
    } else if (relativeDateStr === 'Yesterday') {
      return t('activities.yesterday')
    } else {
      return relativeDateStr
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
    <div className="min-h-screen bg-iron-black pb-40">
      {/* Header - NEW CONSISTENT DESIGN */}
      <PageHeader
        title={t('activities.pageTitle')}
        showRefresh={true}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Sync notification */}
      {syncInProgress && (
        <div className="sticky top-16 z-[6] bg-iron-black px-4 py-3 border-b border-iron-gray">
          <div className="max-w-4xl mx-auto">
            <div className="w-full bg-iron-orange/10 border border-iron-orange/40 text-iron-white text-sm px-3 py-2">
              Sync in progress… Your wearable activities will appear shortly.
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mini Summary - Always visible */}
      {summary && (
        <StickyMiniSummary
          type="activity"
          totalCalories={summary.total_calories_burned}
          calorieGoal={summary.daily_goal_calories}
          totalDuration={summary.total_duration_minutes}
          activityCount={totalActivities}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4">
            <p className="text-red-500 text-sm uppercase tracking-wider">{error}</p>
          </div>
        )}

        {/* Summary: Display when available */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DailySummaryCard type="activity" summary={summary} />
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
                  <div className="sticky top-28 z-[5] bg-iron-black py-2 px-1 border-b border-iron-gray mb-4">
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
        positioning="high"
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
