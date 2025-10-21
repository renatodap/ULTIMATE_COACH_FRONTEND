'use client'

import { useState } from 'react'
import { Plus, X, TrendingUp, Target } from 'lucide-react'
import { ImprovementGoalEntry } from '@/lib/api/onboarding'

interface GoalsBuilderProps {
  goals: ImprovementGoalEntry[]
  onChange: (goals: ImprovementGoalEntry[]) => void
}

const GOAL_TYPES = [
  { value: 'strength', label: 'Strength', icon: '💪', color: 'text-iron-orange' },
  { value: 'endurance', label: 'Endurance', icon: '🏃', color: 'text-blue-400' },
  { value: 'skill', label: 'Skill', icon: '🎯', color: 'text-green-400' },
  { value: 'aesthetic', label: 'Aesthetic', icon: '✨', color: 'text-purple-400' },
  { value: 'body_composition', label: 'Body Comp', icon: '⚖️', color: 'text-yellow-400' },
  { value: 'mobility', label: 'Mobility', icon: '🤸', color: 'text-pink-400' },
  { value: 'performance', label: 'Performance', icon: '🚀', color: 'text-red-400' },
  { value: 'health', label: 'Health', icon: '❤️', color: 'text-green-500' }
] as const

export default function GoalsBuilder({
  goals,
  onChange
}: GoalsBuilderProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<ImprovementGoalEntry>({
    goal_type: 'strength',
    target_description: ''
  })

  const handleAddGoal = () => {
    if (!formData.target_description.trim()) return

    onChange([...goals, formData])
    setFormData({ goal_type: 'strength', target_description: '' })
    setShowAddForm(false)
  }

  const handleUpdateGoal = (index: number) => {
    onChange(goals.map((g, i) => (i === index ? formData : g)))
    setEditingIndex(null)
    setFormData({ goal_type: 'strength', target_description: '' })
  }

  const handleRemoveGoal = (index: number) => {
    onChange(goals.filter((_, i) => i !== index))
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setFormData({ ...goals[index] })
    setShowAddForm(false)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingIndex(null)
    setFormData({ goal_type: 'strength', target_description: '' })
  }

  const getGoalType = (type: ImprovementGoalEntry['goal_type']) => {
    return GOAL_TYPES.find(t => t.value === type) || GOAL_TYPES[0]
  }

  return (
    <div className="space-y-4">
      {/* Existing Goals */}
      {goals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-iron-white font-medium">Your Goals ({goals.length})</h3>
          {goals.map((goal, index) => {
            const goalType = getGoalType(goal.goal_type)
            return (
              <div
                key={index}
                className="p-4 bg-iron-dark-gray border border-iron-gray rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{goalType.icon}</span>
                      <span className={`text-sm font-medium ${goalType.color}`}>
                        {goalType.label}
                      </span>
                    </div>
                    <p className="text-iron-white">{goal.target_description}</p>
                    {(goal.current_value !== undefined || goal.target_value !== undefined) && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-iron-gray">
                        {goal.current_value !== undefined && (
                          <span>Current: {goal.current_value}</span>
                        )}
                        {goal.current_value !== undefined && goal.target_value !== undefined && (
                          <span>→</span>
                        )}
                        {goal.target_value !== undefined && (
                          <span className="text-iron-orange">Target: {goal.target_value}</span>
                        )}
                      </div>
                    )}
                    {goal.target_date && (
                      <p className="text-sm text-iron-gray mt-1">
                        Target date: {new Date(goal.target_date).toLocaleDateString()}
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
                      onClick={() => handleRemoveGoal(index)}
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
            {editingIndex !== null ? 'Edit Goal' : 'Add Goal'}
          </h3>

          {/* Goal Type */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">Goal Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GOAL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData({ ...formData, goal_type: type.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.goal_type === type.value
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
              Goal Description <span className="text-iron-orange">*</span>
            </label>
            <textarea
              value={formData.target_description}
              onChange={(e) => setFormData({ ...formData, target_description: e.target.value })}
              placeholder="e.g., Bench press 225 lbs for 5 reps, Run a sub-3 hour marathon"
              rows={3}
              className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange resize-none"
            />
          </div>

          {/* Current & Target Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-iron-gray mb-2">
                Current Value (optional)
              </label>
              <input
                type="number"
                value={formData.current_value || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_value: e.target.value ? Number(e.target.value) : undefined
                  })
                }
                placeholder="e.g., 185"
                className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
              />
            </div>
            <div>
              <label className="block text-sm text-iron-gray mb-2">
                Target Value (optional)
              </label>
              <input
                type="number"
                value={formData.target_value || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_value: e.target.value ? Number(e.target.value) : undefined
                  })
                }
                placeholder="e.g., 225"
                className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
              />
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">Target Date (optional)</label>
            <input
              type="date"
              value={formData.target_date || ''}
              onChange={(e) =>
                setFormData({ ...formData, target_date: e.target.value || undefined })
              }
              className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white focus:outline-none focus:ring-2 focus:ring-iron-orange"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={editingIndex !== null ? () => handleUpdateGoal(editingIndex) : handleAddGoal}
              disabled={!formData.target_description.trim()}
              className="flex-1 px-4 py-2 bg-iron-orange text-iron-black font-medium rounded-lg hover:bg-iron-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingIndex !== null ? 'Update Goal' : 'Add Goal'}
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
          Add Improvement Goal
        </button>
      )}

      {/* Empty State */}
      {goals.length === 0 && !showAddForm && editingIndex === null && (
        <div className="text-center py-8 text-iron-gray">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No goals set yet</p>
          <p className="text-sm mt-1">Add specific goals to track your progress</p>
        </div>
      )}
    </div>
  )
}
