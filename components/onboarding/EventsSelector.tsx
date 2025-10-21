'use client'

import { useState } from 'react'
import { Plus, X, Calendar, Star, Target } from 'lucide-react'
import { EventEntry } from '@/lib/api/onboarding'

interface EventsSelectorProps {
  events: EventEntry[]
  onChange: (events: EventEntry[]) => void
}

export default function EventsSelector({
  events,
  onChange
}: EventsSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<EventEntry>({
    event_name: '',
    priority: 3
  })

  const handleAddEvent = () => {
    if (!formData.event_name.trim()) return

    onChange([...events, formData])
    setFormData({ event_name: '', priority: 3 })
    setShowAddForm(false)
  }

  const handleUpdateEvent = (index: number) => {
    onChange(events.map((e, i) => (i === index ? formData : e)))
    setEditingIndex(null)
    setFormData({ event_name: '', priority: 3 })
  }

  const handleRemoveEvent = (index: number) => {
    onChange(events.filter((_, i) => i !== index))
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setFormData({ ...events[index] })
    setShowAddForm(false)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingIndex(null)
    setFormData({ event_name: '', priority: 3 })
  }

  const getPriorityLabel = (priority: number) => {
    const labels = {
      1: 'Low',
      2: 'Medium-Low',
      3: 'Medium',
      4: 'Medium-High',
      5: 'High'
    }
    return labels[priority as keyof typeof labels] || 'Medium'
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'text-iron-orange'
    if (priority === 3) return 'text-iron-white'
    return 'text-iron-gray'
  }

  return (
    <div className="space-y-4">
      {/* Existing Events */}
      {events.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-iron-white font-medium">Upcoming Events ({events.length})</h3>
          {events.map((event, index) => (
            <div
              key={index}
              className="p-4 bg-iron-dark-gray border border-iron-gray rounded-lg space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-iron-gray" />
                    <h4 className="text-iron-white font-medium">{event.event_name}</h4>
                  </div>
                  {event.event_date && (
                    <p className="text-sm text-iron-gray mt-1">
                      {new Date(event.event_date).toLocaleDateString()}
                    </p>
                  )}
                  {event.specific_goals && event.specific_goals.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {event.specific_goals.map((goal, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-iron-orange/20 text-iron-orange text-xs rounded"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-iron-gray">Priority:</span>
                    <span className={`text-xs font-medium ${getPriorityColor(event.priority || 3)}`}>
                      {getPriorityLabel(event.priority || 3)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(index)}
                    className="text-iron-orange hover:text-iron-orange/80 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveEvent(index)}
                    className="text-iron-gray hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingIndex !== null) && (
        <div className="p-4 bg-iron-dark-gray border-2 border-iron-orange rounded-lg space-y-4">
          <h3 className="text-iron-white font-medium">
            {editingIndex !== null ? 'Edit Event' : 'Add Event'}
          </h3>

          {/* Event Name */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">
              Event Name <span className="text-iron-orange">*</span>
            </label>
            <input
              type="text"
              value={formData.event_name}
              onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              placeholder="e.g., Marathon, Competition, Wedding"
              className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
            />
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">Event Date (optional)</label>
            <input
              type="date"
              value={formData.event_date || ''}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white focus:outline-none focus:ring-2 focus:ring-iron-orange"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">
              Priority (1 = Low, 5 = High)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, priority: level })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.priority === level
                      ? 'bg-iron-orange text-iron-black'
                      : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-iron-gray mt-1">
              {getPriorityLabel(formData.priority || 3)}
            </p>
          </div>

          {/* Specific Goals */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">
              Specific Goals (optional)
            </label>
            <div className="space-y-2">
              {(formData.specific_goals || []).map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => {
                      const newGoals = [...(formData.specific_goals || [])]
                      newGoals[index] = e.target.value
                      setFormData({ ...formData, specific_goals: newGoals })
                    }}
                    placeholder="e.g., Finish in under 4 hours"
                    className="flex-1 px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
                  />
                  <button
                    onClick={() => {
                      const newGoals = (formData.specific_goals || []).filter((_, i) => i !== index)
                      setFormData({ ...formData, specific_goals: newGoals })
                    }}
                    className="p-2 text-iron-gray hover:text-red-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    specific_goals: [...(formData.specific_goals || []), '']
                  })
                }}
                className="w-full px-3 py-2 bg-iron-gray/20 text-iron-white rounded-lg hover:bg-iron-gray/40 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Goal
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={editingIndex !== null ? () => handleUpdateEvent(editingIndex) : handleAddEvent}
              disabled={!formData.event_name.trim()}
              className="flex-1 px-4 py-2 bg-iron-orange text-iron-black font-medium rounded-lg hover:bg-iron-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingIndex !== null ? 'Update Event' : 'Add Event'}
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
          Add Upcoming Event
        </button>
      )}

      {/* Empty State */}
      {events.length === 0 && !showAddForm && editingIndex === null && (
        <div className="text-center py-8 text-iron-gray">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No upcoming events yet</p>
          <p className="text-sm mt-1">Add events to help us plan your training schedule</p>
        </div>
      )}
    </div>
  )
}
