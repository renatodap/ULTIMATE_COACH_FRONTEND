/**
 * useActivitiesData Hook
 *
 * Custom hook for managing activities data fetching, view modes, timezone-aware grouping,
 * and wearable sync polling. Separates complex data management from UI rendering.
 *
 * @module hooks/useActivitiesData
 */

import { useState, useEffect, useCallback } from 'react'
import { getActivities, getDailySummary } from '@/lib/api/activities'
import { getWearableStatus } from '@/lib/api/wearables'
import type { Activity, DailySummary } from '@/lib/types/activities'
import { getTodayInTimezone, formatDateInTimezone } from '@/lib/utils/timezone'

export type ViewMode = 'day' | 'week' | 'recent'

export interface UseActivitiesDataOptions {
  /**
   * User's timezone for date calculations
   */
  timezone: string
  /**
   * Whether to skip initial data load
   */
  skip?: boolean
  /**
   * Whether to enable wearable sync polling
   */
  enablePolling?: boolean
  /**
   * Polling interval in milliseconds
   */
  pollingInterval?: number
  /**
   * Callback when activities are successfully loaded
   */
  onSuccess?: (data: { summary: DailySummary; activities: Activity[] }) => void
  /**
   * Callback when loading fails
   */
  onError?: (error: Error) => void
}

export interface UseActivitiesDataReturn {
  /** Daily or weekly summary */
  summary: DailySummary | null
  /** Activities grouped by date (YYYY-MM-DD) */
  activitiesByDate: Map<string, Activity[]>
  /** Loading state */
  loading: boolean
  /** Refresh loading state */
  refreshing: boolean
  /** Error message */
  error: string | null
  /** Current view mode */
  viewMode: ViewMode
  /** Selected date (YYYY-MM-DD) */
  selectedDate: string
  /** Whether wearable sync is in progress */
  syncInProgress: boolean
  /** Set view mode */
  setViewMode: (mode: ViewMode) => void
  /** Set selected date */
  setSelectedDate: (date: string) => void
  /** Refresh activities */
  refresh: () => Promise<void>
  /** Total activities count */
  totalActivities: number
}

/**
 * Calculate week range (Monday to Sunday) for a given date
 */
function getWeekRange(dateStr: string): { start: string; end: string } {
  // Parse date string as UTC to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  const dayOfWeek = d.getUTCDay() === 0 ? 7 : d.getUTCDay() // 1..7 (Mon..Sun)

  const start = new Date(d)
  start.setUTCDate(d.getUTCDate() - (dayOfWeek - 1))

  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)

  const toISODate = (dt: Date) => dt.toISOString().split('T')[0]
  return { start: toISODate(start), end: toISODate(end) }
}

/**
 * Build weekly summary from activities array
 */
function buildWeeklySummary(activities: Activity[], dailyGoal: number): DailySummary {
  const totalCalories = activities.reduce((sum, a) => sum + (a.calories_burned || 0), 0)
  const totalDuration = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0)
  const count = activities.length
  const avgIntensity = count > 0
    ? Number((activities.reduce((sum, a) => sum + (a.intensity_mets || 0), 0) / count).toFixed(1))
    : 0
  const weeklyGoal = dailyGoal * 7
  const goalPct = weeklyGoal > 0 ? Number(((totalCalories / weeklyGoal) * 100).toFixed(1)) : 0

  return {
    total_calories_burned: totalCalories,
    total_duration_minutes: totalDuration,
    average_intensity: avgIntensity,
    activity_count: count,
    daily_goal_calories: weeklyGoal,
    goal_percentage: goalPct
  }
}

/**
 * Hook to manage activities data, view modes, and wearable sync.
 *
 * @param options - Configuration options
 * @returns Activities data and state management functions
 *
 * @example
 * ```tsx
 * function ActivitiesPage() {
 *   const { timezone } = useTimezone()
 *   const {
 *     summary,
 *     activitiesByDate,
 *     loading,
 *     viewMode,
 *     setViewMode,
 *     refresh
 *   } = useActivitiesData({ timezone })
 *
 *   if (loading) return <LoadingScreen />
 *   return <ActivitiesList activities={activitiesByDate} />
 * }
 * ```
 */
