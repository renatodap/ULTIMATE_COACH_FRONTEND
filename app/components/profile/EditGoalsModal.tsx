'use client'

/**
 * Edit Goals & Training Modal
 *
 * Allows users to update:
 * - Primary Goal
 * - Secondary Goal (optional)
 * - Experience Level
 * - Activity Level
 * - Workout Frequency
 * - Fitness Notes (optional)
 */

import { useState } from 'react'
import { X, Loader2, Target } from 'lucide-react'
import { updateFullUserProfile, type FullUserProfile } from '@/lib/api/profile'

interface EditGoalsModalProps {
  profile: FullUserProfile
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedProfile: FullUserProfile) => void
  onError: (error: string) => void
}

export default function EditGoalsModal({
  profile,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: EditGoalsModalProps) {
  const [primaryGoal, setPrimaryGoal] = useState(profile.primary_goal || 'maintain')
  const [secondaryGoal, setSecondaryGoal] = useState(profile.secondary_goal || '')
  const [experienceLevel, setExperienceLevel] = useState(profile.experience_level || 'beginner')
  const [activityLevel, setActivityLevel] = useState(profile.activity_level || 'sedentary')
  const [workoutFrequency, setWorkoutFrequency] = useState(profile.workout_frequency?.toString() || '3')
  const [fitnessNotes, setFitnessNotes] = useState(profile.fitness_notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updates: any = {}

      if (primaryGoal !== profile.primary_goal) {
        updates.primary_goal = primaryGoal
      }
      if (secondaryGoal !== profile.secondary_goal) {
        updates.secondary_goal = secondaryGoal || undefined
      }
      if (experienceLevel !== profile.experience_level) {
        updates.experience_level = experienceLevel
      }
      if (activityLevel !== profile.activity_level) {
        updates.activity_level = activityLevel
      }
      if (parseInt(workoutFrequency) !== profile.workout_frequency) {
        updates.workout_frequency = parseInt(workoutFrequency)
      }
      if (fitnessNotes !== (profile.fitness_notes || '')) {
        updates.fitness_notes = fitnessNotes || undefined
      }

      if (Object.keys(updates).length === 0) {
        onClose()
        return
      }

      const updatedProfile = await updateFullUserProfile(updates)
      onSuccess(updatedProfile)
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update goals'
      onError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-iron-dark-gray border border-iron-gray max-w-md w-full max-h-[90vh] overflow-y-auto rounded-xl">
        {/* Header */}
        <div className="sticky top-0 bg-iron-dark-gray border-b border-iron-gray p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-iron-orange" />
            <h2 className="font-heading text-xl text-iron-white uppercase">Edit Goals & Training</h2>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-iron-gray/20 transition-colors rounded-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-iron-gray" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Message */}
          <div className="p-3 bg-iron-orange/10 border border-iron-orange/30 rounded-lg">
            <p className="text-sm text-iron-white">
              Changes to your goals and activity level will automatically recalculate your macro targets.
            </p>
          </div>

          {/* Primary Goal */}
          <div>
            <label htmlFor="primaryGoal" className="block text-sm font-medium text-iron-white mb-2">
              Primary Goal
            </label>
            <select
              id="primaryGoal"
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value as any)}
              className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
            >
              <option value="lose_weight">Lose Weight</option>
              <option value="build_muscle">Build Muscle</option>
              <option value="maintain">Maintain</option>
              <option value="improve_performance">Improve Performance</option>
            </select>
          </div>

          {/* Secondary Goal */}
          <div>
            <label htmlFor="secondaryGoal" className="block text-sm font-medium text-iron-white mb-2">
              Secondary Goal <span className="text-iron-gray text-xs">(optional)</span>
            </label>
            <select
              id="secondaryGoal"
              value={secondaryGoal}
              onChange={(e) => setSecondaryGoal(e.target.value as any)}
              className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
            >
              <option value="">None</option>
              {['lose_weight', 'build_muscle', 'maintain', 'improve_performance']
                .filter(goal => goal !== primaryGoal)
                .map(goal => (
                  <option key={goal} value={goal}>
                    {goal === 'lose_weight' ? 'Lose Weight' :
                     goal === 'build_muscle' ? 'Build Muscle' :
                     goal === 'maintain' ? 'Maintain' :
                     'Improve Performance'}
                  </option>
                ))
              }
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-iron-white mb-2">
              Experience Level
            </label>
            <select
              id="experienceLevel"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
              className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Activity Level */}
          <div>
            <label htmlFor="activityLevel" className="block text-sm font-medium text-iron-white mb-2">
              Activity Level
            </label>
            <select
              id="activityLevel"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
            >
              <option value="sedentary">Sedentary (desk job, little exercise)</option>
              <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
              <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
              <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
              <option value="extremely_active">Extremely Active (hard exercise 2x/day or physical job)</option>
            </select>
          </div>

          {/* Workout Frequency */}
          <div>
            <label htmlFor="workoutFrequency" className="block text-sm font-medium text-iron-white mb-2">
              Workout Frequency (days per week)
            </label>
            <input
              type="number"
              id="workoutFrequency"
              value={workoutFrequency}
              onChange={(e) => setWorkoutFrequency(e.target.value)}
              min="0"
              max="7"
              className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
              placeholder="How many days per week do you workout?"
            />
          </div>

          {/* Fitness Notes */}
          <div>
            <label htmlFor="fitnessNotes" className="block text-sm font-medium text-iron-white mb-2">
              Fitness Considerations <span className="text-iron-gray text-xs">(optional)</span>
            </label>
            <textarea
              id="fitnessNotes"
              value={fitnessNotes}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= 1000) {
                  setFitnessNotes(value)
                }
              }}
              rows={4}
              className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors resize-none rounded-lg"
              placeholder="Any injuries, preferences, or fitness considerations we should know about?"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-iron-gray">
                Share any relevant context that might help personalize your experience
              </p>
              <p className={`text-xs ${fitnessNotes.length > 900 ? 'text-iron-orange' : 'text-iron-gray'}`}>
                {1000 - fitnessNotes.length} characters remaining
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 min-h-[48px] px-6 py-4 border border-iron-gray text-iron-white font-heading uppercase tracking-wider hover:bg-iron-gray/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 min-h-[48px] px-6 py-4 bg-iron-orange text-iron-black font-heading uppercase tracking-wider hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg"
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
        </form>
      </div>
    </div>
  )
}
