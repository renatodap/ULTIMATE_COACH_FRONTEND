'use client'

import { useState, useEffect } from 'react'
import { Search, X, Dumbbell } from 'lucide-react'
import { ExerciseFamiliarityEntry } from '@/lib/api/onboarding'
import { apiClient } from '@/lib/api/client'

interface Exercise {
  id: string
  name: string
  category?: string
  description?: string
}

interface ExerciseSearchSelectorProps {
  selectedExercises: ExerciseFamiliarityEntry[]
  onChange: (exercises: ExerciseFamiliarityEntry[]) => void
}

export default function ExerciseSearchSelector({
  selectedExercises,
  onChange
}: ExerciseSearchSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Exercise[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await apiClient.get<Exercise[]>(
          `/api/v1/exercises/search?q=${encodeURIComponent(searchQuery)}&limit=20`
        )
        setSearchResults(results)
      } catch (error) {
        console.error('Failed to search exercises:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSelectExercise = (exercise: Exercise) => {
    // Check if already selected
    const existing = selectedExercises.find(e => e.exercise_id === exercise.id)
    if (existing) return

    // Add with default values
    const newEntry: ExerciseFamiliarityEntry = {
      exercise_id: exercise.id,
      comfort_level: 3, // Default to middle comfort
      enjoys_it: true
    }

    onChange([...selectedExercises, newEntry])
    setSearchQuery('')
    setSearchResults([])
  }

  const handleRemoveExercise = (exerciseId: string) => {
    onChange(selectedExercises.filter(e => e.exercise_id !== exerciseId))
  }

  const handleUpdateComfort = (exerciseId: string, comfort: number) => {
    onChange(
      selectedExercises.map(e =>
        e.exercise_id === exerciseId ? { ...e, comfort_level: comfort } : e
      )
    )
  }

  const handleUpdateFrequency = (
    exerciseId: string,
    frequency: ExerciseFamiliarityEntry['frequency']
  ) => {
    onChange(
      selectedExercises.map(e =>
        e.exercise_id === exerciseId ? { ...e, frequency } : e
      )
    )
  }

  const handleUpdateEnjoyment = (exerciseId: string, enjoys: boolean) => {
    onChange(
      selectedExercises.map(e =>
        e.exercise_id === exerciseId ? { ...e, enjoys_it: enjoys } : e
      )
    )
  }

  const handleUpdateMetrics = (
    exerciseId: string,
    field: 'typical_weight_kg' | 'typical_reps' | 'typical_duration_minutes',
    value: number | undefined
  ) => {
    onChange(
      selectedExercises.map(e =>
        e.exercise_id === exerciseId ? { ...e, [field]: value } : e
      )
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-iron-gray">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search exercises (squats, bench press, etc.)..."
          className="w-full pl-10 pr-4 py-3 bg-iron-dark-gray border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-iron-orange border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-iron-dark-gray border border-iron-gray rounded-lg divide-y divide-iron-gray max-h-64 overflow-y-auto">
          {searchResults.map((exercise) => {
            const isSelected = selectedExercises.some(e => e.exercise_id === exercise.id)
            return (
              <button
                key={exercise.id}
                onClick={() => handleSelectExercise(exercise)}
                disabled={isSelected}
                className="w-full px-4 py-3 text-left hover:bg-iron-gray/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-5 h-5 text-iron-gray flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-iron-white font-medium">{exercise.name}</div>
                    {exercise.category && (
                      <div className="text-xs text-iron-gray mt-0.5">{exercise.category}</div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="text-iron-orange text-sm">Added</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Selected Exercises */}
      {selectedExercises.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-iron-white font-medium">
            Selected Exercises ({selectedExercises.length})
          </h3>
          {selectedExercises.map((entry) => (
            <div
              key={entry.exercise_id}
              className="p-4 bg-iron-dark-gray border border-iron-gray rounded-lg space-y-3"
            >
              {/* Header with remove button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-iron-gray" />
                  <span className="text-iron-white font-medium">Exercise</span>
                </div>
                <button
                  onClick={() => handleRemoveExercise(entry.exercise_id)}
                  className="text-iron-gray hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comfort Level (1-5) */}
              <div className="space-y-2">
                <label className="text-sm text-iron-gray">
                  Comfort Level (1 = Uncomfortable, 5 = Mastered)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleUpdateComfort(entry.exercise_id, level)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        entry.comfort_level === level
                          ? 'bg-iron-orange text-iron-black'
                          : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <label className="text-sm text-iron-gray">How Often?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['rarely', 'occasionally', 'regularly', 'frequently'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => handleUpdateFrequency(entry.exercise_id, freq)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        entry.frequency === freq
                          ? 'bg-iron-orange text-iron-black'
                          : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                      }`}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enjoyment */}
              <div className="space-y-2">
                <label className="text-sm text-iron-gray">Do you enjoy this exercise?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateEnjoyment(entry.exercise_id, true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      entry.enjoys_it === true
                        ? 'bg-iron-orange text-iron-black'
                        : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleUpdateEnjoyment(entry.exercise_id, false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      entry.enjoys_it === false
                        ? 'bg-iron-orange text-iron-black'
                        : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Optional: Typical Performance Metrics */}
              <details className="text-sm">
                <summary className="text-iron-gray cursor-pointer hover:text-iron-white transition-colors">
                  Add typical performance (optional)
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-iron-gray mb-1">Typical Weight (kg)</label>
                    <input
                      type="number"
                      value={entry.typical_weight_kg || ''}
                      onChange={(e) =>
                        handleUpdateMetrics(
                          entry.exercise_id,
                          'typical_weight_kg',
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="e.g., 80"
                      className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-iron-gray mb-1">Typical Reps</label>
                    <input
                      type="number"
                      value={entry.typical_reps || ''}
                      onChange={(e) =>
                        handleUpdateMetrics(
                          entry.exercise_id,
                          'typical_reps',
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="e.g., 10"
                      className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-iron-gray mb-1">Typical Duration (minutes)</label>
                    <input
                      type="number"
                      value={entry.typical_duration_minutes || ''}
                      onChange={(e) =>
                        handleUpdateMetrics(
                          entry.exercise_id,
                          'typical_duration_minutes',
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="For cardio exercises"
                      className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
                    />
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {selectedExercises.length === 0 && searchQuery.length === 0 && (
        <div className="text-center py-8 text-iron-gray">
          <p>Search to add exercises you&apos;re familiar with</p>
          <p className="text-sm mt-1">This helps us personalize your workout plans</p>
        </div>
      )}
    </div>
  )
}
