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
import DailySummaryCard from '@/components/shared/DailySummaryCard'
import ActivityCard from '@/app/components/activities/ActivityCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { FAB } from '@/components/shared/FAB'
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import type { Activity, DailySummary } from '@/lib/types/activities'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

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

  // View mode: 'day' (default) or 'recent'
  const [viewMode, setViewMode] = useState<'day' | 'recent'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('activitiesViewMode')
      if (saved === 'day' || saved === 'recent') return saved
    }
    return 'day'
  })

  // Selected day for 'day' mode, default to today (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('activitiesSelectedDate')
      if (saved) return saved
    }
    return `${yyyy}-${mm}-${dd}`
  })

  const loadActivities = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      const fetches: Promise<any>[] = []

      if (viewMode === 'day') {
        // Day mode: fetch summary and activities for the selected date
        fetches.push(getDailySummary({ target_date: selectedDate }))
        fetches.push(getActivities({ start_date: selectedDate, end_date: selectedDate, limit: 100 }))
      } else {
        // Recent mode: overall summary (today) and recent activities
        fetches.push(getDailySummary())
        fetches.push(getActivities({ limit: 50 }))
      }

      const [summaryData, activitiesResponse] = await Promise.all(fetches)
      setSummary(summaryData)

      // Group activities by date (Recent: many dates, Day: single date)
      const grouped = new Map<string, Activity[]>()
      activitiesResponse.activities.forEach((activity: Activity) => {
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

  // Persist view mode and selected date
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('activitiesViewMode', viewMode)
      window.localStorage.setItem('activitiesSelectedDate', selectedDate)
    }
  }, [viewMode, selectedDate])

  useEffect(() => {
    loadActivities()
  }, [loadActivities, viewMode, selectedDate])

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

      {/* View toggle and date controls (mobile-first) */}
      <div className="sticky top-16 z-[6] bg-iron-black/95 backdrop-blur px-4 py-3 border-b border-iron-gray">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {/* Segmented control */}
          <div className="grid grid-cols-2 p-1 rounded-lg bg-iron-dark-gray border border-iron-gray overflow-hidden">
            <button
              className={`py-2 text-sm font-medium rounded-md transition ${
                viewMode === 'day' ? 'bg-iron-orange text-iron-white' : 'text-iron-white hover:bg-iron-gray/40'
              }`}
              onClick={() => setViewMode('day')}
            >
              {t('activities.today')}
            </button>
            <button
              className={`py-2 text-sm font-medium rounded-md transition ${
                viewMode === 'recent' ? 'bg-iron-orange text-iron-white' : 'text-iron-white hover:bg-iron-gray/40'
              }`}
              onClick={() => setViewMode('recent')}
            >
              {t('activities.recent') || 'Recent'}
            </button>
          </div>

          {/* Date chips (only in Day mode) */}
          {viewMode === 'day' && (
            <div className="flex items-center gap-2">
              {/* Yesterday */}
              <button
                className="px-3 py-2 rounded-full border border-iron-gray text-iron-white text-sm hover:border-iron-orange/60"
                onClick={() => {
                  const d = new Date(selectedDate)
                  d.setDate(d.getDate() - 1)
                  const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0')
                  setSelectedDate(`${yyyy}-${mm}-${dd}`)
                }}
                aria-label="Previous day"
              >
                <ChevronLeft className="w-4 h-4 inline mr-1" />
                {t('activities.yesterday')}
              </button>

              {/* Today */}
              <button
                className={`px-3 py-2 rounded-full text-sm border ${
                  selectedDate === new Date().toISOString().split('T')[0]
                    ? 'border-iron-orange bg-iron-orange/10 text-iron-white'
                    : 'border-iron-gray text-iron-white hover:border-iron-orange/60'
                }`}
                onClick={() => {
                  const d = new Date(); const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0')
                  setSelectedDate(`${yyyy}-${mm}-${dd}`)
                }}
              >
                {t('activities.today')}
              </button>

              {/* Tomorrow */}
              <button
                className="px-3 py-2 rounded-full border border-iron-gray text-iron-white text-sm hover:border-iron-orange/60"
                onClick={() => {
                  const d = new Date(selectedDate)
                  d.setDate(d.getDate() + 1)
                  const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0')
                  setSelectedDate(`${yyyy}-${mm}-${dd}`)
                }}
                aria-label="Next day"
              >
                {t('activities.tomorrow') || 'Tomorrow'}
                <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>

              {/* Date picker */}
              <div className="ml-auto">
                <label className="sr-only" htmlFor="activity-date">Select date</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-iron-white/70" />
                  <input
                    id="activity-date"
                    type="date"
                    className="bg-iron-dark-gray border border-iron-gray rounded-lg px-3 py-2 text-iron-white text-sm focus:outline-none focus:border-iron-orange"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4">
            <p className="text-red-500 text-sm uppercase tracking-wider">{error}</p>
          </div>
        )}

        {/* Daily Summary - always show in Day mode; show when hasActivities in Recent */}
        {summary && ((viewMode === 'day') || (viewMode === 'recent' && hasActivities)) && (
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
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
