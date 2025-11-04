'use client'

/**
 * Edit Physical Stats Modal
 *
 * Allows users to update:
 * - Age
 * - Height
 * - Current Weight
 * - Goal Weight
 *
 * Note: Biological sex is not editable as it's used for BMR calculations
 * and should not change after onboarding.
 */

import { useState, useMemo } from 'react'
import { X, Loader2, Scale } from 'lucide-react'
import { type FullUserProfile } from '@/lib/api/profile'
import { useProfileFieldEditor, buildUpdatesWithChangeDetection } from '@/lib/hooks/useProfileFieldEditor'
import {
  displayWeight,
  displayHeight,
  weightToKg,
  weightFromKg,
  heightToCm,
  heightFromCm,
  getWeightConstraints,
  getHeightConstraints,
  type UnitSystem,
} from '@/lib/utils/units'

interface EditPhysicalStatsModalProps {
  profile: FullUserProfile
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedProfile: FullUserProfile) => void
  onError: (error: string) => void
}

export default function EditPhysicalStatsModal({
  profile,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: EditPhysicalStatsModalProps) {
  const unitSystem: UnitSystem = (profile.unit_system as UnitSystem) || 'metric'
  const [age, setAge] = useState(profile.age?.toString() || '')
  // Height state
  const [heightCm, setHeightCm] = useState(profile.height_cm?.toString() || '') // used for metric view
  const imperialHeight = useMemo(() => (
    profile.height_cm ? (heightFromCm(profile.height_cm, 'imperial') as { feet: number; inches: number }) : { feet: 0, inches: 0 }
  ), [profile.height_cm])
  const [heightFeet, setHeightFeet] = useState(imperialHeight.feet ? String(imperialHeight.feet) : '')
  const [heightInches, setHeightInches] = useState(imperialHeight.inches ? String(imperialHeight.inches) : '')
  // Weight state (displayed in preferred unit)
  const [currentWeightDisplay, setCurrentWeightDisplay] = useState(() => {
    if (profile.current_weight_kg == null) return ''
    const v = weightFromKg(profile.current_weight_kg, unitSystem)
    return String(v)
  })
  const [goalWeightDisplay, setGoalWeightDisplay] = useState(() => {
    if (profile.goal_weight_kg == null) return ''
    const v = weightFromKg(profile.goal_weight_kg, unitSystem)
    return String(v)
  })

  // Profile field editor hook (replaces manual submission logic)
  const { isSubmitting, handleSubmit: submitProfile } = useProfileFieldEditor({
    onSuccess,
    onError,
    onClose,
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Calculate height in cm
    let heightCmValue: number | undefined
    if (unitSystem === 'imperial') {
      const feet = parseInt(heightFeet || '0', 10)
      const inches = parseInt(heightInches || '0', 10)
      const cm = heightToCm({ feet, inches }, 'imperial')
      if (!isNaN(cm)) {
        heightCmValue = cm
      }
    } else {
      if (heightCm) {
        const cm = parseFloat(heightCm)
        if (!isNaN(cm)) {
          heightCmValue = cm
        }
      }
    }

    // Calculate weights in kg
    let currentWeightKg: number | undefined
    if (currentWeightDisplay) {
      const current = parseFloat(currentWeightDisplay)
      currentWeightKg = unitSystem === 'imperial' ? weightToKg(current, 'imperial') : current
      if (isNaN(currentWeightKg)) {
        currentWeightKg = undefined
      }
    }

    let goalWeightKg: number | undefined
    if (goalWeightDisplay) {
      const gw = parseFloat(goalWeightDisplay)
      goalWeightKg = unitSystem === 'imperial' ? weightToKg(gw, 'imperial') : gw
      if (isNaN(goalWeightKg)) {
        goalWeightKg = undefined
      }
    }

    // Build updates with automatic change detection
    const updates = buildUpdatesWithChangeDetection(profile, {
      age: age ? parseInt(age) : undefined,
      height_cm: heightCmValue,
      current_weight_kg: currentWeightKg,
      goal_weight_kg: goalWeightKg,
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
            <Scale className="w-5 h-5 text-iron-orange" />
            <h2 className="font-heading text-xl text-iron-white uppercase">Edit Physical Stats</h2>
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
              Changes to physical stats will automatically recalculate your macro targets.
            </p>
          </div>

          {/* Age */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-iron-white mb-2">
              Age (years)
            </label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="13"
              max="120"
              className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
              placeholder="Enter your age"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-iron-white mb-2">
              Height ({unitSystem === 'imperial' ? 'ft/in' : 'cm'})
            </label>
            {unitSystem === 'imperial' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="number"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    min={getHeightConstraints('imperial').minFeet}
                    max={getHeightConstraints('imperial').maxFeet}
                    className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
                    placeholder="Feet"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-iron-gray">ft</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    min={getHeightConstraints('imperial').minInches}
                    max={getHeightConstraints('imperial').maxInches}
                    className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
                    placeholder="Inches"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-iron-gray">in</span>
                </div>
              </div>
            ) : (
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                min="100"
                max="300"
                step="1"
                className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
                placeholder="Enter your height"
              />
            )}
          </div>

          {/* Current Weight */}
          <div>
            <label htmlFor="currentWeight" className="block text-sm font-medium text-iron-white mb-2">
              Current Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})
            </label>
            <input
              type="number"
              id="currentWeight"
              value={currentWeightDisplay}
              onChange={(e) => setCurrentWeightDisplay(e.target.value)}
              min={getWeightConstraints(unitSystem).min}
              max={getWeightConstraints(unitSystem).max}
              step={getWeightConstraints(unitSystem).step}
              className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
              placeholder="Enter your current weight"
            />
          </div>

          {/* Goal Weight */}
          <div>
            <label htmlFor="goalWeight" className="block text-sm font-medium text-iron-white mb-2">
              Goal Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})
            </label>
            <input
              type="number"
              id="goalWeight"
              value={goalWeightDisplay}
              onChange={(e) => setGoalWeightDisplay(e.target.value)}
              min={getWeightConstraints(unitSystem).min}
              max={getWeightConstraints(unitSystem).max}
              step={getWeightConstraints(unitSystem).step}
              className="w-full px-4 py-4 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange transition-colors rounded-lg"
              placeholder="Enter your goal weight"
            />
          </div>

          {/* Biological Sex (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-iron-gray mb-2">
              Biological Sex (cannot be changed)
            </label>
            <div className="px-4 py-4 bg-iron-gray/10 border border-iron-gray/30 text-iron-gray rounded-lg">
              {profile.biological_sex ? profile.biological_sex.charAt(0).toUpperCase() + profile.biological_sex.slice(1) : 'Not set'}
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
