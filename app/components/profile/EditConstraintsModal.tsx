'use client'

/**
 * Edit Constraints/Non-Negotiables Modal
 *
 * Allows users to update their non-negotiable constraints
 * Reuses ConstraintsForm from onboarding
 */

import { useState } from 'react'
import { X, Loader2, Shield } from 'lucide-react'
import { updateFullUserProfile, type FullUserProfile } from '@/lib/api/profile'
import ConstraintsForm from '@/components/onboarding/ConstraintsForm'
import type { NonNegotiableEntry } from '@/lib/api/onboarding'

interface EditConstraintsModalProps {
  profile: FullUserProfile
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedProfile: FullUserProfile) => void
  onError: (error: string) => void
}

export default function EditConstraintsModal({
  profile,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: EditConstraintsModalProps) {
  const [constraints, setConstraints] = useState<NonNegotiableEntry[]>(
    (profile.non_negotiables || []).map(c => ({
      constraint_type: c.constraint_type as NonNegotiableEntry['constraint_type'],
      description: c.description,
      reason: c.reason,
      excluded_exercise_ids: c.excluded_exercise_ids,
      excluded_food_ids: c.excluded_food_ids,
    }))
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updated = await updateFullUserProfile({ non_negotiables: constraints })
      onSuccess(updated)
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update constraints'
      onError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-iron-black/80 backdrop-blur-sm p-4">
      <div className="bg-iron-dark-gray border border-iron-gray rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-iron-dark-gray border-b border-iron-gray p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-iron-orange" />
            <h2 className="text-xl font-heading text-iron-white uppercase tracking-wider">Non-Negotiables</h2>
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
            Set constraints that must always be respected in your personalized plan. These are your non-negotiables.
          </p>

          <ConstraintsForm
            constraints={constraints}
            onChange={setConstraints}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-iron-dark-gray border-t border-iron-gray p-4 sm:p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-iron-gray/20 text-iron-white rounded-lg hover:bg-iron-gray/40 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-iron-orange text-iron-black font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
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
