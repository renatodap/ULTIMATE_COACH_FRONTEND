'use client'

import { useState } from 'react'
import { Plus, X, Shield, AlertCircle } from 'lucide-react'
import { NonNegotiableEntry } from '@/lib/api/onboarding'

interface ConstraintsFormProps {
  constraints: NonNegotiableEntry[]
  onChange: (constraints: NonNegotiableEntry[]) => void
}

const CONSTRAINT_TYPES = [
  { value: 'rest_days', label: 'Rest Days', icon: '😴' },
  { value: 'meal_timing', label: 'Meal Timing', icon: '⏰' },
  { value: 'equipment', label: 'Equipment Limitations', icon: '🏋️' },
  { value: 'exercises_excluded', label: 'Excluded Exercises', icon: '🚫' },
  { value: 'foods_excluded', label: 'Excluded Foods', icon: '🍎' },
  { value: 'time_blocks', label: 'Unavailable Times', icon: '📅' },
  { value: 'social', label: 'Social Commitments', icon: '👥' },
  { value: 'religious', label: 'Religious Practices', icon: '🙏' },
  { value: 'medical', label: 'Medical Restrictions', icon: '⚕️' },
  { value: 'other', label: 'Other', icon: '❓' }
] as const

export default function ConstraintsForm({
  constraints,
  onChange
}: ConstraintsFormProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<NonNegotiableEntry>({
    constraint_type: 'rest_days',
    description: ''
  })

  const handleAddConstraint = () => {
    if (!formData.description.trim()) return

    onChange([...constraints, formData])
    setFormData({ constraint_type: 'rest_days', description: '' })
    setShowAddForm(false)
  }

  const handleUpdateConstraint = (index: number) => {
    onChange(constraints.map((c, i) => (i === index ? formData : c)))
    setEditingIndex(null)
    setFormData({ constraint_type: 'rest_days', description: '' })
  }

  const handleRemoveConstraint = (index: number) => {
    onChange(constraints.filter((_, i) => i !== index))
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setFormData({ ...constraints[index] })
    setShowAddForm(false)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingIndex(null)
    setFormData({ constraint_type: 'rest_days', description: '' })
  }

  const getConstraintType = (type: NonNegotiableEntry['constraint_type']) => {
    return CONSTRAINT_TYPES.find(t => t.value === type) || CONSTRAINT_TYPES[0]
  }

  return (
    <div className="space-y-4">
      {/* Existing Constraints */}
      {constraints.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-iron-white font-medium">Non-Negotiables ({constraints.length})</h3>
          {constraints.map((constraint, index) => {
            const type = getConstraintType(constraint.constraint_type)
            return (
              <div
                key={index}
                className="p-4 bg-iron-dark-gray border border-iron-orange rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      <span className="text-sm font-medium text-iron-orange">
                        {type.label}
                      </span>
                    </div>
                    <p className="text-iron-white">{constraint.description}</p>
                    {constraint.reason && (
                      <p className="text-sm text-iron-gray mt-2">
                        <span className="font-medium">Reason:</span> {constraint.reason}
                      </p>
                    )}
                    {constraint.excluded_exercise_ids && constraint.excluded_exercise_ids.length > 0 && (
                      <p className="text-sm text-iron-gray mt-2">
                        {constraint.excluded_exercise_ids.length} exercise(s) excluded
                      </p>
                    )}
                    {constraint.excluded_food_ids && constraint.excluded_food_ids.length > 0 && (
                      <p className="text-sm text-iron-gray mt-2">
                        {constraint.excluded_food_ids.length} food(s) excluded
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(index)}
                      className="text-iron-orange hover:text-iron-orange/80 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveConstraint(index)}
                      className="text-iron-gray hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingIndex !== null) && (
        <div className="p-4 bg-iron-dark-gray border-2 border-iron-orange rounded-lg space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-iron-orange" />
            <h3 className="text-iron-white font-medium">
              {editingIndex !== null ? 'Edit Non-Negotiable' : 'Add Non-Negotiable'}
            </h3>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONSTRAINT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData({ ...formData, constraint_type: type.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.constraint_type === type.value
                      ? 'bg-iron-orange text-iron-black'
                      : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                  }`}
                >
                  <span className="mr-1">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">
              Description <span className="text-iron-orange">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your non-negotiable constraint..."
              rows={3}
              className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange resize-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">
              Reason (optional, but helpful)
            </label>
            <input
              type="text"
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value || undefined })}
              placeholder="Why is this non-negotiable?"
              className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={
                editingIndex !== null
                  ? () => handleUpdateConstraint(editingIndex)
                  : handleAddConstraint
              }
              disabled={!formData.description.trim()}
              className="flex-1 px-4 py-2 bg-iron-orange text-iron-black font-medium rounded-lg hover:bg-iron-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingIndex !== null ? 'Update' : 'Add Non-Negotiable'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-iron-gray/20 text-iron-white rounded-lg hover:bg-iron-gray/40 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!showAddForm && editingIndex === null && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full px-4 py-3 bg-iron-dark-gray border border-iron-gray rounded-lg text-iron-white hover:bg-iron-gray/20 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Non-Negotiable
        </button>
      )}

      {/* Empty State */}
      {constraints.length === 0 && !showAddForm && editingIndex === null && (
        <div className="text-center py-8 text-iron-gray">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No non-negotiables set yet</p>
          <p className="text-sm mt-1">Add constraints that must be respected in your plan</p>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-iron-orange/10 border border-iron-orange/30 rounded-lg text-sm text-iron-gray">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-iron-orange flex-shrink-0 mt-0.5" />
          <p>
            Non-negotiables are constraints we'll always respect when creating your personalized plan.
            Be specific about what can't be changed.
          </p>
        </div>
      </div>
    </div>
  )
}
