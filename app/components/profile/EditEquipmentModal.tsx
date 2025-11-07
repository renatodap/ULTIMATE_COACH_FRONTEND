'use client'

/**
 * Edit Equipment Access Modal
 *
 * Allows users to update their available gym equipment
 */

import { useState } from 'react'
import { X, Loader2, Dumbbell, Plus } from 'lucide-react'
import { type FullUserProfile } from '@/lib/api/profile'
import { useProfileFieldEditor, buildUpdatesWithChangeDetection } from '@/lib/hooks/useProfileFieldEditor'

interface EditEquipmentModalProps {
  profile: FullUserProfile
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedProfile: FullUserProfile) => void
  onError: (error: string) => void
}

// Common gym equipment
const COMMON_EQUIPMENT = [
  'Barbell',
  'Dumbbells',
  'Kettlebells',
  'Resistance Bands',
  'Pull-up Bar',
  'Bench',
  'Squat Rack',
  'Cable Machine',
  'Leg Press',
  'Treadmill',
  'Stationary Bike',
  'Rowing Machine',
  'Jump Rope',
  'Yoga Mat',
  'Foam Roller',
  'Medicine Ball',
  'TRX Straps',
  'Battle Ropes',
  'Plyo Box',
  'Sandbag',
]

export default function EditEquipmentModal({
  profile,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: EditEquipmentModalProps) {
  const [equipment, setEquipment] = useState<string[]>(profile.equipment_access || [])
  const [customEquipment, setCustomEquipment] = useState('')

  // Profile field editor hook (replaces manual submission logic)
  const { isSubmitting, handleSubmit: submitProfile } = useProfileFieldEditor({
    onSuccess,
    onError,
    onClose,
  })

  const handleToggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter(e => e !== item))
    } else {
      setEquipment([...equipment, item])
    }
  }

  const handleAddCustom = () => {
    const trimmed = customEquipment.trim()
    if (trimmed && !equipment.includes(trimmed)) {
      setEquipment([...equipment, trimmed])
      setCustomEquipment('')
    }
  }

  const handleRemoveEquipment = (item: string) => {
    setEquipment(equipment.filter(e => e !== item))
  }

  const handleSave = () => {
    // Build updates with automatic change detection
    const updates = buildUpdatesWithChangeDetection(profile, {
      equipment_access: equipment,
    })

    // Submit via hook
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
            <Dumbbell className="w-5 h-5 text-iron-orange" />
            <h2 className="text-xl font-heading text-iron-white uppercase tracking-wider">Equipment Access</h2>
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
            Select all equipment you have access to. This helps us create workouts tailored to your available resources.
          </p>

          {/* Common Equipment Grid */}
          <div>
            <h3 className="text-sm font-medium text-iron-white mb-3">Common Equipment</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_EQUIPMENT.map((item) => (
                <button
                  key={item}
                  onClick={() => handleToggleEquipment(item)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    equipment.includes(item)
                      ? 'bg-iron-orange text-iron-black'
                      : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Add Custom Equipment */}
          <div>
            <h3 className="text-sm font-medium text-iron-white mb-3">Add Custom Equipment</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={customEquipment}
                onChange={(e) => setCustomEquipment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                placeholder="E.g., Hex Bar, Landmine..."
                className="flex-1 px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:border-iron-orange"
              />
              <button
                onClick={handleAddCustom}
                disabled={!customEquipment.trim()}
                className="px-4 py-2 bg-iron-orange text-iron-black rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Selected Equipment (custom ones) */}
          {equipment.some(e => !COMMON_EQUIPMENT.includes(e)) && (
            <div>
              <h3 className="text-sm font-medium text-iron-white mb-3">Custom Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {equipment
                  .filter(e => !COMMON_EQUIPMENT.includes(e))
                  .map((item) => (
                    <div
                      key={item}
                      className="px-3 py-2 bg-iron-orange/20 border border-iron-orange rounded-lg text-sm text-iron-white flex items-center gap-2"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveEquipment(item)}
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
            <span className="text-iron-white font-medium">{equipment.length}</span> equipment item{equipment.length !== 1 ? 's' : ''} selected
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
