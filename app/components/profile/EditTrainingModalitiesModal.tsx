'use client'

/**
 * Edit Training Modalities Modal
 *
 * Allows users to update their training modalities:
 * - Select/deselect modalities
 * - Set proficiency level for each
 * - Mark primary modality
 *
 * Mobile-first design with 48px touch targets and responsive grid.
 */

import { useState, useEffect } from 'react'
import { X, Loader2, Dumbbell } from 'lucide-react'
import { getTrainingModalities } from '@/lib/api/onboarding'
import { getUserTrainingModalities } from '@/lib/api/profile'
import { apiClient } from '@/lib/api/client'
import type { TrainingModality, UserTrainingModality } from '@/lib/api/profile'

interface EditTrainingModalitiesModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onError: (error: string) => void
}

interface SelectedModality {
  modality_id: string
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  is_primary: boolean
}

export default function EditTrainingModalitiesModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: EditTrainingModalitiesModalProps) {
  const [availableModalities, setAvailableModalities] = useState<TrainingModality[]>([])
  const [selectedModalities, setSelectedModalities] = useState<SelectedModality[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [available, userModalities] = await Promise.all([
        getTrainingModalities(),
        getUserTrainingModalities()
      ])

      setAvailableModalities(available)

      // Convert user modalities to selected format
      const selected: SelectedModality[] = userModalities.map(um => ({
        modality_id: um.modality_id,
        proficiency_level: um.proficiency_level,
        is_primary: um.is_primary
      }))
      setSelectedModalities(selected)
    } catch (err) {
      console.error('Failed to load training modalities:', err)
      onError('Failed to load training modalities')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleModality = (modalityId: string) => {
    const isSelected = selectedModalities.some(m => m.modality_id === modalityId)

    if (isSelected) {
      // Deselect
      setSelectedModalities(prev => prev.filter(m => m.modality_id !== modalityId))
    } else {
      // Select with default proficiency
      const newModality: SelectedModality = {
        modality_id: modalityId,
        proficiency_level: 'beginner',
        is_primary: selectedModalities.length === 0 // First one is primary
      }
      setSelectedModalities(prev => [...prev, newModality])
    }
  }

  const handleChangeProficiency = (modalityId: string, level: SelectedModality['proficiency_level']) => {
    setSelectedModalities(prev =>
      prev.map(m =>
        m.modality_id === modalityId
          ? { ...m, proficiency_level: level }
          : m
      )
    )
  }

  const handleSetPrimary = (modalityId: string) => {
    setSelectedModalities(prev =>
      prev.map(m => ({
        ...m,
        is_primary: m.modality_id === modalityId
      }))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Update training modalities (replaces all existing)
      await apiClient.put('api/v1/users/me/training-modalities', {
        training_modalities: selectedModalities
      })

      onSuccess()
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update training modalities'
      onError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-iron-dark-gray border border-iron-gray max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl">
        {/* Header */}
        <div className="sticky top-0 bg-iron-dark-gray border-b border-iron-gray p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-iron-orange" />
            <h2 className="font-heading text-xl text-iron-white uppercase">Edit Training Modalities</h2>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-iron-orange" />
            </div>
          ) : (
            <>
              {/* Info Message */}
              <div className="p-3 bg-iron-orange/10 border border-iron-orange/30 rounded-lg">
                <p className="text-sm text-iron-white">
                  Select all modalities you train. Click a selected modality to set its proficiency level and mark it as primary.
                </p>
              </div>

              {/* Modalities Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {availableModalities.filter(m => m.name !== 'Other').map((modality) => {
                  const selected = selectedModalities.find(m => m.modality_id === modality.id)
                  const isSelected = !!selected

                  return (
                    <button
                      key={modality.id}
                      type="button"
                      onClick={() => handleToggleModality(modality.id)}
                      className={`min-h-[88px] px-4 py-3 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-primary/10 text-iron-white border-2 border-primary shadow-lg shadow-primary/30'
                          : 'bg-iron-black/50 text-iron-gray border-2 border-iron-gray hover:border-iron-orange/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{modality.icon}</span>
                        <span className="text-base sm:text-lg font-medium">{modality.name}</span>
                        {selected?.is_primary && (
                          <span className="text-yellow-400 ml-auto">★</span>
                        )}
                      </div>
                      {isSelected && selected && (
                        <div className="mt-2 space-y-2">
                          <select
                            value={selected.proficiency_level}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleChangeProficiency(modality.id, e.target.value as any)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1 rounded-lg text-sm bg-iron-black text-iron-white border border-iron-gray focus:border-iron-orange focus:outline-none"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                          {!selected.is_primary && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetPrimary(modality.id)
                              }}
                              className="w-full px-2 py-1 text-xs bg-iron-gray/20 text-iron-white hover:bg-iron-gray/30 transition-colors rounded-lg"
                            >
                              Set as Primary
                            </button>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Selected Summary */}
              {selectedModalities.length > 0 && (
                <div className="pt-4 border-t border-iron-gray/30">
                  <p className="text-iron-gray text-sm mb-3">
                    {selectedModalities.length} modality{selectedModalities.length !== 1 ? 'ies' : ''} selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedModalities.map((selected) => {
                      const modality = availableModalities.find(m => m.id === selected.modality_id)
                      return (
                        <div
                          key={selected.modality_id}
                          className="px-3 py-1.5 rounded-lg bg-primary/20 text-iron-white text-sm flex items-center gap-2"
                        >
                          {modality?.icon} {modality?.name}
                          {selected.is_primary && <span className="text-yellow-400">★</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

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
              disabled={isSubmitting || isLoading}
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
