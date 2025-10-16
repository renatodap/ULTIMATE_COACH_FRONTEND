/**
 * Tests for useActivitiesData Hook
 *
 * Modern 2025 testing approach:
 * - Tests timezone-aware grouping behavior
 * - Tests view mode switching (day/week/recent)
 * - Tests wearable sync polling
 * - Tests localStorage persistence
 * - Realistic scenarios with actual user workflows
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useActivitiesData } from '../useActivitiesData'
import * as activitiesApi from '@/lib/api/activities'
import * as wearablesApi from '@/lib/api/wearables'
import type { Activity, DailySummary } from '@/lib/types/activities'

// Mock API modules
vi.mock('@/lib/api/activities')
vi.mock('@/lib/api/wearables')

// Mock timezone utilities
vi.mock('@/lib/utils/timezone', () => ({
  getTodayInTimezone: (tz: string) => '2025-10-16',
  formatDateInTimezone: (isoString: string, tz: string) => {
    // Convert UTC to timezone-aware date (simplified for tests)
    return isoString.split('T')[0]
  },
  formatRelativeDate: (dateStr: string, tz: string) => {
    if (dateStr === '2025-10-16') return 'Today'
    if (dateStr === '2025-10-15') return 'Yesterday'
    return dateStr
  }
}))

describe('useActivitiesData', () => {
  // Test data - realistic user activities
  const mockActivities: Activity[] = [
    {
      id: 'act-1',
      user_id: 'user-123',
      category: 'cardio_steady_state',
      activity_name: 'Morning Run',
      start_time: '2025-10-16T06:00:00Z',
      end_time: '2025-10-16T06:45:00Z',
      duration_minutes: 45,
      calories_burned: 420,
      intensity_mets: 8.5,
      metrics: { distance_km: 6.2 },
      notes: null,
      created_at: '2025-10-16T06:45:00Z',
      updated_at: '2025-10-16T06:45:00Z',
      deleted_at: null
    },
    {
      id: 'act-2',
      user_id: 'user-123',
      category: 'strength_training',
      activity_name: 'Upper Body Workout',
      start_time: '2025-10-16T17:00:00Z',
      end_time: '2025-10-16T17:50:00Z',
      duration_minutes: 50,
      calories_burned: 280,
      intensity_mets: 5.5,
      metrics: {
        exercises: [
          { name: 'Bench Press', sets: 3, reps: 8, weight_kg: 100 }
        ]
      },
      notes: null,
      created_at: '2025-10-16T17:50:00Z',
      updated_at: '2025-10-16T17:50:00Z',
      deleted_at: null
    },
    {
      id: 'act-3',
      user_id: 'user-123',
      category: 'cardio_steady_state',
      activity_name: 'Evening Walk',
      start_time: '2025-10-15T18:30:00Z',
      end_time: '2025-10-15T19:00:00Z',
      duration_minutes: 30,
      calories_burned: 150,
      intensity_mets: 4.0,
      metrics: { distance_km: 2.5 },
      notes: null,
      created_at: '2025-10-15T19:00:00Z',
      updated_at: '2025-10-15T19:00:00Z',
      deleted_at: null
    }
  ]

  const mockDailySummary: DailySummary = {
    total_calories_burned: 700,
    total_duration_minutes: 95,
    average_intensity: 7.0,
    activity_count: 2,
    daily_goal_calories: 500,
    goal_percentage: 140
  }

  const mockWearableStatus = {
    latest_job: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Clear localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.clear()
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Data Loading', () => {
    it('should load activities and summary in recent mode (default)', async () => {
      // Arrange
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: mockActivities, // All recent activities
        total: 3,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      // Act
      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false // Disable polling for this test
        })
      )

      // Assert initial state
      expect(result.current.loading).toBe(true)
      expect(result.current.viewMode).toBe('recent') // Default changed from 'day' to 'recent'

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert data loaded
      expect(result.current.summary).toEqual(mockDailySummary)
      expect(result.current.activitiesByDate.size).toBe(2) // Two dates (2025-10-16 and 2025-10-15)
      expect(result.current.activitiesByDate.get('2025-10-16')?.length).toBe(2)
      expect(result.current.activitiesByDate.get('2025-10-15')?.length).toBe(1)
      expect(result.current.totalActivities).toBe(3)
      expect(result.current.error).toBeNull()

      // Verify API calls - recent mode has no date filters, limit 100
      expect(activitiesApi.getDailySummary).toHaveBeenCalledWith() // No target_date param
      expect(activitiesApi.getActivities).toHaveBeenCalledWith({
        limit: 100 // Increased from 50 to 100
      })
    })

    it('should group activities by timezone-aware date', async () => {
      // Arrange: Activities from two different dates
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: mockActivities, // 2 from today, 1 from yesterday
        total: 3,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      // Act
      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Activities grouped by date
      expect(result.current.activitiesByDate.size).toBe(2)
      expect(result.current.activitiesByDate.get('2025-10-16')?.length).toBe(2) // Today
      expect(result.current.activitiesByDate.get('2025-10-15')?.length).toBe(1) // Yesterday
      expect(result.current.totalActivities).toBe(3)
    })

    it('should skip initial load when skip option is true', async () => {
      // Arrange
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: [],
        total: 0,
        limit: 100,
        offset: 0
      })

      // Act
      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          skip: true,
          enablePolling: false
        })
      )

      // Assert: No loading, no API calls
      expect(result.current.loading).toBe(false)
      expect(result.current.activitiesByDate.size).toBe(0)
      expect(activitiesApi.getDailySummary).not.toHaveBeenCalled()
      expect(activitiesApi.getActivities).not.toHaveBeenCalled()
    })
  })

  describe('View Mode Switching', () => {
    it('should fetch week range when switching to week mode', async () => {
      // Arrange: Start in day mode
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: mockActivities.slice(0, 2),
        total: 2,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      vi.clearAllMocks()

      // Mock week activities (7 days worth)
      const weekActivities = [...mockActivities]
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: weekActivities,
        total: 3,
        limit: 100,
        offset: 0
      })

      // Act: Switch to week mode
      await act(async () => {
        result.current.setViewMode('week')
      })

      await waitFor(() => {
        expect(result.current.viewMode).toBe('week')
      })

      // Assert: Called with week range
      // For 2025-10-16 (Thursday), week should be Mon 10/13 - Sun 10/19
      expect(activitiesApi.getActivities).toHaveBeenCalledWith({
        start_date: '2025-10-13', // Monday
        end_date: '2025-10-19',   // Sunday
        limit: 100
      })

      // Weekly summary should be calculated
      expect(result.current.summary?.activity_count).toBe(3)
      expect(result.current.summary?.total_calories_burned).toBe(850) // 420 + 280 + 150
    })

    it('should fetch recent activities when switching to recent mode', async () => {
      // Arrange - Start with localStorage set to 'day' mode first
      window.localStorage.setItem('activitiesViewMode', 'day')

      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: mockActivities.slice(0, 2),
        total: 2,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      vi.clearAllMocks()

      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: mockActivities,
        total: 3,
        limit: 100,
        offset: 0
      })

      // Act: Switch to recent mode
      await act(async () => {
        result.current.setViewMode('recent')
      })

      await waitFor(() => {
        expect(result.current.viewMode).toBe('recent')
      })

      // Assert: Called with limit 100 (updated from 50), no date filters
      expect(activitiesApi.getActivities).toHaveBeenCalledWith({ limit: 100 })
      expect(activitiesApi.getDailySummary).toHaveBeenCalledWith() // No date param
    })

    it('should persist view mode to localStorage', async () => {
      // Arrange
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: [],
        total: 0,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Act: Change view mode
      await act(async () => {
        result.current.setViewMode('week')
      })

      // Assert: Persisted to localStorage
      expect(window.localStorage.getItem('activitiesViewMode')).toBe('week')
    })
  })

  describe('Date Selection', () => {
    it('should fetch activities for selected date in day mode', async () => {
      // Arrange - Start in 'day' mode (date selection only works in day mode)
      window.localStorage.setItem('activitiesViewMode', 'day')

      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: mockActivities.slice(0, 2),
        total: 2,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.viewMode).toBe('day')
      })

      vi.clearAllMocks()

      const yesterdayActivities = [mockActivities[2]] // Just yesterday's activity
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: yesterdayActivities,
        total: 1,
        limit: 100,
        offset: 0
      })
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue({
        ...mockDailySummary,
        total_calories_burned: 150,
        activity_count: 1
      })

      // Act: Change selected date to yesterday
      await act(async () => {
        result.current.setSelectedDate('2025-10-15')
      })

      await waitFor(() => {
        expect(result.current.selectedDate).toBe('2025-10-15')
      })

      // Assert: Fetched activities for new date (only works in day mode)
      expect(activitiesApi.getActivities).toHaveBeenCalledWith({
        start_date: '2025-10-15',
        end_date: '2025-10-15',
        limit: 100
      })
    })

    it('should persist selected date to localStorage', async () => {
      // Arrange
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: [],
        total: 0,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Act: Change date
      await act(async () => {
        result.current.setSelectedDate('2025-10-15')
      })

      // Assert: Persisted to localStorage
      expect(window.localStorage.getItem('activitiesSelectedDate')).toBe('2025-10-15')
    })

    it('should restore view mode and date from localStorage', () => {
      // Arrange: Set localStorage values
      window.localStorage.setItem('activitiesViewMode', 'week')
      window.localStorage.setItem('activitiesSelectedDate', '2025-10-10')

      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: [],
        total: 0,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      // Act: Render hook
      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false
        })
      )

      // Assert: Restored from localStorage
      expect(result.current.viewMode).toBe('week')
      expect(result.current.selectedDate).toBe('2025-10-10')
    })
  })

  describe('Refresh Functionality', () => {
    it('should refresh activities when refresh() is called', async () => {
      // Arrange
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: mockActivities.slice(0, 2),
        total: 2,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      vi.clearAllMocks()

      // New activity logged
      const updatedActivities = [...mockActivities]
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: updatedActivities,
        total: 3,
        limit: 100,
        offset: 0
      })

      // Act: Refresh
      await act(async () => {
        await result.current.refresh()
      })

      // Assert: Refreshing state used, data updated
      expect(result.current.refreshing).toBe(false)
      expect(result.current.totalActivities).toBe(3)
      expect(activitiesApi.getActivities).toHaveBeenCalledTimes(1)
    })
  })

  describe('Wearable Sync Polling', () => {
    it('should detect sync in progress', async () => {
      // Arrange: Mock running sync job
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: [],
        total: 0,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue({
        latest_job: {
          id: 'job-123',
          status: 'running',
          created_at: '2025-10-16T10:00:00Z'
        }
      })

      // Act
      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: true,
          pollingInterval: 100 // Fast polling for test
        })
      )

      // Wait for polling to detect running sync
      await waitFor(() => {
        expect(result.current.syncInProgress).toBe(true)
      }, { timeout: 500 })
    })

    it('should auto-refresh when sync completes', async () => {
      // Arrange: Initial state with running sync
      let syncStatus = 'running'
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: mockActivities.slice(0, 1), // Initial: 1 activity
        total: 1,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockImplementation(() =>
        Promise.resolve({
          latest_job: {
            id: 'job-123',
            status: syncStatus as 'running' | 'success',
            created_at: '2025-10-16T10:00:00Z'
          }
        })
      )

      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: true,
          pollingInterval: 100
        })
      )

      await waitFor(() => {
        expect(result.current.syncInProgress).toBe(true)
      })

      // Act: Change sync status to success (sync completed)
      syncStatus = 'success'
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: mockActivities.slice(0, 2), // Updated: 2 activities (new one from wearable)
        total: 2,
        limit: 100,
        offset: 0
      })

      // Wait for polling to detect completion and trigger refresh
      await waitFor(() => {
        expect(result.current.syncInProgress).toBe(false)
        expect(result.current.totalActivities).toBe(2) // Data refreshed
      }, { timeout: 1000 })
    })

    it('should not poll when enablePolling is false', async () => {
      // Arrange
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: [],
        total: 0,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      // Act
      renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false
        })
      )

      await waitFor(() => {
        expect(activitiesApi.getActivities).toHaveBeenCalled()
      })

      // Assert: Wearable status not polled
      expect(wearablesApi.getWearableStatus).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Arrange
      const apiError = new Error('Network error')
      vi.mocked(activitiesApi.getDailySummary).mockRejectedValue(apiError)
      vi.mocked(activitiesApi.getActivities).mockRejectedValue(apiError)
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Act
      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert
      expect(result.current.error).toBe('Network error')
      expect(result.current.activitiesByDate.size).toBe(0)
      expect(errorSpy).toHaveBeenCalled()

      errorSpy.mockRestore()
    })

    it('should call onError callback when load fails', async () => {
      // Arrange
      const apiError = new Error('API timeout')
      const onError = vi.fn()
      vi.mocked(activitiesApi.getDailySummary).mockRejectedValue(apiError)
      vi.mocked(activitiesApi.getActivities).mockRejectedValue(apiError)
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      // Act
      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false,
          onError
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert
      expect(onError).toHaveBeenCalledWith(apiError)
    })
  })

  describe('Success Callback', () => {
    it('should call onSuccess callback when data loads', async () => {
      // Arrange
      const onSuccess = vi.fn()
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue(mockDailySummary)
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: mockActivities.slice(0, 2),
        total: 2,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      // Act
      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false,
          onSuccess
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert
      expect(onSuccess).toHaveBeenCalledWith({
        summary: mockDailySummary,
        activities: mockActivities.slice(0, 2)
      })
    })
  })

  describe('Weekly Summary Calculation', () => {
    it('should calculate weekly summary correctly', async () => {
      // Arrange: Week mode with multiple activities
      vi.mocked(activitiesApi.getDailySummary).mockResolvedValue({
        ...mockDailySummary,
        daily_goal_calories: 400
      })
      vi.mocked(activitiesApi.getActivities).mockResolvedValue({
        activities: mockActivities,
        total: 3,
        limit: 100,
        offset: 0
      })
      vi.mocked(wearablesApi.getWearableStatus).mockResolvedValue(mockWearableStatus)

      window.localStorage.setItem('activitiesViewMode', 'week')

      // Act
      const { result } = renderHook(() =>
        useActivitiesData({
          timezone: 'America/New_York',
          enablePolling: false
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Assert: Weekly summary calculated from all activities
      expect(result.current.summary?.total_calories_burned).toBe(850) // 420 + 280 + 150
      expect(result.current.summary?.total_duration_minutes).toBe(125) // 45 + 50 + 30
      expect(result.current.summary?.activity_count).toBe(3)
      expect(result.current.summary?.daily_goal_calories).toBe(2800) // 400 * 7 (weekly goal)
      expect(result.current.summary?.average_intensity).toBe(6.0) // (8.5 + 5.5 + 4.0) / 3
    })
  })
})
