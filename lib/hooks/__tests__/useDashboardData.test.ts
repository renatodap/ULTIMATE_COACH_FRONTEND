/**
 * Tests for useDashboardData Hook
 *
 * Modern 2025 testing approach:
 * - Behavioral testing (what it does, not how)
 * - Realistic scenarios based on actual user workflows
 * - Minimal mocking (only external dependencies)
 * - Clear test names explaining behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDashboardData } from '../useDashboardData'
import * as dashboardApi from '@/lib/api/dashboard'
import * as profileApi from '@/lib/api/profile'
import type { DashboardSummary } from '@/lib/types/dashboard'

// Mock API modules
vi.mock('@/lib/api/dashboard')
vi.mock('@/lib/api/profile')

describe('useDashboardData', () => {
  // Test data following realistic user scenarios
  const mockDashboardData: DashboardSummary = {
    display_name: 'Alex',
    date: '2025-10-16',
    nutrition: {
      calories_consumed: 1850,
      calories_goal: 2200,
      protein_g: 145,
      protein_goal_g: 180,
      carbs_g: 185,
      carbs_goal_g: 220,
      fat_g: 62,
      fat_goal_g: 73
    },
    activity: {
      calories_burned: 420,
      duration_minutes: 55,
      activities_count: 2
    },
    net_calories: 1430, // consumed - burned
    weight: {
      current_kg: 82.5,
      previous_kg: 83.1,
      change_kg: -0.6,
      trend: 'down'
    },
    weekly: {
      avg_calories: 1920,
      avg_protein_g: 152,
      workouts_completed: 4,
      avg_weight_kg: 82.8
    }
  }

  const mockProfile = {
    id: 'user-123',
    email: 'alex@example.com',
    unit_system: 'metric',
    consultation_completed: true
  }

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks()
  })

  describe('Initial Data Loading', () => {
    it('should load dashboard data and profile on mount', async () => {
      // Arrange: Mock successful API responses
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      // Act: Render hook
      const { result } = renderHook(() => useDashboardData())

      // Assert: Initial loading state
      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Data loaded successfully
      expect(result.current.data).toEqual(mockDashboardData)
      expect(result.current.unitSystem).toBe('metric')
      expect(result.current.consultationCompleted).toBe(true)
      expect(result.current.error).toBeNull()

      // Verify API calls
      expect(dashboardApi.getDashboardSummary).toHaveBeenCalledTimes(1)
      expect(profileApi.getFullUserProfile).toHaveBeenCalledTimes(1)
    })

    it('should skip initial load when skip option is true', async () => {
      // Arrange: Mock APIs (should not be called)
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      // Act: Render with skip=true
      const { result } = renderHook(() => useDashboardData({ skip: true }))

      // Assert: No loading, no API calls
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBeNull()
      expect(dashboardApi.getDashboardSummary).not.toHaveBeenCalled()
      expect(profileApi.getFullUserProfile).not.toHaveBeenCalled()
    })

    it('should use default values when profile load fails', async () => {
      // Arrange: Dashboard succeeds, profile fails
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockRejectedValue(new Error('Profile not found'))

      // Spy on console.warn to verify non-critical error handling
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Act: Render hook
      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Dashboard data loaded, defaults used for profile
      expect(result.current.data).toEqual(mockDashboardData)
      expect(result.current.unitSystem).toBe('metric') // default
      expect(result.current.consultationCompleted).toBe(false) // default
      expect(result.current.error).toBeNull() // profile error is non-critical
      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to load user profile:',
        expect.any(Error)
      )

      warnSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    it('should handle dashboard API failure gracefully', async () => {
      // Arrange: Mock API error
      const apiError = new Error('Network error')
      vi.mocked(dashboardApi.getDashboardSummary).mockRejectedValue(apiError)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      // Spy on console.error
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Act: Render hook
      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Error state set
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBe('Network error')
      expect(result.current.loading).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith('Dashboard data load error:', apiError)

      errorSpy.mockRestore()
    })

    it('should use generic error message for non-Error objects', async () => {
      // Arrange: Mock non-Error rejection (e.g., string error)
      vi.mocked(dashboardApi.getDashboardSummary).mockRejectedValue('Unknown error')
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      // Act: Render hook
      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Generic error message used
      expect(result.current.error).toBe('Failed to load dashboard. Please try again.')
    })

    it('should call onError callback when load fails', async () => {
      // Arrange: Mock error and callback
      const apiError = new Error('API timeout')
      const onError = vi.fn()
      vi.mocked(dashboardApi.getDashboardSummary).mockRejectedValue(apiError)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      // Act: Render with error callback
      const { result } = renderHook(() => useDashboardData({ onError }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Callback called with error
      expect(onError).toHaveBeenCalledWith(apiError)
      expect(onError).toHaveBeenCalledTimes(1)
    })
  })

  describe('Refresh Functionality', () => {
    it('should refresh data when refresh() is called', async () => {
      // Arrange: Mock successful responses
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useDashboardData())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear call history
      vi.clearAllMocks()

      // Updated data for refresh
      const updatedData = {
        ...mockDashboardData,
        nutrition: {
          ...mockDashboardData.nutrition,
          calories_consumed: 2100 // User logged more food
        }
      }
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(updatedData)

      // Act: Call refresh
      await act(async () => {
        await result.current.refresh()
      })

      // Assert: Refreshing state used, not loading
      expect(result.current.loading).toBe(false) // Should NOT set loading=true
      expect(result.current.refreshing).toBe(false) // Should be false after complete
      expect(result.current.data?.nutrition.calories_consumed).toBe(2100)
      expect(dashboardApi.getDashboardSummary).toHaveBeenCalledTimes(1)
    })

    it('should set refreshing state during refresh', async () => {
      // Arrange: Mock with delay to capture refreshing state
      vi.mocked(dashboardApi.getDashboardSummary).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockDashboardData), 100))
      )
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Act: Start refresh
      act(() => {
        result.current.refresh()
      })

      // Assert: Refreshing state active during request
      await waitFor(() => {
        expect(result.current.refreshing).toBe(true)
      })

      // Wait for completion
      await waitFor(() => {
        expect(result.current.refreshing).toBe(false)
      })
    })
  })

  describe('Manual Load', () => {
    it('should allow manual data load via load() function', async () => {
      // Arrange: Render with skip=true
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useDashboardData({ skip: true }))

      expect(result.current.data).toBeNull()
      expect(result.current.loading).toBe(false)

      // Act: Manually trigger load
      await act(async () => {
        await result.current.load()
      })

      // Assert: Data loaded
      await waitFor(() => {
        expect(result.current.data).toEqual(mockDashboardData)
      })
      expect(dashboardApi.getDashboardSummary).toHaveBeenCalledTimes(1)
    })

    it('should clear error state when retry succeeds', async () => {
      // Arrange: First call fails, second succeeds
      vi.mocked(dashboardApi.getDashboardSummary)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useDashboardData())

      // Wait for initial error
      await waitFor(() => {
        expect(result.current.error).toBe('Network error')
      })

      // Act: Retry load
      await act(async () => {
        await result.current.load()
      })

      // Assert: Error cleared, data loaded
      await waitFor(() => {
        expect(result.current.error).toBeNull()
        expect(result.current.data).toEqual(mockDashboardData)
      })
    })
  })

  describe('Success Callback', () => {
    it('should call onSuccess callback when data loads successfully', async () => {
      // Arrange: Mock callback
      const onSuccess = vi.fn()
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      // Act: Render with success callback
      const { result } = renderHook(() => useDashboardData({ onSuccess }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Callback called with data
      expect(onSuccess).toHaveBeenCalledWith(mockDashboardData)
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it('should call onSuccess on refresh as well', async () => {
      // Arrange
      const onSuccess = vi.fn()
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useDashboardData({ onSuccess }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear calls from initial load
      onSuccess.mockClear()

      // Act: Refresh
      await act(async () => {
        await result.current.refresh()
      })

      // Assert: Callback called again
      expect(onSuccess).toHaveBeenCalledWith(mockDashboardData)
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })

  describe('Profile Data Handling', () => {
    it('should set imperial unit system from profile', async () => {
      // Arrange: Mock imperial user
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue({
        ...mockProfile,
        unit_system: 'imperial'
      })

      // Act: Render hook
      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Imperial system set
      expect(result.current.unitSystem).toBe('imperial')
    })

    it('should set consultation status from profile', async () => {
      // Arrange: Mock user who hasn't completed consultation
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue({
        ...mockProfile,
        consultation_completed: false
      })

      // Act: Render hook
      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Consultation not completed
      expect(result.current.consultationCompleted).toBe(false)
    })

    it('should default to metric when unit_system is not set', async () => {
      // Arrange: Profile without unit_system field
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue({
        ...mockProfile,
        unit_system: undefined
      })

      // Act: Render hook
      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Defaults to metric
      expect(result.current.unitSystem).toBe('metric')
    })

    it('should default consultation to false when not set', async () => {
      // Arrange: Profile without consultation_completed field
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue({
        ...mockProfile,
        consultation_completed: undefined
      })

      // Act: Render hook
      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Defaults to false
      expect(result.current.consultationCompleted).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle concurrent refresh calls gracefully', async () => {
      // Arrange: Mock with delay
      let callCount = 0
      vi.mocked(dashboardApi.getDashboardSummary).mockImplementation(
        () => new Promise(resolve => {
          callCount++
          setTimeout(() => resolve(mockDashboardData), 50)
        })
      )
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Reset count
      callCount = 0

      // Act: Call refresh multiple times rapidly
      await act(async () => {
        const promises = [
          result.current.refresh(),
          result.current.refresh(),
          result.current.refresh()
        ]
        await Promise.all(promises)
      })

      // Assert: All calls complete, data consistent
      expect(result.current.data).toEqual(mockDashboardData)
      expect(result.current.refreshing).toBe(false)
      expect(callCount).toBe(3) // All calls executed
    })

    it('should preserve data when refresh fails', async () => {
      // Arrange: Initial load succeeds
      vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(mockDashboardData)
      vi.mocked(profileApi.getFullUserProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.data).toEqual(mockDashboardData)
      })

      // Mock refresh failure
      vi.mocked(dashboardApi.getDashboardSummary).mockRejectedValue(new Error('Refresh failed'))

      // Act: Attempt refresh
      await act(async () => {
        await result.current.refresh()
      })

      // Assert: Old data preserved, error set
      expect(result.current.data).toEqual(mockDashboardData) // Still has old data
      expect(result.current.error).toBe('Refresh failed')
      expect(result.current.refreshing).toBe(false)
    })
  })
})
