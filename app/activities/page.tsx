'use client'

/**
 * Activities Dashboard Page
 *
 * Displays user's logged activities with daily summary and grouping by date.
 * Features: View activities, delete with undo, navigate to log page
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, isToday, isYesterday, startOfDay, endOfDay } from 'date-fns'
import { getActivities, getDailySummary, deleteActivity } from '@/lib/api/activities'
import type { Activity, DailySummary, ActivityListResponse } from '@/lib/types/activities'
import ActivityCard from '@/app/components/activities/ActivityCard'
import EmptyState from '@/app/components/activities/EmptyState'
import { BottomNav } from '@/components/BottomNav'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ActivitiesPage() {
  const router = useRouter()

  // State
  const [activities, setActivities] = useState<Activity[]>([])
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Delete state (with undo support)
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null)
  const [undoState, setUndoState] = useState<{ activity: Activity; timeoutId: NodeJS.Timeout } | null>(null)

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [selectedDate])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      const dateStr = format(selectedDate, 'yyyy-MM-dd')

      // Fetch activities and summary in parallel
      const [activitiesData, summaryData] = await Promise.all([
        getActivities({
          start_date: dateStr,
          end_date: dateStr,
          limit: 100
        }),
        getDailySummary({ target_date: dateStr })
      ])

      setActivities(activitiesData.activities)
      setSummary(summaryData)
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      setError('Failed to load activities. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Date navigation
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  // Delete activity with undo
  const handleDelete = async (activityId: string) => {
    // Cancel any existing undo timeout
    if (undoState) {
      clearTimeout(undoState.timeoutId)
      setUndoState(null)
    }

    // Find activity to delete
    const activity = activities.find(a => a.id === activityId)
    if (!activity) return

    // Optimistic update - remove from UI
    setActivities(prev => prev.filter(a => a.id !== activityId))
    setDeletingActivityId(activityId)

    // Set up undo window (10 seconds)
    const timeoutId = setTimeout(async () => {
      // Actually delete after 10 seconds
      try {
        await deleteActivity(activityId)
        setDeletingActivityId(null)
        setUndoState(null)

        // Refresh summary after actual delete
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const summaryData = await getDailySummary({ target_date: dateStr })
        setSummary(summaryData)
      } catch (err) {
        console.error('Failed to delete activity:', err)
        // Restore on error
        setActivities(prev => [...prev, activity])
        setError('Failed to delete activity')
        setDeletingActivityId(null)
        setUndoState(null)
      }
    }, 10000)

    setUndoState({ activity, timeoutId })
  }

  // Undo delete
  const handleUndo = () => {
    if (!undoState) return

    clearTimeout(undoState.timeoutId)
    setActivities(prev => [...prev, undoState.activity].sort((a, b) =>
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    ))
    setDeletingActivityId(null)
    setUndoState(null)
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const activityDate = new Date(activity.start_time)
    let dateKey: string

    if (isToday(activityDate)) {
      dateKey = 'Today'
    } else if (isYesterday(activityDate)) {
      dateKey = 'Yesterday'
    } else {
      dateKey = format(activityDate, 'MMMM d, yyyy')
    }

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(activity)

    return groups
  }, {} as Record<string, Activity[]>)

  // Format date display
  const getDateDisplay = () => {
    if (isToday(selectedDate)) return 'Today'
    if (isYesterday(selectedDate)) return 'Yesterday'
    return format(selectedDate, 'MMMM d, yyyy')
  }

  const isViewingToday = isToday(selectedDate)

  return (
    <div className="min-h-screen bg-iron-black text-iron-white pb-40">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-iron-black/95 backdrop-blur-sm border-b border-iron-gray/20">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Activities</h1>
        </div>

        {/* Date selector */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-iron-dark-gray rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold">{getDateDisplay()}</span>
            {!isViewingToday && (
              <button
                onClick={goToToday}
                className="text-sm text-iron-orange hover:underline"
              >
                Back to Today
              </button>
            )}
          </div>

          <button
            onClick={goToNextDay}
            disabled={isViewingToday}
            className="p-2 hover:bg-iron-dark-gray rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Daily Summary */}
      {summary && summary.activity_count > 0 && (
        <div className="px-4 py-4">
          <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray/30">
            <h2 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-4">
              Daily Summary
            </h2>

            {/* Calories Progress */}
            <div className="mb-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-bold text-iron-white">
                  {summary.total_calories_burned}
                </span>
                <span className="text-sm text-iron-gray">
                  / {summary.daily_goal_calories} cal goal
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-iron-black rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    summary.goal_percentage >= 100 ? 'bg-green-500' : 'bg-iron-orange'
                  }`}
                  style={{ width: `${Math.min(summary.goal_percentage, 100)}%` }}
                />
              </div>

              <p className="text-sm text-iron-gray mt-1">
                {summary.goal_percentage >= 100
                  ? `${Math.round(summary.goal_percentage - 100)}% over goal`
                  : `${Math.round(100 - summary.goal_percentage)}% remaining`}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-iron-gray mb-1">Duration</p>
                <p className="text-lg font-semibold text-iron-white">
                  {summary.total_duration_minutes} min
                </p>
              </div>
              <div>
                <p className="text-xs text-iron-gray mb-1">Avg Intensity</p>
                <p className="text-lg font-semibold text-iron-white">
                  {summary.average_intensity.toFixed(1)} METs
                </p>
              </div>
              <div>
                <p className="text-xs text-iron-gray mb-1">Activities</p>
                <p className="text-lg font-semibold text-iron-white">
                  {summary.activity_count}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iron-orange" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-sm text-iron-orange hover:underline"
            >
              Try again
            </button>
          </div>
        ) : activities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date}>
                {/* Date header */}
                <h3 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-3 sticky top-[140px] bg-iron-black py-2 z-5">
                  {date}
                </h3>

                {/* Activity cards */}
                <div className="space-y-3">
                  {dateActivities.map(activity => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onEdit={(id) => router.push(`/activities/edit/${id}`)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Undo Toast */}
      {undoState && (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between bg-iron-dark-gray border border-iron-gray rounded-lg p-4 shadow-lg animate-slide-up">
          <p className="text-sm text-iron-white">Activity deleted</p>
          <button
            onClick={handleUndo}
            className="text-sm font-medium text-iron-orange hover:underline"
          >
            Undo
          </button>
        </div>
      )}

      {/* FAB - Log Activity */}
      <button
        onClick={() => router.push('/activities/log')}
        className="fixed bottom-32 right-6 z-50 w-14 h-14 bg-iron-orange text-iron-black rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
      >
        <span className="text-2xl font-light">+</span>
      </button>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
