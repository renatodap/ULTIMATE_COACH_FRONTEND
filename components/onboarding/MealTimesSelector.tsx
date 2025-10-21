'use client'

import { useState } from 'react'
import { Clock, Plus, X, AlertCircle } from 'lucide-react'
import { MealTimingPreference } from '@/lib/api/onboarding'

interface MealTime {
  id: string
  name: string
  typical_time: string
  icon: string
}

// Common meal times (in production, fetch from API)
const COMMON_MEAL_TIMES: MealTime[] = [
  { id: 'breakfast', name: 'Breakfast', typical_time: '7:00 AM', icon: '🌅' },
  { id: 'morning-snack', name: 'Morning Snack', typical_time: '10:00 AM', icon: '🍎' },
  { id: 'lunch', name: 'Lunch', typical_time: '12:00 PM', icon: '🍽️' },
  { id: 'afternoon-snack', name: 'Afternoon Snack', typical_time: '3:00 PM', icon: '🥤' },
  { id: 'dinner', name: 'Dinner', typical_time: '6:00 PM', icon: '🌙' },
  { id: 'evening-snack', name: 'Evening Snack', typical_time: '9:00 PM', icon: '🍪' }
]

interface MealTimesSelectorProps {
  selectedMealTimes: MealTimingPreference[]
  onChange: (mealTimes: MealTimingPreference[]) => void
}

