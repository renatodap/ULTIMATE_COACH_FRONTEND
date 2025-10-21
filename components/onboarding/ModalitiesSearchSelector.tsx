'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, X, Check } from 'lucide-react'
import { TrainingModality, TrainingModalitySelection, getTrainingModalities } from '@/lib/api/onboarding'

interface ModalitiesSearchSelectorProps {
  selectedModalities: TrainingModalitySelection[]
  onChange: (modalities: TrainingModalitySelection[]) => void
}

export default function ModalitiesSearchSelector({
  selectedModalities,
  onChange
}: ModalitiesSearchSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [allModalities, setAllModalities] = useState<TrainingModality[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all modalities once on mount
  useEffect(() => {
    async function fetchModalities() {
      setIsLoading(true)
      try {
        const modalities = await getTrainingModalities()
        setAllModalities(modalities)
      } catch (error) {
        console.error('Failed to fetch modalities:', error)
        setAllModalities([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchModalities()
  }, [])

  // Client-side filtering with useMemo for performance
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return []

    const query = searchQuery.toLowerCase()
    return allModalities
      .filter(modality =>
        modality.name.toLowerCase().includes(query) ||
        modality.description?.toLowerCase().includes(query)
      )
      .slice(0, 20) // Limit to 20 results
  }, [searchQuery, allModalities])

  // Helper to get modality name by ID
  const getModalityName = (modalityId: string): string => {
    const modality = allModalities.find(m => m.id === modalityId)
    return modality?.name || 'Unknown Modality'
  }

  const handleSelectModality = (modality: TrainingModality) => {
    // Check if already selected
    const existing = selectedModalities.find(m => m.modality_id === modality.id)
    if (existing) return

    // Add with default values
    const newSelection: TrainingModalitySelection = {
      modality_id: modality.id,
      proficiency_level: 'beginner',
      is_primary: selectedModalities.length === 0 // First one is primary
    }

    onChange([...selectedModalities, newSelection])
    setSearchQuery('')
  }

  const handleRemoveModality = (modalityId: string) => {
    const filtered = selectedModalities.filter(m => m.modality_id !== modalityId)

    // If we removed the primary, make the first one primary
    if (filtered.length > 0 && !filtered.some(m => m.is_primary)) {
      filtered[0].is_primary = true
    }

    onChange(filtered)
  }

  const handleUpdateProficiency = (modalityId: string, proficiency: TrainingModalitySelection['proficiency_level']) => {
    onChange(
      selectedModalities.map(m =>
        m.modality_id === modalityId ? { ...m, proficiency_level: proficiency } : m
      )
    )
  }

  const handleSetPrimary = (modalityId: string) => {
    onChange(
      selectedModalities.map(m => ({
        ...m,
        is_primary: m.modality_id === modalityId
      }))
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
          placeholder="Search for sports, activities, or training styles..."
          className="w-full pl-10 pr-4 py-3 bg-iron-dark-gray border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-iron-orange border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-iron-dark-gray border border-iron-gray rounded-lg divide-y divide-iron-gray max-h-64 overflow-y-auto">
          {searchResults.map((modality) => {
            const isSelected = selectedModalities.some(m => m.modality_id === modality.id)
            return (
              <button
                key={modality.id}
                onClick={() => handleSelectModality(modality)}
                disabled={isSelected}
                className="w-full px-4 py-3 text-left hover:bg-iron-gray/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-iron-white font-medium">{modality.name}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-iron-orange" />
                      )}
                    </div>
                    {modality.description && (
                      <p className="text-sm text-iron-gray mt-1">{modality.description}</p>
                    )}
                    {modality.typical_frequency_per_week && (
                      <p className="text-xs text-iron-gray mt-1">
                        Typical: {modality.typical_frequency_per_week}x/week
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Selected Modalities */}
      {selectedModalities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-iron-white font-medium">Selected ({selectedModalities.length})</h3>
          {selectedModalities.map((selection) => (
            <div
              key={selection.modality_id}
              className={`p-4 rounded-lg border-2 ${
                selection.is_primary
                  ? 'bg-iron-orange/10 border-iron-orange'
                  : 'bg-iron-dark-gray border-iron-gray'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <span className="text-iron-white font-medium">
                    {getModalityName(selection.modality_id)}
                  </span>
                  {selection.is_primary && (
                    <span className="ml-2 px-2 py-0.5 bg-iron-orange text-iron-black text-xs font-medium rounded">
                      Primary
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveModality(selection.modality_id)}
                  className="text-iron-gray hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Proficiency Level */}
              <div className="space-y-2">
                <label className="text-sm text-iron-gray">Proficiency Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => handleUpdateProficiency(selection.modality_id, level)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selection.proficiency_level === level
                          ? 'bg-iron-orange text-iron-black'
                          : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set as Primary */}
              {!selection.is_primary && selectedModalities.length > 1 && (
                <button
                  onClick={() => handleSetPrimary(selection.modality_id)}
                  className="mt-3 text-sm text-iron-orange hover:text-iron-orange/80 transition-colors"
                >
                  Set as primary
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {selectedModalities.length === 0 && searchQuery.length === 0 && (
        <div className="text-center py-8 text-iron-gray">
          <p>Search to add your training modalities</p>
          <p className="text-sm mt-1">Examples: Strength Training, Yoga, Running, CrossFit</p>
        </div>
      )}
    </div>
  )
}
