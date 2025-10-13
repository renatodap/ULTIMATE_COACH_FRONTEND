/**
 * Activity Card Component
 *
 * Displays individual activity with type-specific details
 * Supports edit/delete actions and expandable exercise lists
 */

'use client'

import { useState } from 'react'
import ActivityTypeIcon from './ActivityTypeIcon'
import ActivityStatsGrid from './ActivityStatsGrid'
import ExerciseDetailsList from './ExerciseDetailsList'
import CreateTemplateModal from '@/app/components/templates/CreateTemplateModal'
import type { Activity } from '@/lib/types/activities'
import type { ActivityTemplate } from '@/lib/types/templates'

interface ActivityCardProps {
  activity: Activity
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function ActivityCard({ activity, onEdit, onDelete }: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const hasExercises =
    activity.category === 'strength_training' &&
    activity.metrics?.exercises &&
    activity.metrics.exercises.length > 0

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleTemplateSuccess = (template: ActivityTemplate) => {
    alert(`Template "${template.template_name}" created successfully!`)
    setShowCreateModal(false)
  }

  return (
    <div className="bg-iron-dark-gray rounded-xl p-4 border border-iron-gray shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ActivityTypeIcon category={activity.category} />
          <div>
            <h3 className="text-lg font-semibold text-iron-white">
              {activity.activity_name}
            </h3>
            <p className="text-sm text-iron-gray">
              {formatTime(activity.start_time)} • {activity.duration_minutes} min
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-iron-gray my-3" />

      {/* Stats Grid */}
      <ActivityStatsGrid
        category={activity.category}
        calories={activity.calories_burned}
        mets={activity.intensity_mets}
        metrics={activity.metrics}
      />

      {/* Exercise Details (Strength Training) */}
      {hasExercises && (
        <div className="mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-iron-orange hover:underline transition"
          >
            {isExpanded ? 'Hide' : 'Show'} exercises ({activity.metrics.exercises!.length})
          </button>

          {isExpanded && <ExerciseDetailsList exercises={activity.metrics.exercises!} />}
        </div>
      )}

      {/* Notes */}
      {activity.notes && (
        <div className="mt-3 p-2 bg-iron-black rounded-lg">
          <p className="text-xs text-iron-gray mb-1">Notes:</p>
          <p className="text-sm text-iron-white">{activity.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-iron-gray">
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-sm font-medium text-iron-white hover:text-iron-orange transition"
        >
          Create Template
        </button>
        <button
          onClick={() => onEdit(activity.id)}
          className="text-sm font-medium text-iron-white hover:text-iron-orange transition"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(activity.id)}
          className="text-sm font-medium text-iron-gray hover:text-red-500 transition"
        >
          Delete
        </button>
      </div>

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        activityId={activity.id}
        activityName={activity.activity_name}
        activityType={activity.category}
        onSuccess={handleTemplateSuccess}
      />
    </div>
  )
}
