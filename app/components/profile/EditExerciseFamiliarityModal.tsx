'use client'

/**
 * Edit Exercise Familiarity Modal
 *
 * Allows users to update their exercise familiarity and comfort levels
 * Reuses ExerciseSearchSelector from onboarding
 */

import { useState } from 'react'
import { X, Loader2, Dumbbell } from 'lucide-react'
import { type FullUserProfile } from '@/lib/api/profile'
import { useProfileFieldEditor, buildUpdatesWithChangeDetection } from '@/lib/hooks/useProfileFieldEditor'
import ExerciseSearchSelector from '@/components/onboarding/ExerciseSearchSelector'
import type { ExerciseFamiliarityEntry } from '@/lib/api/onboarding'

interface EditExerciseFamiliarityModalProps {
  profile: FullUserProfile
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedProfile: FullUserProfile) => void
  onError: (error: string) => void
}

export default function EditExerciseFamiliarityModal({
  profile,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: EditExerciseFamiliarityModalProps) {
  const [exercises, setExercises] = useState<ExerciseFamiliarityEntry[]>(
    (profile.exercise_familiarity || []).map(ex => ({
      exercise_id: ex.exercise_id,
      comfort_level: ex.comfort_level,
      typical_weight_kg: ex.typical_weight_kg,
      typical_reps: ex.typical_reps,
      typical_duration_minutes: ex.typical_duration_minutes,
      frequency: ex.frequency,
      enjoys_it: ex.enjoys_it,
    }))
  )

  // Profile field editor hook (replaces manual submission logic)
  const { isSubmitting, handleSubmit: submitProfile } = useProfileFieldEditor({
    onSuccess,
    onError,
    onClose,
  })

  const handleSave = () => {
    // Build updates with automatic change detection
    const updates = buildUpdatesWithChangeDetection(profile, {
      exercise_familiarity: exercises,
    })

    // Submit via hook
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent
    submitProfile(syntheticEvent, updates)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-iron-black/80 backdrop-blur-sm p-4">
      <div className="bg-iron-dark-gray border border-iron-gray rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-iron-dark-gray border-b border-iron-gray p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-5 h-5 text-iron-orange" />
            <h2 className="text-xl font-heading text-iron-white uppercase tracking-wider">Exercise Familiarity</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-iron-gray/20 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-iron-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-sm text-iron-gray mb-6">
            Tell us about exercises you&apos;re familiar with. This helps us create workouts tailored to your experience.
          </p>

          <ExerciseSearchSelector
            selectedExercises={exercises}
            onChange={setExercises}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-iron-dark-gray border-t border-iron-gray p-4 sm:p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-iron-gray/20 text-iron-white rounded-lg hover:bg-iron-gray/40 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-iron-orange text-iron-black font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
