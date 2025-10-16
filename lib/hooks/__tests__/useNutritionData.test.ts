/**
 * useNutritionData Hook Tests
 *
 * Tests for the useNutritionData hook following modern 2025 testing practices:
 * - Behavioral validation over coverage metrics
 * - Realistic scenarios with minimal mocking
 * - Focus on what the hook does, not how it does it
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useNutritionData } from '../useNutritionData'
import * as nutritionApi from '@/lib/api/nutrition'
import * as nutritionTransformer from '@/lib/utils/nutrition-transformer'
import * as timezoneUtils from '@/lib/utils/timezone'
import type { NutritionStatsAPI, MealAPI } from '@/lib/api/nutrition'
import type { DailyNutrition } from '@/lib/types/nutrition'

// Mock modules
vi.mock('@/lib/api/nutrition')
vi.mock('@/lib/utils/nutrition-transformer')
vi.mock('@/lib/utils/timezone')

describe('useNutritionData', () => {
  // Mock data
  const mockStatsAPI: NutritionStatsAPI = {
    date: '2025-10-16',
    calories_consumed: 1800,
    protein_consumed: 150,
    carbs_consumed: 180,
    fat_consumed: 60,
    calories_goal: 2200,
    protein_goal: 180,
    carbs_goal: 220,
    fat_goal: 70,
    meals_count: 3,
    meals_by_type: { breakfast: 1, lunch: 1, dinner: 1 }
  }

  const mockMealsAPI: MealAPI[] = [
    {
      id: 'meal-1',
      user_id: 'user-123',
      name: 'Breakfast',
      meal_type: 'breakfast',
      logged_at: '2025-10-16T07:00:00Z',
      notes: null,
      total_calories: 600,
      total_protein_g: 50,
      total_carbs_g: 60,
      total_fat_g: 20,
      source: 'manual',
      ai_confidence: null,
      ai_cost_usd: 0,
      items: [],
      created_at: '2025-10-16T07:00:00Z',
      updated_at: '2025-10-16T07:00:00Z'
    },
    {
      id: 'meal-2',
      user_id: 'user-123',
      name: 'Lunch',
      meal_type: 'lunch',
      logged_at: '2025-10-16T12:00:00Z',
      notes: null,
      total_calories: 700,
      total_protein_g: 60,
      total_carbs_g: 70,
      total_fat_g: 25,
      source: 'manual',
      ai_confidence: null,
      ai_cost_usd: 0,
      items: [],
      created_at: '2025-10-16T12:00:00Z',
      updated_at: '2025-10-16T12:00:00Z'
    },
    {
      id: 'meal-3',
      user_id: 'user-123',
      name: 'Dinner',
      meal_type: 'dinner',
      logged_at: '2025-10-16T18:00:00Z',
      notes: null,
      total_calories: 500,
      total_protein_g: 40,
      total_carbs_g: 50,
      total_fat_g: 15,
      source: 'manual',
      ai_confidence: null,
      ai_cost_usd: 0,
      items: [],
      created_at: '2025-10-16T18:00:00Z',
      updated_at: '2025-10-16T18:00:00Z'
    }
  ]

  const mockTransformedData: DailyNutrition = {
    date: '2025-10-16',
    totalCalories: 1800,
    totalProtein: 150,
    totalCarbs: 180,
    totalFat: 60,
    calorieGoal: 2200,
    proteinGoal: 180,
    carbsGoal: 220,
    fatGoal: 70,
    meals: [
      {
        id: 'meal-1',
        mealType: 'breakfast',
        name: 'Breakfast',
        loggedAt: '2025-10-16T07:00:00Z',
        totalCalories: 600,
        totalProtein: 50,
        totalCarbs: 60,
        totalFat: 20,
        source: 'manual',
        foodItems: []
      },
      {
        id: 'meal-2',
        mealType: 'lunch',
        name: 'Lunch',
        loggedAt: '2025-10-16T12:00:00Z',
        totalCalories: 700,
        totalProtein: 60,
        totalCarbs: 70,
        totalFat: 25,
        source: 'manual',
        foodItems: []
      },
      {
        id: 'meal-3',
        mealType: 'dinner',
        name: 'Dinner',
        loggedAt: '2025-10-16T18:00:00Z',
        totalCalories: 500,
        totalProtein: 40,
        totalCarbs: 50,
        totalFat: 15,
        source: 'manual',
        foodItems: []
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock timezone utilities
    vi.mocked(timezoneUtils.getTodayInTimezone).mockReturnValue('2025-10-16')

    // Mock API calls
    vi.mocked(nutritionApi.getDailyNutrition).mockResolvedValue({
      stats: mockStatsAPI,
      meals: mockMealsAPI
    })

    // Mock transformer
    vi.mocked(nutritionTransformer.transformDailyNutrition).mockReturnValue(mockTransformedData)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Data Loading', () => {
    it('should load nutrition data on mount', async () => {
      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York' })
      )

      // Should start loading
      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBeNull()

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Data loaded
      expect(result.current.data).toEqual(mockTransformedData)
      expect(result.current.error).toBeNull()
      expect(result.current.totalMeals).toBe(3)
    })

    it('should use initialDate if provided', async () => {
      const { result } = renderHook(() =>
        useNutritionData({
          timezone: 'America/New_York',
          initialDate: '2025-10-15'
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Used provided date
      expect(result.current.selectedDate).toBe('2025-10-15')
      expect(nutritionApi.getDailyNutrition).toHaveBeenCalledWith('2025-10-15', 'America/New_York')
    })

    it('should use current date if initialDate not provided', async () => {
      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York' })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Used today's date from timezone
      expect(result.current.selectedDate).toBe('2025-10-16')
    })

    it('should skip initial load when skip option is true', async () => {
      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York', skip: true })
      )

      // Should not load
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBeNull()
      expect(nutritionApi.getDailyNutrition).not.toHaveBeenCalled()
    })
  })

  describe('Date Selection', () => {
    it('should update selected date and reload data', async () => {
      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York' })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear previous calls
      vi.clearAllMocks()

      // Change date
      result.current.setSelectedDate('2025-10-17')

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Date changed and data reloaded
      expect(result.current.selectedDate).toBe('2025-10-17')
      expect(nutritionApi.getDailyNutrition).toHaveBeenCalledWith('2025-10-17', 'America/New_York')
    })
  })

  describe('Refresh Functionality', () => {
    it('should refresh data when refresh() is called', async () => {
      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York' })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear previous calls
      vi.clearAllMocks()

      // Trigger refresh
      await result.current.refresh()

      // Assert: Data reloaded
      expect(nutritionApi.getDailyNutrition).toHaveBeenCalledWith('2025-10-16', 'America/New_York')
      expect(result.current.data).toEqual(mockTransformedData)
      expect(result.current.refreshing).toBe(false)
    })

    it('should set refreshing state during refresh', async () => {
      // Mock a slow API call to test refreshing state
      vi.mocked(nutritionApi.getDailyNutrition).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          stats: mockStatsAPI,
          meals: mockMealsAPI
        }), 100))
      )

      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York' })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Trigger refresh (don't await)
      const refreshPromise = result.current.refresh()

      // Assert: Refreshing is true immediately after calling refresh
      await waitFor(() => {
        expect(result.current.refreshing).toBe(true)
      })

      // Assert: Loading should remain false
      expect(result.current.loading).toBe(false)

      // Wait for refresh to complete
      await refreshPromise

      await waitFor(() => {
        expect(result.current.refreshing).toBe(false)
      })
    })
  })

  describe('Meal Deletion', () => {
    it('should delete meal and refresh data', async () => {
      vi.mocked(nutritionApi.deleteMeal).mockResolvedValue()

      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York' })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear previous calls
      vi.clearAllMocks()

      // Delete meal
      await result.current.deleteMealAndRefresh('meal-1')

      // Assert: Meal deleted
      expect(nutritionApi.deleteMeal).toHaveBeenCalledWith('meal-1')

      // Assert: Data refreshed after deletion
      expect(nutritionApi.getDailyNutrition).toHaveBeenCalledWith('2025-10-16', 'America/New_York')
    })

    it('should call onMealDeleted callback', async () => {
      vi.mocked(nutritionApi.deleteMeal).mockResolvedValue()

      const onMealDeleted = vi.fn()

      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York', onMealDeleted })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Delete meal
      await result.current.deleteMealAndRefresh('meal-1')

      // Assert: Callback fired
      expect(onMealDeleted).toHaveBeenCalled()
    })

    it('should handle deletion errors and re-throw', async () => {
      const deleteError = new Error('Failed to delete meal')
      vi.mocked(nutritionApi.deleteMeal).mockRejectedValue(deleteError)

      const onError = vi.fn()

      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York', onError })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Delete meal (should throw)
      await expect(result.current.deleteMealAndRefresh('meal-1')).rejects.toThrow('Failed to delete meal')

      // Assert: Error callback fired
      expect(onError).toHaveBeenCalledWith(deleteError)
    })
  })

  describe('Error Handling', () => {
    it('should handle API failures gracefully', async () => {
      const apiError = new Error('API timeout')
      vi.mocked(nutritionApi.getDailyNutrition).mockRejectedValue(apiError)

      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York' })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Error state set
      expect(result.current.error).toBe('API timeout')
      expect(result.current.data).toBeNull()
    })

    it('should call onError callback when load fails', async () => {
      const apiError = new Error('API timeout')
      vi.mocked(nutritionApi.getDailyNutrition).mockRejectedValue(apiError)

      const onError = vi.fn()

      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York', onError })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Error callback fired
      expect(onError).toHaveBeenCalledWith(apiError)
    })

    it('should use generic error message for non-Error objects', async () => {
      vi.mocked(nutritionApi.getDailyNutrition).mockRejectedValue('Unknown error')

      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York' })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Generic error message
      expect(result.current.error).toBe('Failed to load nutrition data')
    })
  })

  describe('Success Callback', () => {
    it('should call onSuccess callback when data loads successfully', async () => {
      const onSuccess = vi.fn()

      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York', onSuccess })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Success callback fired with transformed data
      expect(onSuccess).toHaveBeenCalledWith(mockTransformedData)
    })

    it('should call onSuccess on refresh as well', async () => {
      const onSuccess = vi.fn()

      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York', onSuccess })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear previous calls
      onSuccess.mockClear()

      // Trigger refresh
      await result.current.refresh()

      await waitFor(() => {
        expect(result.current.refreshing).toBe(false)
      })

      // Assert: Success callback fired again
      expect(onSuccess).toHaveBeenCalledWith(mockTransformedData)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty meals list', async () => {
      vi.mocked(nutritionApi.getDailyNutrition).mockResolvedValue({
        stats: { ...mockStatsAPI, meals_count: 0 },
        meals: []
      })

      vi.mocked(nutritionTransformer.transformDailyNutrition).mockReturnValue({
        ...mockTransformedData,
        meals: []
      })

      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York' })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Empty meals handled correctly
      expect(result.current.totalMeals).toBe(0)
      expect(result.current.data?.meals).toEqual([])
    })

    it('should clear error state when retry succeeds', async () => {
      // First call fails
      vi.mocked(nutritionApi.getDailyNutrition).mockRejectedValueOnce(new Error('API timeout'))

      const { result } = renderHook(() =>
        useNutritionData({ timezone: 'America/New_York' })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Error state set
      expect(result.current.error).toBe('API timeout')

      // Mock success for retry
      vi.mocked(nutritionApi.getDailyNutrition).mockResolvedValue({
        stats: mockStatsAPI,
        meals: mockMealsAPI
      })

      // Retry
      await result.current.refresh()

      await waitFor(() => {
        expect(result.current.refreshing).toBe(false)
      })

      // Assert: Error cleared
      expect(result.current.error).toBeNull()
      expect(result.current.data).toEqual(mockTransformedData)
    })
  })
})
