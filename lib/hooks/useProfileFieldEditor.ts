/**
 * useProfileFieldEditor Hook
 *
 * Reusable hook for profile edit modals. Extracts common logic for:
 * - Form submission with change detection
 * - Loading/error state management
 * - API integration with updateFullUserProfile
 * - Success/error callbacks
 *
 * Benefits:
 * - Reduces code duplication across 12 profile modals
 * - Standardizes error handling
 * - Makes testing easier (test hook once, use everywhere)
 * - Improves type safety
 *
 * Usage:
 * ```typescript
 * const { isSubmitting, handleSubmit } = useProfileFieldEditor({
 *   onSuccess: (profile) => setProfile(profile),
 *   onError: (msg) => toast.error(msg),
 *   onClose: () => setIsOpen(false),
 * })
 *
 * const onSubmit = (e: React.FormEvent) => {
 *   handleSubmit(e, {
 *     primary_goal: primaryGoal,
 *     activity_level: activityLevel,
 *   })
 * }
 * ```
 */

import { useState, useCallback } from 'react'
import { updateFullUserProfile, type FullUserProfile } from '@/lib/api/profile'
import { ProfileUpdate, hasUpdates, filterEmptyUpdates } from '@/lib/types/profile'

// ============================================================================
// HOOK OPTIONS
// ============================================================================

export interface UseProfileFieldEditorOptions {
  /**
   * Called when update succeeds with the updated profile
   */
  onSuccess: (updatedProfile: FullUserProfile) => void

  /**
   * Called when update fails with error message
   */
  onError: (errorMessage: string) => void

  /**
   * Called to close the modal (after success or when no changes)
   */
  onClose: () => void

  /**
   * Optional: Custom validation before submission
   * Return error message if invalid, null if valid
   */
  validate?: (updates: Record<string, any>) => string | null
}

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

export interface UseProfileFieldEditorReturn {
  /**
   * True when API request is in flight
   */
  isSubmitting: boolean

  /**
   * Error message from last submission (null if no error)
   */
  error: string | null

  /**
   * Clear error state
   */
  clearError: () => void

  /**
   * Submit form with updates
   *
   * @param e - Form submit event
   * @param updates - Fields to update (only changed fields)
   *
   * Usage:
   * ```typescript
   * const onSubmit = (e: React.FormEvent) => {
   *   handleSubmit(e, {
   *     primary_goal: primaryGoal,
   *     activity_level: activityLevel,
   *   })
   * }
   * ```
   */
  handleSubmit: (
    e: React.FormEvent,
    updates: Record<string, any>
  ) => Promise<void>
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Profile field editor hook
 *
 * @param options - Hook configuration
 * @returns Hook methods and state
 */
export function useProfileFieldEditor(
  options: UseProfileFieldEditorOptions
): UseProfileFieldEditorReturn {
  const { onSuccess, onError, onClose, validate } = options

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent, updates: Record<string, any>) => {
      e.preventDefault()

      // Clear previous errors
      setError(null)

      // Filter out null/undefined values
      const filteredUpdates = filterEmptyUpdates(updates)

      // If no changes, just close
      if (!hasUpdates(filteredUpdates)) {
        onClose()
        return
      }

      // Optional validation
      if (validate) {
        const validationError = validate(filteredUpdates)
        if (validationError) {
          setError(validationError)
          onError(validationError)
          return
        }
      }

      // Submit to API
      setIsSubmitting(true)

      try {
        const updatedProfile = await updateFullUserProfile(filteredUpdates)
        onSuccess(updatedProfile)
        onClose()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update profile'
        setError(errorMessage)
        onError(errorMessage)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError, onClose, validate]
  )

  return {
    isSubmitting,
    error,
    clearError,
    handleSubmit,
  }
}

// ============================================================================
// UTILITY FUNCTIONS FOR CHANGE DETECTION
// ============================================================================

/**
 * Helper: Build updates object with change detection
 *
 * Only includes fields that changed from original profile.
 * Handles undefined/null normalization for comparison.
 *
 * @param originalProfile - Current profile state
 * @param newValues - New values to check
 * @returns Object with only changed fields
 *
 * Usage:
 * ```typescript
 * const updates = buildUpdatesWithChangeDetection(profile, {
 *   primary_goal: primaryGoal,
 *   activity_level: activityLevel,
 *   workout_frequency: parseInt(workoutFrequency),
 * })
 * ```
 */
export function buildUpdatesWithChangeDetection(
  originalProfile: FullUserProfile,
  newValues: Record<string, any>
): Record<string, any> {
  const updates: Record<string, any> = {}

  for (const [key, newValue] of Object.entries(newValues)) {
    const originalValue = (originalProfile as any)[key]

    // Normalize empty strings to undefined for comparison
    const normalizedNew = newValue === '' ? undefined : newValue
    const normalizedOriginal = originalValue === '' ? undefined : originalValue

    // Only include if changed
    if (normalizedNew !== normalizedOriginal) {
      updates[key] = normalizedNew
    }
  }

  return updates
}

/**
 * Helper: Validate required fields
 *
 * @param updates - Updates object to validate
 * @param requiredFields - Array of required field names
 * @returns Error message if validation fails, null if valid
 *
 * Usage:
 * ```typescript
 * const validate = (updates: Record<string, any>) => {
 *   return validateRequiredFields(updates, ['primary_goal', 'activity_level'])
 * }
 * ```
 */
export function validateRequiredFields(
  updates: Record<string, any>,
  requiredFields: string[]
): string | null {
  const missingFields = requiredFields.filter(
    (field) => !updates[field] || updates[field] === ''
  )

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`
  }

  return null
}

/**
 * Helper: Validate numeric range
 *
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param fieldName - Field name for error message
 * @returns Error message if invalid, null if valid
 *
 * Usage:
 * ```typescript
 * const validate = (updates: Record<string, any>) => {
 *   if (updates.workout_frequency) {
 *     return validateNumericRange(
 *       updates.workout_frequency,
 *       1,
 *       7,
 *       'Workout Frequency'
 *     )
 *   }
 *   return null
 * }
 * ```
 */
export function validateNumericRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): string | null {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`
  }
  return null
}
