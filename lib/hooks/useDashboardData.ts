/**
 * useDashboardData Hook
 *
 * Custom hook for managing dashboard data fetching, loading states, and refresh logic.
 * Separates data fetching concerns from UI rendering.
 *
 * @module hooks/useDashboardData
 */

import { useState, useEffect, useCallback } from 'react'
import { getDashboardSummary } from '@/lib/api/dashboard'
import { getFullUserProfile } from '@/lib/api/profile'
import type { DashboardSummary } from '@/lib/types/dashboard'

export interface UseDashboardDataOptions {
  /**
   * Whether to skip initial data load (useful for testing)
   */
  skip?: boolean
  /**
   * Callback fired when data is successfully loaded
   */
  onSuccess?: (data: DashboardSummary) => void
  /**
   * Callback fired when data loading fails
   */
  onError?: (error: Error) => void
}

export interface UseDashboardDataReturn {
  /** Dashboard summary data */
  data: DashboardSummary | null
  /** Initial loading state */
  loading: boolean
  /** Refresh loading state (pull-to-refresh) */
  refreshing: boolean
  /** Error message if load failed */
  error: string | null
  /** User's unit system preference */
  unitSystem: 'metric' | 'imperial'
  /** Whether user has completed consultation */
  consultationCompleted: boolean
  /** Function to refresh dashboard data */
  refresh: () => Promise<void>
  /** Function to manually trigger data load */
  load: () => Promise<void>
}

/**
 * Hook to manage dashboard data fetching and state.
 *
 * @param options - Configuration options
 * @returns Dashboard data and state management functions
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const {
 *     data,
 *     loading,
 *     refreshing,
 *     error,
 *     unitSystem,
 *     refresh
 *   } = useDashboardData()
 *
 *   if (loading) return <LoadingScreen />
 *   if (error) return <ErrorView error={error} />
 *
 *   return <DashboardContent data={data} onRefresh={refresh} />
 * }
 * ```
 */
export function useDashboardData(
  options: UseDashboardDataOptions = {}
): UseDashboardDataReturn {
  const { skip = false, onSuccess, onError } = options

  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(!skip)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric')
  const [consultationCompleted, setConsultationCompleted] = useState(false)

  /**
   * Load dashboard data from API.
   * Handles both initial load and refresh scenarios.
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

      // Fetch dashboard summary
      const dashboardData = await getDashboardSummary()
      setData(dashboardData)

      // Fire success callback
      if (onSuccess) {
        onSuccess(dashboardData)
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to load dashboard. Please try again.'

      console.error('Dashboard data load error:', err)
      setError(errorMessage)

      // Fire error callback
      if (onError && err instanceof Error) {
        onError(err)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [onSuccess, onError])

  /**
   * Load user profile data (unit system, consultation status).
   * Runs separately to avoid blocking dashboard data load.
   */
  const loadProfile = useCallback(async () => {
    try {
      const profile = await getFullUserProfile()
      setUnitSystem((profile.unit_system as 'metric' | 'imperial') || 'metric')
      setConsultationCompleted(profile.consultation_completed || false)
    } catch (err) {
      // Profile load failure is non-critical - use defaults
      console.warn('Failed to load user profile:', err)
    }
  }, [])

  /**
   * Refresh dashboard data (pull-to-refresh).
   * Sets refreshing state instead of loading state.
   */
  const refresh = useCallback(async () => {
    await loadData(true)
  }, [loadData])

  /**
   * Manually trigger data load.
   * Useful for retry scenarios.
   */
  const load = useCallback(async () => {
    await loadData(false)
  }, [loadData])

  /**
   * Load data on mount unless skip option is true.
   */
  useEffect(() => {
    if (!skip) {
      // Load profile and dashboard data in parallel
      Promise.all([
        loadProfile(),
        loadData()
      ])
    }
  }, [skip, loadData, loadProfile])

  return {
    data,
    loading,
    refreshing,
    error,
    unitSystem,
    consultationCompleted,
    refresh,
    load
  }
}
