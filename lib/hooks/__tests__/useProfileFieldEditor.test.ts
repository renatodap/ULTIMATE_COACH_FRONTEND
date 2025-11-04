/**
 * Tests for useProfileFieldEditor Hook
 *
 * Tests the reusable profile field editor hook that powers all 12 profile modals.
 * Ensures proper state management, change detection, validation, and error handling.
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useProfileFieldEditor, buildUpdatesWithChangeDetection, validateRequiredFields, validateNumericRange } from '../useProfileFieldEditor'
import { updateFullUserProfile, type FullUserProfile } from '@/lib/api/profile'

// Mock the API
jest.mock('@/lib/api/profile', () => ({
  updateFullUserProfile: jest.fn(),
}))

const mockUpdateProfile = updateFullUserProfile as jest.MockedFunction<typeof updateFullUserProfile>

describe('useProfileFieldEditor', () => {
  const mockOnSuccess = jest.fn()
  const mockOnError = jest.fn()
  const mockOnClose = jest.fn()

  const defaultOptions = {
    onSuccess: mockOnSuccess,
    onError: mockOnError,
    onClose: mockOnClose,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useProfileFieldEditor(defaultOptions))

      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.handleSubmit).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })

    it('should handle successful form submission', async () => {
      const updatedProfile = { id: '123', primary_goal: 'build_muscle' } as FullUserProfile
      mockUpdateProfile.mockResolvedValueOnce(updatedProfile)

      const { result } = renderHook(() => useProfileFieldEditor(defaultOptions))

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
      const updates = { primary_goal: 'build_muscle' }

      await act(async () => {
        await result.current.handleSubmit(mockEvent, updates)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockUpdateProfile).toHaveBeenCalledWith(updates)
      expect(mockOnSuccess).toHaveBeenCalledWith(updatedProfile)
      expect(mockOnClose).toHaveBeenCalled()
      expect(result.current.isSubmitting).toBe(false)
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to update profile')
      mockUpdateProfile.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useProfileFieldEditor(defaultOptions))

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
      const updates = { primary_goal: 'build_muscle' }

      await act(async () => {
        await result.current.handleSubmit(mockEvent, updates)
      })

      expect(mockOnError).toHaveBeenCalledWith('Failed to update profile')
      expect(result.current.error).toBe('Failed to update profile')
      expect(mockOnClose).not.toHaveBeenCalled()
      expect(result.current.isSubmitting).toBe(false)
    })

    it('should close modal without API call when no changes', async () => {
      const { result } = renderHook(() => useProfileFieldEditor(defaultOptions))

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
      const updates = {} // No changes

      await act(async () => {
        await result.current.handleSubmit(mockEvent, updates)
      })

      expect(mockUpdateProfile).not.toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it('should set isSubmitting to true during submission', async () => {
      let resolveUpdate: (value: FullUserProfile) => void
      const updatePromise = new Promise<FullUserProfile>((resolve) => {
        resolveUpdate = resolve
      })
      mockUpdateProfile.mockReturnValueOnce(updatePromise)

      const { result } = renderHook(() => useProfileFieldEditor(defaultOptions))

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
      const updates = { primary_goal: 'build_muscle' }

      act(() => {
        result.current.handleSubmit(mockEvent, updates)
      })

      // Should be submitting
      expect(result.current.isSubmitting).toBe(true)

      // Resolve the promise
      await act(async () => {
        resolveUpdate!({ id: '123' } as FullUserProfile)
        await updatePromise
      })

      // Should no longer be submitting
      expect(result.current.isSubmitting).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useProfileFieldEditor(defaultOptions))

      // Manually set error (simulating a previous failed submission)
      act(() => {
        result.current.handleSubmit(
          { preventDefault: jest.fn() } as unknown as React.FormEvent,
          { primary_goal: 'test' }
        )
      })

      // Clear error
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })

    it('should handle non-Error objects in catch block', async () => {
      mockUpdateProfile.mockRejectedValueOnce('String error')

      const { result } = renderHook(() => useProfileFieldEditor(defaultOptions))

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent

      await act(async () => {
        await result.current.handleSubmit(mockEvent, { primary_goal: 'test' })
      })

      expect(mockOnError).toHaveBeenCalledWith('Failed to update profile')
    })
  })

  describe('Custom Validation', () => {
    it('should run custom validation before submission', async () => {
      const mockValidate = jest.fn(() => 'Validation error')

      const { result } = renderHook(() =>
        useProfileFieldEditor({
          ...defaultOptions,
          validate: mockValidate,
        })
      )

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
      const updates = { primary_goal: 'build_muscle' }

      await act(async () => {
        await result.current.handleSubmit(mockEvent, updates)
      })

      expect(mockValidate).toHaveBeenCalledWith(updates)
      expect(mockOnError).toHaveBeenCalledWith('Validation error')
      expect(mockUpdateProfile).not.toHaveBeenCalled()
      expect(result.current.error).toBe('Validation error')
    })

    it('should proceed with submission when validation passes', async () => {
      const mockValidate = jest.fn(() => null) // No validation errors
      const updatedProfile = { id: '123' } as FullUserProfile
      mockUpdateProfile.mockResolvedValueOnce(updatedProfile)

      const { result } = renderHook(() =>
        useProfileFieldEditor({
          ...defaultOptions,
          validate: mockValidate,
        })
      )

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
      const updates = { primary_goal: 'build_muscle' }

      await act(async () => {
        await result.current.handleSubmit(mockEvent, updates)
      })

      expect(mockValidate).toHaveBeenCalledWith(updates)
      expect(mockUpdateProfile).toHaveBeenCalledWith(updates)
      expect(mockOnSuccess).toHaveBeenCalledWith(updatedProfile)
    })
  })

  describe('Edge Cases', () => {
    it('should filter out null and undefined values', async () => {
      const updatedProfile = { id: '123' } as FullUserProfile
      mockUpdateProfile.mockResolvedValueOnce(updatedProfile)

      const { result } = renderHook(() => useProfileFieldEditor(defaultOptions))

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
      const updates = {
        primary_goal: 'build_muscle',
        secondary_goal: null,
        fitness_notes: undefined,
      }

      await act(async () => {
        await result.current.handleSubmit(mockEvent, updates)
      })

      // Should only send primary_goal (null/undefined filtered out)
      expect(mockUpdateProfile).toHaveBeenCalledWith({ primary_goal: 'build_muscle' })
    })
  })
})

describe('buildUpdatesWithChangeDetection', () => {
  const mockProfile = {
    primary_goal: 'maintain',
    activity_level: 'sedentary',
    workout_frequency: 3,
    fitness_notes: 'Some notes',
  } as FullUserProfile

  it('should detect changed fields', () => {
    const newValues = {
      primary_goal: 'build_muscle', // Changed
      activity_level: 'sedentary', // Unchanged
      workout_frequency: 3, // Unchanged
    }

    const updates = buildUpdatesWithChangeDetection(mockProfile, newValues)

    expect(updates).toEqual({ primary_goal: 'build_muscle' })
  })

  it('should handle empty strings as undefined', () => {
    const newValues = {
      fitness_notes: '', // Empty string should be treated as undefined
    }

    const updates = buildUpdatesWithChangeDetection(mockProfile, newValues)

    // Empty string differs from 'Some notes', so it should be included
    expect(updates).toEqual({ fitness_notes: undefined })
  })

  it('should return empty object when nothing changed', () => {
    const newValues = {
      primary_goal: 'maintain',
      activity_level: 'sedentary',
      workout_frequency: 3,
    }

    const updates = buildUpdatesWithChangeDetection(mockProfile, newValues)

    expect(updates).toEqual({})
  })

  it('should handle numeric value changes', () => {
    const newValues = {
      workout_frequency: 5, // Changed from 3
    }

    const updates = buildUpdatesWithChangeDetection(mockProfile, newValues)

    expect(updates).toEqual({ workout_frequency: 5 })
  })
})

describe('validateRequiredFields', () => {
  it('should return null when all required fields present', () => {
    const updates = {
      primary_goal: 'build_muscle',
      activity_level: 'sedentary',
    }

    const error = validateRequiredFields(updates, ['primary_goal', 'activity_level'])

    expect(error).toBeNull()
  })

  it('should return error when required field missing', () => {
    const updates = {
      activity_level: 'sedentary',
    }

    const error = validateRequiredFields(updates, ['primary_goal', 'activity_level'])

    expect(error).toBe('Missing required fields: primary_goal')
  })

  it('should return error with multiple missing fields', () => {
    const updates = {}

    const error = validateRequiredFields(updates, ['primary_goal', 'activity_level'])

    expect(error).toBe('Missing required fields: primary_goal, activity_level')
  })

  it('should treat empty string as missing', () => {
    const updates = {
      primary_goal: '',
    }

    const error = validateRequiredFields(updates, ['primary_goal'])

    expect(error).toBe('Missing required fields: primary_goal')
  })
})

describe('validateNumericRange', () => {
  it('should return null when value in range', () => {
    const error = validateNumericRange(5, 1, 7, 'Workout Frequency')

    expect(error).toBeNull()
  })

  it('should return error when value below minimum', () => {
    const error = validateNumericRange(0, 1, 7, 'Workout Frequency')

    expect(error).toBe('Workout Frequency must be between 1 and 7')
  })

  it('should return error when value above maximum', () => {
    const error = validateNumericRange(10, 1, 7, 'Workout Frequency')

    expect(error).toBe('Workout Frequency must be between 1 and 7')
  })

  it('should allow boundary values', () => {
    expect(validateNumericRange(1, 1, 7, 'Test')).toBeNull()
    expect(validateNumericRange(7, 1, 7, 'Test')).toBeNull()
  })
})
