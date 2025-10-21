'use client'

import { useState } from 'react'
import { Plus, X, AlertTriangle } from 'lucide-react'
import { DifficultyEntry } from '@/lib/api/onboarding'

interface DifficultiesFormProps {
  difficulties: DifficultyEntry[]
  onChange: (difficulties: DifficultyEntry[]) => void
}

const DIFFICULTY_CATEGORIES = [
  { value: 'motivation', label: 'Motivation', icon: '⚡' },
  { value: 'time_management', label: 'Time Management', icon: '⏰' },
  { value: 'injury', label: 'Injury/Pain', icon: '🤕' },
  { value: 'nutrition', label: 'Nutrition', icon: '🍎' },
  { value: 'knowledge', label: 'Knowledge/Technique', icon: '📚' },
  { value: 'consistency', label: 'Consistency', icon: '📅' },
  { value: 'energy', label: 'Energy/Fatigue', icon: '😴' },
  { value: 'social_support', label: 'Social Support', icon: '👥' },
  { value: 'equipment_access', label: 'Equipment Access', icon: '🏋️' },
  { value: 'travel', label: 'Travel/Schedule', icon: '✈️' },
  { value: 'other', label: 'Other', icon: '❓' }
] as const

export default function DifficultiesForm({
  difficulties,
  onChange
}: DifficultiesFormProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<DifficultyEntry>({
    difficulty_category: 'motivation',
    description: '',
    severity: 3
  })

  const handleAddDifficulty = () => {
    if (!formData.description.trim()) return

    onChange([...difficulties, formData])
    setFormData({ difficulty_category: 'motivation', description: '', severity: 3 })
    setShowAddForm(false)
  }

  const handleUpdateDifficulty = (index: number) => {
    onChange(difficulties.map((d, i) => (i === index ? formData : d)))
    setEditingIndex(null)
    setFormData({ difficulty_category: 'motivation', description: '', severity: 3 })
  }

  const handleRemoveDifficulty = (index: number) => {
    onChange(difficulties.filter((_, i) => i !== index))
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setFormData({ ...difficulties[index] })
    setShowAddForm(false)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingIndex(null)
    setFormData({ difficulty_category: 'motivation', description: '', severity: 3 })
  }

  const getCategory = (category: DifficultyEntry['difficulty_category']) => {
    return DIFFICULTY_CATEGORIES.find(c => c.value === category) || DIFFICULTY_CATEGORIES[0]
  }

  const getSeverityLabel = (severity: number) => {
    const labels = {
      1: 'Minor',
      2: 'Moderate',
      3: 'Significant',
      4: 'Major',
      5: 'Critical Blocker'
    }
    return labels[severity as keyof typeof labels] || 'Significant'
  }

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'text-red-400'
    if (severity === 3) return 'text-iron-orange'
    return 'text-iron-gray'
  }

  return (
    <div className="space-y-4">
      {/* Existing Difficulties */}
      {difficulties.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-iron-white font-medium">Your Challenges ({difficulties.length})</h3>
          {difficulties.map((difficulty, index) => {
            const category = getCategory(difficulty.difficulty_category)
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  difficulty.severity && difficulty.severity >= 4
                    ? 'bg-red-500/10 border-red-400'
                    : 'bg-iron-dark-gray border-iron-gray'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-sm font-medium text-iron-white">
                        {category.label}
                      </span>
                      <span className={`text-sm ${getSeverityColor(difficulty.severity || 3)}`}>
                        • {getSeverityLabel(difficulty.severity || 3)}
                      </span>
                    </div>
                    <p className="text-iron-white">{difficulty.description}</p>
                    {difficulty.frequency && (
                      <p className="text-sm text-iron-gray mt-1">
                        Frequency: {difficulty.frequency}
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
                      onClick={() => handleRemoveDifficulty(index)}
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
          <h3 className="text-iron-white font-medium">
            {editingIndex !== null ? 'Edit Challenge' : 'Add Challenge'}
          </h3>

          {/* Category */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DIFFICULTY_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setFormData({ ...formData, difficulty_category: cat.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.difficulty_category === cat.value
                      ? 'bg-iron-orange text-iron-black'
                      : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.label}
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
              placeholder="Describe the challenge you're facing..."
              rows={3}
              className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange resize-none"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">
              Severity (1 = Minor, 5 = Critical)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, severity: level })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.severity === level
                      ? 'bg-iron-orange text-iron-black'
                      : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-iron-gray mt-1">
              {getSeverityLabel(formData.severity || 3)}
            </p>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">
              How often does this occur? (optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['daily', 'weekly', 'monthly', 'occasionally'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFormData({ ...formData, frequency: freq })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.frequency === freq
                      ? 'bg-iron-orange text-iron-black'
                      : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                  }`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={
                editingIndex !== null
                  ? () => handleUpdateDifficulty(editingIndex)
                  : handleAddDifficulty
              }
              disabled={!formData.description.trim()}
              className="flex-1 px-4 py-2 bg-iron-orange text-iron-black font-medium rounded-lg hover:bg-iron-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingIndex !== null ? 'Update Challenge' : 'Add Challenge'}
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
          Add Challenge
        </button>
      )}

      {/* Empty State */}
      {difficulties.length === 0 && !showAddForm && editingIndex === null && (
        <div className="text-center py-8 text-iron-gray">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No challenges identified yet</p>
          <p className="text-sm mt-1">Identifying challenges helps us provide better support</p>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-iron-dark-gray/50 rounded-lg text-sm text-iron-gray">
        <p>
          Being honest about challenges helps us create a realistic plan tailored to your situation.
        </p>
      </div>
    </div>
  )
}
