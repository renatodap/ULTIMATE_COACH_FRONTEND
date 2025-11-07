'use client'

/**
 * Edit Challenges/Difficulties Modal
 *
 * Allows users to update challenges they face with fitness/nutrition
 */

import { useState } from 'react'
import { X, Loader2, AlertCircle, Plus } from 'lucide-react'
import { type FullUserProfile } from '@/lib/api/profile'
import { useProfileFieldEditor, buildUpdatesWithChangeDetection } from '@/lib/hooks/useProfileFieldEditor'

interface EditChallengesModalProps {
  profile: FullUserProfile
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedProfile: FullUserProfile) => void
  onError: (error: string) => void
}

// Common challenges
const COMMON_CHALLENGES = [
  'Lack of motivation',
  'Time constraints',
  'Fatigue/Low energy',
  'Work schedule conflicts',
  'Family obligations',
  'Inconsistency',
  'Lack of knowledge',
  'Injury concerns',
  'Budget limitations',
  'Access to facilities',
  'Travel frequently',
  'Social pressure',
  'Stress management',
  'Sleep quality',
  'Meal planning',
  'Portion control',
  'Eating out too often',
  'Cravings',
]

export default function EditChallengesModal({
  profile,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: EditChallengesModalProps) {
  const [challenges, setChallenges] = useState<string[]>(profile.challenges || [])
  const [customChallenge, setCustomChallenge] = useState('')

  // Profile field editor hook (replaces manual submission logic)
  const { isSubmitting, handleSubmit: submitProfile } = useProfileFieldEditor({
    onSuccess,
    onError,
    onClose,
  })

  const handleToggleChallenge = (item: string) => {
    if (challenges.includes(item)) {
      setChallenges(challenges.filter(c => c !== item))
    } else {
      setChallenges([...challenges, item])
    }
  }

  const handleAddCustom = () => {
    const trimmed = customChallenge.trim()
    if (trimmed && !challenges.includes(trimmed)) {
      setChallenges([...challenges, trimmed])
      setCustomChallenge('')
    }
  }

  const handleRemoveChallenge = (item: string) => {
    setChallenges(challenges.filter(c => c !== item))
  }

  const handleSave = () => {
    // Build updates with automatic change detection
    const updates = buildUpdatesWithChangeDetection(profile, {
      challenges,
    })

    // Submit via hook (create synthetic event)
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent
    submitProfile(syntheticEvent, updates)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-iron-black/80 backdrop-blur-sm p-4">
      <div className="bg-iron-dark-gray border border-iron-gray rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-iron-dark-gray border-b border-iron-gray p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-iron-orange" />
            <h2 className="text-xl font-heading text-iron-white uppercase tracking-wider">Challenges & Obstacles</h2>
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
        <div className="p-4 sm:p-6 space-y-6">
          <p className="text-sm text-iron-gray">
            Select all challenges you currently face. This helps us provide support and strategies tailored to your situation.
          </p>

          {/* Common Challenges Grid */}
          <div>
            <h3 className="text-sm font-medium text-iron-white mb-3">Common Challenges</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_CHALLENGES.map((item) => (
                <button
                  key={item}
                  onClick={() => handleToggleChallenge(item)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    challenges.includes(item)
                      ? 'bg-iron-orange text-iron-black'
                      : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Add Custom Challenge */}
          <div>
            <h3 className="text-sm font-medium text-iron-white mb-3">Add Custom Challenge</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={customChallenge}
                onChange={(e) => setCustomChallenge(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                placeholder="Describe your challenge..."
                className="flex-1 px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:border-iron-orange"
              />
              <button
                onClick={handleAddCustom}
                disabled={!customChallenge.trim()}
                className="px-4 py-2 bg-iron-orange text-iron-black rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Selected Challenges (custom ones) */}
          {challenges.some(c => !COMMON_CHALLENGES.includes(c)) && (
            <div>
              <h3 className="text-sm font-medium text-iron-white mb-3">Custom Challenges</h3>
              <div className="flex flex-wrap gap-2">
                {challenges
                  .filter(c => !COMMON_CHALLENGES.includes(c))
                  .map((item) => (
                    <div
                      key={item}
                      className="px-3 py-2 bg-iron-orange/20 border border-iron-orange rounded-lg text-sm text-iron-white flex items-center gap-2"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveChallenge(item)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-iron-black/50 rounded-lg text-sm text-iron-gray">
            <span className="text-iron-white font-medium">{challenges.length}</span> challenge{challenges.length !== 1 ? 's' : ''} selected
          </div>
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
