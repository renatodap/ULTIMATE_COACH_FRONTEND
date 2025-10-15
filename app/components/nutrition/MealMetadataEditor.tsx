'use client'

/**
 * MealMetadataEditor Component
 *
 * Allows editing meal metadata (name, type, notes).
 * Used in the meal edit page.
 */

import { useState } from 'react'

interface MealMetadataEditorProps {
  initialName?: string | null
  initialMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
  initialNotes?: string | null
  onChange: (metadata: {
    name?: string | null
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
    notes?: string | null
  }) => void
}

const mealTypeOptions = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '🍽️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍪' },
  { value: 'other', label: 'Other', icon: '🍴' },
] as const

export default function MealMetadataEditor({
  initialName,
  initialMealType,
  initialNotes,
  onChange
}: MealMetadataEditorProps) {
  const [name, setName] = useState(initialName || '')
  const [mealType, setMealType] = useState<typeof initialMealType>(initialMealType)
  const [notes, setNotes] = useState(initialNotes || '')

  const handleNameChange = (newName: string) => {
    setName(newName)
    onChange({ name: newName || null, meal_type: mealType, notes: notes || null })
  }

  const handleMealTypeChange = (newType: typeof initialMealType) => {
    setMealType(newType)
    onChange({ name: name || null, meal_type: newType, notes: notes || null })
  }

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes)
    onChange({ name: name || null, meal_type: mealType, notes: newNotes || null })
  }

  return (
    <div className="space-y-2">
      {/* Meal Name Input */}
      <div>
        <label
          htmlFor="meal-name"
          className="block text-xs font-medium text-iron-gray uppercase tracking-wider mb-1"
        >
          Meal Name (Optional)
        </label>
        <input
          id="meal-name"
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g., Post-Workout Meal"
          className="w-full bg-iron-dark-gray border border-iron-gray text-iron-white px-2 py-1.5 text-sm focus:border-iron-orange focus:outline-none transition-colors"
        />
      </div>

      {/* Meal Type Selector */}
      <div>
        <label className="block text-xs font-medium text-iron-gray uppercase tracking-wider mb-1">
          Meal Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {mealTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleMealTypeChange(option.value)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 border-2 transition-all active:scale-95 ${
                mealType === option.value
                  ? 'border-iron-orange bg-iron-orange/10 text-iron-orange'
                  : 'border-iron-gray hover:border-iron-orange/50 text-iron-white'
              }`}
            >
              <span className="text-lg">{option.icon}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes Textarea */}
      <div>
        <label
          htmlFor="meal-notes"
          className="block text-xs font-medium text-iron-gray uppercase tracking-wider mb-1"
        >
          Notes (Optional)
        </label>
        <textarea
          id="meal-notes"
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add any notes..."
          rows={1}
          className="w-full bg-iron-dark-gray border border-iron-gray text-iron-white px-2 py-1.5 text-sm focus:border-iron-orange focus:outline-none transition-colors resize-none"
        />
      </div>
    </div>
  )
}