export function useActivitiesData(
  options: UseActivitiesDataOptions
): UseActivitiesDataReturn {
  const {
    timezone,
    skip = false,
    enablePolling = true,
    pollingInterval = 10000, // 10 seconds
    onSuccess,
    onError
  } = options

  // View state with localStorage persistence
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('activitiesViewMode')
      if (saved === 'day' || saved === 'recent' || saved === 'week') return saved
    }
    return 'recent'
  })

  const [selectedDate, setSelectedDateState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('activitiesSelectedDate')
      if (saved) return saved
    }
    return getTodayInTimezone(timezone)
  })

  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [activitiesByDate, setActivitiesByDate] = useState<Map<string, Activity[]>>(new Map())
  const [loading, setLoading] = useState(!skip)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncInProgress, setSyncInProgress] = useState(false)

  /**
   * Persist view mode and selected date to localStorage
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('activitiesViewMode', viewMode)
      window.localStorage.setItem('activitiesSelectedDate', selectedDate)
    }
  }, [viewMode, selectedDate])

  /**
   * Wrapped setViewMode that persists to localStorage
   */
  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode)
  }, [])

  /**
   * Wrapped setSelectedDate that persists to localStorage
   */
  const setSelectedDate = useCallback((date: string) => {
    setSelectedDateState(date)
  }, [])

  /**
   * Load activities based on current view mode and selected date.
   */
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      // Set appropriate loading state
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Build parallel fetch requests based on view mode
      let summaryPromise: Promise<DailySummary>
      let activitiesPromise: Promise<{ activities: Activity[] }>

      if (viewMode === 'day') {
        // Day mode: fetch summary and activities for the selected date
        summaryPromise = getDailySummary({ target_date: selectedDate })
        activitiesPromise = getActivities({
          start_date: selectedDate,
          end_date: selectedDate,
          limit: 100
        })
      } else if (viewMode === 'week') {
        // Week mode: fetch day summary (for goal) and activities for the whole week
        const { start, end } = getWeekRange(selectedDate)
        summaryPromise = getDailySummary({ target_date: selectedDate })
        activitiesPromise = getActivities({
          start_date: start,
          end_date: end,
          limit: 100
        })
      } else {
        // Recent mode: overall summary (today) and recent activities (max 100 per backend constraint)
        summaryPromise = getDailySummary()
        activitiesPromise = getActivities({ limit: 100 })
      }

      // Fetch in parallel
      const [summaryData, activitiesResponse] = await Promise.all([
        summaryPromise,
        activitiesPromise
      ])

      // Group activities by date in user's timezone (CRITICAL: timezone-aware grouping)
      // Sort activities by start_time DESC (most recent first)
      const sortedActivities = [...activitiesResponse.activities].sort((a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      )

      const grouped = new Map<string, Activity[]>()
      sortedActivities.forEach((activity: Activity) => {
        // Convert UTC start_time to user's timezone date (YYYY-MM-DD)
        const date = formatDateInTimezone(activity.start_time, timezone)
        if (!grouped.has(date)) {
          grouped.set(date, [])
        }
        grouped.get(date)!.push(activity)
      })

      // Build weekly summary when in week mode
      let finalSummary: DailySummary
      if (viewMode === 'week') {
        finalSummary = buildWeeklySummary(
          activitiesResponse.activities,
          summaryData?.daily_goal_calories || 0
        )
      } else {
        finalSummary = summaryData
      }

      setSummary(finalSummary)
      setActivitiesByDate(grouped)

      // Fire success callback
      if (onSuccess) {
        onSuccess({
          summary: finalSummary,
          activities: activitiesResponse.activities
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to load activities'

      console.error('Activities data load error:', err)
      setError(errorMessage)

      // Fire error callback
      if (onError && err instanceof Error) {
        onError(err)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [viewMode, selectedDate, timezone, onSuccess, onError])

  /**
   * Refresh activities data (pull-to-refresh).
   */
  const refresh = useCallback(async () => {
    await loadData(true)
  }, [loadData])

  /**
   * Poll wearable sync status to auto-refresh when sync completes.
   * Lightweight polling that only refreshes when sync changes from running to complete.
   */
  useEffect(() => {
    if (!enablePolling) return

    let mounted = true
    let prevSyncRunning = false

    async function pollSync() {
      if (!mounted) return

      try {
        const status = await getWearableStatus()
        const job = status.latest_job

        if (job && job.status === 'running') {
          setSyncInProgress(true)
          prevSyncRunning = true
        } else if (prevSyncRunning && job && (job.status === 'success' || job.status === 'error')) {
          // Sync just completed - refresh activities
          setSyncInProgress(false)
          prevSyncRunning = false
          await loadData(true)
        } else {
          setSyncInProgress(false)
          prevSyncRunning = false
        }
      } catch (err) {
        // Polling errors are non-critical
        console.warn('Wearable sync polling error:', err)
      }
    }

    // Initial poll
    pollSync()

    // Set up interval
    const intervalId = setInterval(pollSync, pollingInterval)

    return () => {
      mounted = false
      clearInterval(intervalId)
    }
  }, [enablePolling, pollingInterval, loadData])

  /**
   * Load data when view mode or selected date changes.
   */
  useEffect(() => {
    if (!skip) {
      loadData()
    }
  }, [skip, loadData])

  return {
    summary,
    activitiesByDate,
    loading,
    refreshing,
    error,
    viewMode,
    selectedDate,
    syncInProgress,
    setViewMode,
    setSelectedDate,
    refresh,
    totalActivities: Array.from(activitiesByDate.values()).reduce((sum, arr) => sum + arr.length, 0)
  }
}
