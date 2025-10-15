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
import { getWearableStatus, triggerWearableSync } from '@/lib/api/wearables'
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
  const [syncInProgress, setSyncInProgress] = useState(false)

  // View mode: 'day' (default) or 'recent'
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'recent'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('activitiesViewMode')
      if (saved === 'day' || saved === 'recent' || saved === 'week') return saved
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

  const getWeekRange = (dateStr: string) => {
    const d = new Date(dateStr)
    // Start on Monday
    const day = d.getDay() === 0 ? 7 : d.getDay() // 1..7 (Mon..Sun)
    const start = new Date(d)
    start.setDate(d.getDate() - (day - 1))
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const toISODate = (dt: Date) => dt.toISOString().split('T')[0]
    return { start: toISODate(start), end: toISODate(end) }
  }

  const [weeklySummary, setWeeklySummary] = useState<DailySummary | null>(null)

  // Helpers to format labels for mobile
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

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
      } else if (viewMode === 'week') {
        // Week mode: fetch day summary (to get goal) and activities for the whole week
        const { start, end } = getWeekRange(selectedDate)
        fetches.push(getDailySummary({ target_date: selectedDate }))
        // Backend caps limit at 100; week range should comfortably fit under this cap
        fetches.push(getActivities({ start_date: start, end_date: end, limit: 100 }))
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

      // Build weekly summary when in week mode
      if (viewMode === 'week') {
        const all: Activity[] = activitiesResponse.activities || []
        const totalCalories = all.reduce((s, a) => s + (a.calories_burned || 0), 0)
        const totalDuration = all.reduce((s, a) => s + (a.duration_minutes || 0), 0)
        const count = all.length
        const avgIntensity = count > 0 ? Number((all.reduce((s, a) => s + (a.intensity_mets || 0), 0) / count).toFixed(1)) : 0
        const dailyGoal = summaryData?.daily_goal_calories || 0
        const weeklyGoal = dailyGoal * 7
        const goalPct = weeklyGoal > 0 ? Number(((totalCalories / weeklyGoal) * 100).toFixed(1)) : 0
        setWeeklySummary({
          total_calories_burned: totalCalories,
          total_duration_minutes: totalDuration,
          average_intensity: avgIntensity,
          activity_count: count,
          daily_goal_calories: weeklyGoal, // repurpose as weekly goal for card
          goal_percentage: goalPct,
        })
      } else {
        setWeeklySummary(null)
      }

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
  }, [t, selectedDate, viewMode])

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

  // Lightweight polling for wearable sync jobs to auto-refresh page when done
  useEffect(() => {
    async function poll() {
      try {
        const status = await getWearableStatus()
        const job = status.latest_job
        if (job && job.status === 'running') {
          setSyncInProgress(true)
        } else if (syncInProgress && job && (job.status === 'success' || job.status === 'error')) {
          setSyncInProgress(false)
          await loadActivities(true)
        } else {
          setSyncInProgress(false)
        }
      } catch {}
    }
    poll()
    const intervalId = setInterval(poll, 10000)
    return () => clearInterval(intervalId)
  }, [syncInProgress, loadActivities])

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
          {syncInProgress && (
            <div className="w-full bg-iron-orange/10 border border-iron-orange/40 text-iron-white text-sm px-3 py-2 rounded-md">
              Sync in progress… Your wearable activities will appear shortly.
            </div>
          )}
          {/* Segmented control: short labels, mobile-friendly */}
          <div className="flex items-center gap-2 p-1 rounded-lg bg-iron-dark-gray border border-iron-gray overflow-hidden">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                viewMode === 'day' ? 'bg-iron-orange text-iron-white' : 'text-iron-white hover:bg-iron-gray/40'
              }`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                viewMode === 'week' ? 'bg-iron-orange text-iron-white' : 'text-iron-white hover:bg-iron-gray/40'
              }`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                viewMode === 'recent' ? 'bg-iron-orange text-iron-white' : 'text-iron-white hover:bg-iron-gray/40'
              }`}
              onClick={() => setViewMode('recent')}
            >
              Recent
            </button>
          </div>

          {/* Date controls (compact, icon-first) */}
          {(viewMode === 'day' || viewMode === 'week') && (
            <div className="flex items-center gap-2">
              {/* Previous */}
              <button
                className="p-2 rounded-full border border-iron-gray text-iron-white hover:border-iron-orange/60"
                onClick={() => {
                  const d = new Date(selectedDate)
                  d.setDate(d.getDate() - (viewMode === 'week' ? 7 : 1))
                  const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0')
                  setSelectedDate(`${yyyy}-${mm}-${dd}`)
                }}
                aria-label={viewMode === 'week' ? 'Previous week' : 'Previous day'}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Label */}
              <div className="flex-1 text-center text-sm text-iron-white">
                {viewMode === 'day' && (
                  <span>{formatShortDate(selectedDate)}</span>
                )}
                {viewMode === 'week' && (() => {
                  const { start, end } = getWeekRange(selectedDate)
                  const startText = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  const endText = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  return <span>{`${startText} – ${endText}`}</span>
                })()}
              </div>

              {/* Next */}
              <button
                className="p-2 rounded-full border border-iron-gray text-iron-white hover:border-iron-orange/60"
                onClick={() => {
                  const d = new Date(selectedDate)
                  d.setDate(d.getDate() + (viewMode === 'week' ? 7 : 1))
                  const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0')
                  setSelectedDate(`${yyyy}-${mm}-${dd}`)
                }}
                aria-label={viewMode === 'week' ? 'Next week' : 'Next day'}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Date picker (icon + input) */}
              <div className="ml-1">
                <label className="sr-only" htmlFor="activity-date">Select date</label>
                <div className="flex items-center gap-1">
                  <Calendar className="w-5 h-5 text-iron-white/70" />
                  <input
                    id="activity-date"
                    type="date"
                    className="bg-iron-dark-gray border border-iron-gray rounded-lg px-2 py-1 text-iron-white text-sm focus:outline-none focus:border-iron-orange"
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

        {/* Summary: Day uses summary; Week uses computed weeklySummary; Recent uses summary only when has activities */}
        {((viewMode === 'day' && summary) || (viewMode === 'week' && weeklySummary) || (viewMode === 'recent' && hasActivities && summary)) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'week' ? (
              <DailySummaryCard type="activity" summary={weeklySummary as DailySummary} />
            ) : (
              <DailySummaryCard type="activity" summary={summary as DailySummary} />
            )}
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