export default function MealTimesSelector({
  selectedMealTimes,
  onChange
}: MealTimesSelectorProps) {
  const [selectedForEdit, setSelectedForEdit] = useState<string | null>(null)

  // Check if meal time is selected
  const isSelected = (mealTimeId: string) => {
    return selectedMealTimes.some(m => m.meal_time_id === mealTimeId)
  }

  // Get preference for a meal time
  const getPreference = (mealTimeId: string) => {
    return selectedMealTimes.find(m => m.meal_time_id === mealTimeId)
  }

  // Toggle meal time selection
  const handleToggleMealTime = (mealTime: MealTime) => {
    const existing = getPreference(mealTime.id)

    if (existing) {
      // Remove
      onChange(selectedMealTimes.filter(m => m.meal_time_id !== mealTime.id))
      setSelectedForEdit(null)
    } else {
      // Add with defaults
      const newPreference: MealTimingPreference = {
        meal_time_id: mealTime.id,
        typical_portion_size: 'medium',
        flexibility_minutes: 30,
        is_non_negotiable: false
      }
      onChange([...selectedMealTimes, newPreference])
      setSelectedForEdit(mealTime.id)
    }
  }

  // Update preference
  const handleUpdatePreference = (
    mealTimeId: string,
    updates: Partial<MealTimingPreference>
  ) => {
    onChange(
      selectedMealTimes.map(m =>
        m.meal_time_id === mealTimeId ? { ...m, ...updates } : m
      )
    )
  }

  // Visual timeline representation
  const getTimelinePosition = (time: string): number => {
    // Convert time to hour (0-24)
    const [timeStr, period] = time.split(' ')
    let [hours, minutes] = timeStr.split(':').map(Number)

    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0

    const totalMinutes = hours * 60 + minutes
    return (totalMinutes / (24 * 60)) * 100
  }

  return (
    <div className="space-y-6">
      {/* Visual Timeline */}
      <div className="relative h-16 bg-iron-dark-gray rounded-lg overflow-hidden">
        {/* Time markers */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-iron-gray">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>12 AM</span>
        </div>

        {/* Selected meal time markers */}
        {selectedMealTimes.map(pref => {
          const mealTime = COMMON_MEAL_TIMES.find(m => m.id === pref.meal_time_id)
          if (!mealTime) return null

          const position = getTimelinePosition(mealTime.typical_time)

          return (
            <div
              key={mealTime.id}
              className="absolute top-0 bottom-0 flex items-center justify-center transition-all"
              style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
            >
              <div
                className={`px-2 py-1 rounded text-xs font-medium ${
                  pref.is_non_negotiable
                    ? 'bg-iron-orange text-iron-black'
                    : 'bg-iron-orange/60 text-iron-white'
                }`}
              >
                {mealTime.icon}
              </div>
            </div>
          )
        })}
      </div>

      {/* Meal Time Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COMMON_MEAL_TIMES.map(mealTime => {
          const selected = isSelected(mealTime.id)
          const pref = getPreference(mealTime.id)
          const showDetails = selectedForEdit === mealTime.id

          return (
            <div key={mealTime.id} className="space-y-2">
              {/* Card */}
              <button
                onClick={() => handleToggleMealTime(mealTime)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selected
                    ? 'bg-iron-orange/10 border-iron-orange'
                    : 'bg-iron-dark-gray border-iron-gray hover:border-iron-gray/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mealTime.icon}</span>
                    <div>
                      <div className="text-iron-white font-medium">{mealTime.name}</div>
                      <div className="text-sm text-iron-gray">{mealTime.typical_time}</div>
                    </div>
                  </div>
                  {selected && (
                    <div className="flex items-center gap-2">
                      {pref?.is_non_negotiable && (
                        <AlertCircle className="w-4 h-4 text-iron-orange" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedForEdit(showDetails ? null : mealTime.id)
                        }}
                        className="text-iron-orange hover:text-iron-orange/80 text-sm"
                      >
                        {showDetails ? 'Hide' : 'Edit'}
                      </button>
                    </div>
                  )}
                </div>
              </button>

              {/* Details */}
              {selected && showDetails && pref && (
                <div className="p-4 bg-iron-dark-gray border border-iron-gray rounded-lg space-y-4">
                  {/* Portion Size */}
                  <div>
                    <label className="block text-sm text-iron-gray mb-2">
                      Typical Portion Size
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['small', 'medium', 'large'] as const).map(size => (
                        <button
                          key={size}
                          onClick={() =>
                            handleUpdatePreference(mealTime.id, {
                              typical_portion_size: size
                            })
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pref.typical_portion_size === size
                              ? 'bg-iron-orange text-iron-black'
                              : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                          }`}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flexibility */}
                  <div>
                    <label className="block text-sm text-iron-gray mb-2">
                      Flexibility (± minutes)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[15, 30, 60, 120].map(minutes => (
                        <button
                          key={minutes}
                          onClick={() =>
                            handleUpdatePreference(mealTime.id, {
                              flexibility_minutes: minutes
                            })
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pref.flexibility_minutes === minutes
                              ? 'bg-iron-orange text-iron-black'
                              : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                          }`}
                        >
                          {minutes}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Non-Negotiable */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.is_non_negotiable}
                        onChange={(e) =>
                          handleUpdatePreference(mealTime.id, {
                            is_non_negotiable: e.target.checked
                          })
                        }
                        className="w-5 h-5 rounded border-iron-gray bg-iron-black text-iron-orange focus:ring-2 focus:ring-iron-orange focus:ring-offset-2 focus:ring-offset-iron-dark-gray"
                      />
                      <span className="text-sm text-iron-white flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        This time is non-negotiable
                      </span>
                    </label>
                    <p className="text-xs text-iron-gray mt-1 ml-7">
                      We'll prioritize workouts around this meal time
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {selectedMealTimes.length > 0 && (
        <div className="p-4 bg-iron-dark-gray/50 rounded-lg">
          <p className="text-sm text-iron-gray">
            <span className="text-iron-white font-medium">{selectedMealTimes.length}</span>{' '}
            meal times selected
            {selectedMealTimes.filter(m => m.is_non_negotiable).length > 0 && (
              <span>
                {' '}
                • <span className="text-iron-orange">{selectedMealTimes.filter(m => m.is_non_negotiable).length}</span> non-negotiable
              </span>
            )}
          </p>
        </div>
      )}

      {/* Empty State */}
      {selectedMealTimes.length === 0 && (
        <div className="text-center py-8 text-iron-gray">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select your typical meal times</p>
          <p className="text-sm mt-1">This helps us schedule workouts around your meals</p>
        </div>
      )}
    </div>
  )
}
