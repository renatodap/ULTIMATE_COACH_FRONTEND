/**
 * Template Card Component
 *
 * Displays individual activity template with usage stats and configuration
 * Supports edit/delete actions and shows auto-matching configuration
 */

'use client'

import { useState } from 'react'
import type { ActivityTemplate } from '@/lib/types/templates'
import {
  ACTIVITY_TYPE_META,
  formatDistance,
  formatDuration,
  formatTime,
  formatPreferredDays
} from '@/lib/types/templates'

interface TemplateCardProps {
  template: ActivityTemplate
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onViewStats?: (id: string) => void
  onUseTemplate?: (id: string) => void
}

export default function TemplateCard({
  template,
  onEdit,
  onDelete,
  onViewStats,
  onUseTemplate
}: TemplateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const activityMeta = ACTIVITY_TYPE_META[template.activity_type]

  const formatLastUsed = (timestamp: string | null) => {
    if (!timestamp) return 'Never used'

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="bg-iron-dark-gray rounded-xl p-4 border border-iron-gray shadow-sm hover:border-iron-orange/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl" title={activityMeta.label}>
            {template.icon || activityMeta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-iron-white truncate">
              {template.template_name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-iron-gray">
              <span className={activityMeta.color}>{activityMeta.label}</span>
              {template.use_count > 0 && (
                <>
                  <span>•</span>
                  <span>{template.use_count} {template.use_count === 1 ? 'use' : 'uses'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions menu (3 dots) */}
        <div className="flex items-center gap-2">
          {template.auto_match_enabled && (
            <div className="text-xs px-2 py-1 bg-iron-orange/20 text-iron-orange rounded">
              Auto-match
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {template.description && (
        <p className="text-sm text-iron-gray mb-3 line-clamp-2">
          {template.description}
        </p>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {template.expected_distance_m && (
          <div className="bg-iron-black rounded-lg p-2">
            <p className="text-xs text-iron-gray mb-1">Distance</p>
            <p className="text-sm font-medium text-iron-white">
              {formatDistance(template.expected_distance_m)}
              <span className="text-xs text-iron-gray ml-1">
                (±{template.distance_tolerance_percent}%)
              </span>
            </p>
          </div>
        )}

        {template.expected_duration_minutes && (
          <div className="bg-iron-black rounded-lg p-2">
            <p className="text-xs text-iron-gray mb-1">Duration</p>
            <p className="text-sm font-medium text-iron-white">
              {formatDuration(template.expected_duration_minutes)}
              <span className="text-xs text-iron-gray ml-1">
                (±{template.duration_tolerance_percent}%)
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      {(template.typical_start_time || template.preferred_days || template.goal_notes) && (
        <div className="mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-iron-orange hover:underline transition"
          >
            {isExpanded ? 'Hide' : 'Show'} details
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2">
              {template.typical_start_time && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-iron-gray">Typical time:</span>
                  <span className="text-iron-white">
                    {formatTime(template.typical_start_time)}
                    {template.time_window_hours > 0 && (
                      <span className="text-iron-gray ml-1">
                        (±{template.time_window_hours}h)
                      </span>
                    )}
                  </span>
                </div>
              )}

              {template.preferred_days && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-iron-gray">Preferred days:</span>
                  <span className="text-iron-white">
                    {formatPreferredDays(template.preferred_days)}
                  </span>
                </div>
              )}

              {template.target_zone && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-iron-gray">Target zone:</span>
                  <span className="text-iron-white">{template.target_zone}</span>
                </div>
              )}

              {template.goal_notes && (
                <div className="text-sm">
                  <p className="text-iron-gray mb-1">Goal:</p>
                  <p className="text-iron-white">{template.goal_notes}</p>
                </div>
              )}

              {/* Auto-match settings */}
              {template.auto_match_enabled && (
                <div className="pt-2 border-t border-iron-gray">
                  <p className="text-xs text-iron-gray mb-1">Auto-match settings:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-iron-black text-iron-white rounded">
                      Min score: {template.min_match_score}%
                    </span>
                    {template.require_gps_match && (
                      <span className="text-xs px-2 py-1 bg-iron-black text-iron-white rounded">
                        GPS required
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Last Used */}
      <div className="text-xs text-iron-gray mb-3">
        Last used: {formatLastUsed(template.last_used_at)}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-iron-gray">
        <div className="flex items-center gap-3">
          {onViewStats && template.use_count > 0 && (
            <button
              onClick={() => onViewStats(template.id)}
              className="text-sm font-medium text-iron-white hover:text-iron-orange transition"
            >
              View Stats
            </button>
          )}
          {onUseTemplate && (
            <button
              onClick={() => onUseTemplate(template.id)}
              className="text-sm font-medium text-iron-orange hover:underline transition"
            >
              Use Template
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(template.id)}
            className="text-sm font-medium text-iron-white hover:text-iron-orange transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="text-sm font-medium text-iron-gray hover:text-red-500 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
