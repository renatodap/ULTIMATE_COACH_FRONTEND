/**
 * Unit tests for activities API client.
 *
 * Tests API client methods with mocked HTTP requests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getDailySummary,
} from '../activities'
import type { Activity, CreateActivityRequest, DailySummary } from '@/lib/types/activities'

// Mock apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '../client'

describe('getActivities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch activities list', async () => {
    const mockResponse = {
      data: [
        { id: '1', activity_name: 'Run', calories_burned: 400 },
        { id: '2', activity_name: 'Workout', calories_burned: 300 },
      ],
      total: 2,
    }

    vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

    const result = await getActivities()

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/activities')
    expect(result.data).toHaveLength(2)
    expect(result.total).toBe(2)
  })

  it('should apply date filters', async () => {
    const mockResponse = { data: [], total: 0 }
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

    await getActivities({
      start_date: '2025-10-15',
      end_date: '2025-10-16',
    })

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/activities?start_date=2025-10-15&end_date=2025-10-16'
    )
  })

  it('should apply pagination', async () => {
    const mockResponse = { data: [], total: 0 }
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

    await getActivities({ limit: 10, offset: 20 })

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/activities?limit=10&offset=20')
  })
})

describe('getActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch single activity', async () => {
    const mockActivity: Activity = {
      id: 'activity-001',
      user_id: 'user-123',
      category: 'cardio_steady_state',
      activity_name: 'Morning Run',
      start_time: '2025-10-16T06:00:00Z',
      end_time: '2025-10-16T06:45:00Z',
      duration_minutes: 45,
      calories_burned: 400,
      intensity_mets: 8.0,
      metrics: {},
      notes: null,
      created_at: '2025-10-16T06:45:00Z',
      updated_at: '2025-10-16T06:45:00Z',
      deleted_at: null,
    }

    vi.mocked(apiClient.get).mockResolvedValue(mockActivity)

    const result = await getActivity('activity-001')

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/activities/activity-001')
    expect(result.id).toBe('activity-001')
    expect(result.activity_name).toBe('Morning Run')
  })
})

describe('createActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock supabase auth
    vi.mock('@/lib/supabase', () => ({
      supabase: {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        },
      },
    }))
  })

  it('should create new activity', async () => {
    const request: CreateActivityRequest = {
      category: 'cardio_steady_state',
      activity_name: 'Morning Run',
      start_time: '2025-10-16T06:00:00Z',
      end_time: '2025-10-16T06:45:00Z',
      intensity_mets: 8.0,
      metrics: { distance_km: 6.5 },
    }

    const mockResponse: Activity = {
      id: 'activity-001',
      user_id: 'user-123',
      ...request,
      duration_minutes: 45,
      calories_burned: 400,
      notes: null,
      created_at: '2025-10-16T06:45:00Z',
      updated_at: '2025-10-16T06:45:00Z',
      deleted_at: null,
    }

    vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

    const result = await createActivity(request)

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/activities',
      request,
      expect.objectContaining({ headers: expect.any(Object) })
    )
    expect(result.id).toBe('activity-001')
    expect(result.duration_minutes).toBe(45)
    expect(result.calories_burned).toBe(400)
  })
})

describe('updateActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update activity', async () => {
    const updates = {
      duration_minutes: 50,
      notes: 'Felt strong!',
    }

    const mockResponse: Activity = {
      id: 'activity-001',
      user_id: 'user-123',
      category: 'cardio_steady_state',
      activity_name: 'Morning Run',
      start_time: '2025-10-16T06:00:00Z',
      end_time: '2025-10-16T06:50:00Z',
      duration_minutes: 50,
      calories_burned: 444,
      intensity_mets: 8.0,
      metrics: {},
      notes: 'Felt strong!',
      created_at: '2025-10-16T06:45:00Z',
      updated_at: '2025-10-16T06:50:00Z',
      deleted_at: null,
    }

    vi.mocked(apiClient.patch).mockResolvedValue(mockResponse)

    const result = await updateActivity('activity-001', updates)

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/api/v1/activities/activity-001',
      updates
    )
    expect(result.duration_minutes).toBe(50)
    expect(result.notes).toBe('Felt strong!')
  })
})

describe('deleteActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete activity', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(undefined)

    await deleteActivity('activity-001')

    expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/activities/activity-001')
  })
})

describe('getDailySummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch daily summary', async () => {
    const mockSummary: DailySummary = {
      target_date: '2025-10-16',
      total_calories: 700,
      total_duration: 105,
      avg_intensity: 6.5,
      activity_count: 2,
      goal_calories: 1000,
      goal_percentage: 70,
    }

    vi.mocked(apiClient.get).mockResolvedValue(mockSummary)

    const result = await getDailySummary({ target_date: '2025-10-16' })

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/activities/summary?target_date=2025-10-16'
    )
    expect(result.total_calories).toBe(700)
    expect(result.activity_count).toBe(2)
  })

  it('should use today if no date provided', async () => {
    const mockSummary: DailySummary = {
      target_date: '2025-10-16',
      total_calories: 0,
      total_duration: 0,
      avg_intensity: 0,
      activity_count: 0,
      goal_calories: 1000,
      goal_percentage: 0,
    }

    vi.mocked(apiClient.get).mockResolvedValue(mockSummary)

    await getDailySummary()

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/activities/summary')
  })
})

describe('Error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw error on failed request', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

    await expect(getActivities()).rejects.toThrow('Network error')
  })

  it('should throw error on 404', async () => {
    vi.mocked(apiClient.get).mockRejectedValue({
      status: 404,
      message: 'Activity not found',
    })

    await expect(getActivity('invalid-id')).rejects.toThrow()
  })
})
