/**
 * useNutritionData Hook
 *
 * Custom hook for managing nutrition data fetching, date selection, and timezone-aware filtering.
 * Separates complex data management from UI rendering.
 *
 * @module hooks/useNutritionData
 */

import { useState, useEffect, useCallback } from 'react'
import { getDailyNutrition, deleteMeal } from '@/lib/api/nutrition'
import { transformDailyNutrition } from '@/lib/utils/nutrition-transformer'
import type { DailyNutrition } from '@/lib/types/nutrition'
import { getTodayInTimezone } from '@/lib/utils/timezone'

export interface UseNutritionDataOptions {
  /**
   * User's timezone for date calculations
   */
  timezone: string
  /**
   * Initial selected date (YYYY-MM-DD)
   */
  initialDate?: string
  /**
   * Whether to skip initial data load
   */
  skip?: boolean
  /**
   * Callback when data is successfully loaded
   */
  onSuccess?: (data: DailyNutrition) => void
  /**
   * Callback when loading fails
   */
  onError?: (error: Error) => void
  /**
   * Callback when meal is successfully deleted
   */
  onMealDeleted?: () => void
}

export interface UseNutritionDataReturn {
  /** Daily nutrition data (stats + meals) */
  data: DailyNutrition | null
  /** Initial loading state */
  loading: boolean
  /** Refresh loading state */
  refreshing: boolean
  /** Error message */
  error: string | null
  /** Currently selected date (YYYY-MM-DD) */
  selectedDate: string
  /** Set selected date */
  setSelectedDate: (date: string) => void
  /** Refresh nutrition data */
  refresh: () => Promise<void>
  /** Delete a meal and refresh */
  deleteMealAndRefresh: (mealId: string) => Promise<void>
  /** Total meals count */
  totalMeals: number
}

/**
 * Hook to manage nutrition data fetching and state.
 *
 * @param options - Configuration options
 * @returns Nutrition data and state management functions
 *
 * @example
 * ```tsx
 * function NutritionPage() {
 *   const { timezone } = useTimezone()
 *   const {
 *     data,
 *     loading,
 *     selectedDate,
 *     setSelectedDate,
 *     refresh,
 *     deleteMealAndRefresh
 *   } = useNutritionData({ timezone })
 *
 *   if (loading) return <LoadingScreen />
 *   return <NutritionView data={data} onDelete={deleteMealAndRefresh} />
 * }
 * ```
 */
export function useNutritionData(
  options: UseNutritionDataOptions
): UseNutritionDataReturn {
  const {
    timezone,
    initialDate,
    skip = false,
    onSuccess,
    onError,
    onMealDeleted
  } = options

  const [data, setData] = useState<DailyNutrition | null>(null)
  const [loading, setLoading] = useState(!skip)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || getTodayInTimezone(timezone)
  )

  /**
   * Load nutrition data for the selected date.
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

      // DEBUG: Log request parameters
      console.log('[useNutritionData] Fetching data:', {
        selectedDate,
        timezone,
        isRefresh
      })

      // Fetch daily nutrition data (stats + meals)
      const { stats, meals } = await getDailyNutrition(selectedDate, timezone)

      // DEBUG: Log API response
      console.log('[useNutritionData] API response:', {
        stats_calories: stats.calories_consumed,
        meals_count: meals.length,
        meals_sample: meals.slice(0, 2).map(m => ({
          id: m.id,
          meal_type: m.meal_type,
          logged_at: m.logged_at,
          calories: m.total_calories
        }))
      })

      // Transform API response to frontend format
      const transformed = transformDailyNutrition(stats, meals)
      setData(transformed)

      // DEBUG: Log transformed data
      console.log('[useNutritionData] Transformed data:', {
        meals_count: transformed.meals.length,
        total_calories: transformed.totalCalories
      })

      // Fire success callback
      if (onSuccess) {
        onSuccess(transformed)
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to load nutrition data'

      console.error('[useNutritionData] ERROR:', err)
      setError(errorMessage)

      // Fire error callback
      if (onError && err instanceof Error) {
        onError(err)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedDate, timezone, onSuccess, onError])

  /**
   * Refresh nutrition data (pull-to-refresh).
   */
  const refresh = useCallback(async () => {
    await loadData(true)
  }, [loadData])

  /**
   * Delete a meal and refresh the data.
   */
  const deleteMealAndRefresh = useCallback(async (mealId: string) => {
    try {
      await deleteMeal(mealId)

      // Fire deleted callback
      if (onMealDeleted) {
        onMealDeleted()
      }

      // Refresh data after deletion
      await loadData(true)
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to delete meal'

      console.error('Meal deletion error:', err)
      setError(errorMessage)

      // Fire error callback
      if (onError && err instanceof Error) {
        onError(err)
      }

      throw err // Re-throw so caller can handle toast notifications
    }
  }, [loadData, onError, onMealDeleted])

  /**
   * Load data when selected date changes.
   */
  useEffect(() => {
    if (!skip) {
      loadData()
    }
  }, [skip, loadData])

  return {
    data,
    loading,
    refreshing,
    error,
    selectedDate,
    setSelectedDate,
    refresh,
    deleteMealAndRefresh,
    totalMeals: data?.meals.length || 0
  }
}
