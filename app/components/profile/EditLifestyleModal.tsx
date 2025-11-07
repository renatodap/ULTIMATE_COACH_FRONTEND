'use client'

/**
 * Edit Lifestyle Modal
 *
 * Allows users to update:
 * - Sleep Hours
 * - Stress Level
 */

import { useState } from 'react'
import { X, Loader2, Moon } from 'lucide-react'
import { type FullUserProfile } from '@/lib/api/profile'
import { useProfileFieldEditor, buildUpdatesWithChangeDetection } from '@/lib/hooks/useProfileFieldEditor'
import { STRESS_LEVEL_OPTIONS, VALIDATION_RULES } from '@/lib/constants/profile'

interface EditLifestyleModalProps {
  profile: FullUserProfile
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedProfile: FullUserProfile) => void
  onError: (error: string) => void
}

export default function EditLifestyleModal({
  profile,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: EditLifestyleModalProps) {
  const [sleepHours, setSleepHours] = useState(profile.sleep_hours?.toString() || '7')
  const [stressLevel, setStressLevel] = useState(profile.stress_level || 'medium')

  // Profile field editor hook (replaces manual submission logic)
  const { isSubmitting, handleSubmit: submitProfile } = useProfileFieldEditor({
    onSuccess,
    onError,
    onClose,
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Build updates with automatic change detection
    const updates = buildUpdatesWithChangeDetection(profile, {
      sleep_hours: parseFloat(sleepHours),
      stress_level: stressLevel,
    })

    // Submit via hook
    submitProfile(e, updates)
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
            <Moon className="w-5 h-5 text-iron-orange" />
            <h2 className="font-heading text-xl text-iron-white uppercase">Edit Lifestyle</h2>
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
          {/* Sleep Hours */}
          <div>
            <label htmlFor="sleepHours" className="block text-sm font-medium text-iron-white mb-2">
              Sleep Hours (per night)
            </label>
            <input
              type="number"
              id="sleepHours"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              min={VALIDATION_RULES.sleep_hours.min}
              max={VALIDATION_RULES.sleep_hours.max}
              step={VALIDATION_RULES.sleep_hours.step}
              className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
              placeholder="How many hours do you sleep per night?"
            />
            <p className="mt-2 text-xs text-iron-gray">
              Recommended: 7-9 hours for optimal recovery
            </p>
          </div>

          {/* Stress Level */}
          <div>
            <label htmlFor="stressLevel" className="block text-sm font-medium text-iron-white mb-2">
              Stress Level
            </label>
            <select
              id="stressLevel"
              value={stressLevel}
              onChange={(e) => setStressLevel(e.target.value as any)}
              className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
            >
              {STRESS_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-iron-gray">
              Stress affects recovery, sleep quality, and energy levels
            </p>
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
