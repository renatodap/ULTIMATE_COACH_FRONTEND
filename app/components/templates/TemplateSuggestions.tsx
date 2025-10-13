/**
 * Template Suggestions Component
 *
 * Displays auto-matched template suggestions for activity data
 * Reusable component that can be used in activity log or anywhere else
 */

'use client'

import { useState, useEffect } from 'react'
import { getTemplateMatches, recordMatchDecision } from '@/lib/api/templates'
import type {
  ActivityDataForMatching,
  MatchSuggestions,
  MatchResult,
  ActivityTemplate
} from '@/lib/types/templates'
import { ACTIVITY_TYPE_META, formatDistance, formatDuration } from '@/lib/types/templates'

interface TemplateSuggestionsProps {
  activityData: ActivityDataForMatching
  onApplyTemplate: (templateId: string, template: ActivityTemplate) => void
  onDismiss?: (templateId: string) => void
  autoFetch?: boolean
}

export default function TemplateSuggestions({
  activityData,
  onApplyTemplate,
  onDismiss,
  autoFetch = true
}: TemplateSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<MatchSuggestions | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<{
    excellent: boolean
    good: boolean
    fair: boolean
  }>({
    excellent: true,
    good: false,
    fair: false
  })
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (autoFetch && activityData.activity_type) {
      fetchMatches()
    }
  }, [activityData.activity_type, activityData.distance_km, activityData.duration_minutes, autoFetch])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      setError(null)

      const matches = await getTemplateMatches(activityData)
      setSuggestions(matches)
    } catch (err: any) {
      console.error('Failed to fetch template matches:', err)
      setError('Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = (match: MatchResult) => {
    onApplyTemplate(match.template_id, match.template)
  }

  const handleDismiss = async (match: MatchResult) => {
    // Add to dismissed set immediately (optimistic UI)
    setDismissedIds(prev => new Set(prev).add(match.template_id))

    // Record decision in backend (fire and forget)
    try {
      await recordMatchDecision({
        activity_id: '', // Will be filled when activity is created
        template_id: match.template_id,
        match_score: match.match_score,
        match_method: 'auto',
        user_decision: 'rejected'
      })
    } catch (err) {
      console.error('Failed to record decision:', err)
      // Don't show error to user, this is non-critical
    }

    // Call parent callback if provided
    if (onDismiss) {
      onDismiss(match.template_id)
    }
  }

  const toggleSection = (section: 'excellent' | 'good' | 'fair') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getQualityColor = (quality: 'excellent' | 'good' | 'fair') => {
    switch (quality) {
      case 'excellent':
        return 'text-green-500'
      case 'good':
        return 'text-iron-orange'
      case 'fair':
        return 'text-iron-gray'
    }
  }

  const getQualityLabel = (quality: 'excellent' | 'good' | 'fair') => {
    switch (quality) {
      case 'excellent':
        return 'Excellent Matches'
      case 'good':
        return 'Good Matches'
      case 'fair':
        return 'Fair Matches'
    }
  }

  const renderMatch = (match: MatchResult, quality: 'excellent' | 'good' | 'fair') => {
    // Skip dismissed matches
    if (dismissedIds.has(match.template_id)) {
      return null
    }

    const activityMeta = ACTIVITY_TYPE_META[match.template.activity_type]

    return (
      <div
        key={match.template_id}
        className="bg-iron-black rounded-lg p-4 border border-iron-gray"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl">{match.template.icon || activityMeta.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-iron-white truncate">
                {match.template.template_name}
              </h4>
              <p className="text-xs text-iron-gray">
                {activityMeta.label}
              </p>
            </div>
          </div>

          {/* Match Score */}
          <div className={`text-sm font-bold ${getQualityColor(quality)}`}>
            {match.match_score}%
          </div>
        </div>

        {/* Expected Values */}
        <div className="flex gap-3 text-xs text-iron-gray mb-3">
          {match.template.expected_distance_m && (
            <span>
              {formatDistance(match.template.expected_distance_m)}
            </span>
          )}
          {match.template.expected_duration_minutes && (
            <span>
              {formatDuration(match.template.expected_duration_minutes)}
            </span>
          )}
        </div>

        {/* Match Score Progress Bar */}
        <div className="w-full bg-iron-gray/30 rounded-full h-1.5 mb-3">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              quality === 'excellent' ? 'bg-green-500' :
              quality === 'good' ? 'bg-iron-orange' :
              'bg-iron-gray'
            }`}
            style={{ width: `${match.match_score}%` }}
          />
        </div>

        {/* Score Breakdown (optional, can be expanded) */}
        {match.breakdown && (
          <details className="mb-3">
            <summary className="text-xs text-iron-gray cursor-pointer hover:text-iron-white transition">
              Score breakdown
            </summary>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-iron-gray">Activity Type:</span>
                <span className="text-iron-white">{match.breakdown.type_score}/40</span>
              </div>
              <div className="flex justify-between">
                <span className="text-iron-gray">Distance:</span>
                <span className="text-iron-white">{match.breakdown.distance_score.toFixed(1)}/25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-iron-gray">Time of Day:</span>
                <span className="text-iron-white">{match.breakdown.time_score.toFixed(1)}/20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-iron-gray">Day of Week:</span>
                <span className="text-iron-white">{match.breakdown.day_score.toFixed(1)}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-iron-gray">Duration:</span>
                <span className="text-iron-white">{match.breakdown.duration_score.toFixed(1)}/5</span>
              </div>
            </div>
          </details>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handleApply(match)}
            className="flex-1 bg-iron-orange text-iron-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            Apply Template
          </button>
          <button
            onClick={() => handleDismiss(match)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-iron-gray hover:text-iron-white hover:bg-iron-gray/30 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    )
  }

  const renderQualitySection = (
    quality: 'excellent' | 'good' | 'fair',
    matches: MatchResult[]
  ) => {
    // Filter out dismissed matches
    const visibleMatches = matches.filter(m => !dismissedIds.has(m.template_id))

    if (visibleMatches.length === 0) {
      return null
    }

    const isExpanded = expandedSections[quality]
    const showCount = isExpanded ? visibleMatches.length : Math.min(3, visibleMatches.length)

    return (
      <div key={quality} className="space-y-3">
        {/* Section Header */}
        <button
          onClick={() => toggleSection(quality)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-sm font-semibold text-iron-white">
            {getQualityLabel(quality)} ({visibleMatches.length})
          </h3>
          <span className="text-iron-gray">
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>

        {/* Matches */}
        {isExpanded && (
          <div className="space-y-3">
            {visibleMatches.slice(0, showCount).map(match => renderMatch(match, quality))}

            {/* Show More Button */}
            {visibleMatches.length > showCount && (
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, [quality]: true }))}
                className="w-full text-sm text-iron-orange hover:underline transition"
              >
                Show {visibleMatches.length - showCount} more
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray">
        <div className="flex items-center gap-3 text-iron-gray">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-iron-orange" />
          <span className="text-sm">Finding matching templates...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/50">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  // No suggestions
  if (!suggestions) {
    return null
  }

  const totalMatches = suggestions.excellent.length + suggestions.good.length + suggestions.fair.length

  // No matches found
  if (totalMatches === 0) {
    return (
      <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray text-center">
        <div className="text-2xl mb-2">🔍</div>
        <p className="text-sm text-iron-gray">
          No matching templates found for this activity
        </p>
      </div>
    )
  }

  return (
    <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">💡</span>
        <h3 className="text-base font-semibold text-iron-white">
          Suggested Templates
        </h3>
        <span className="text-xs text-iron-gray">
          ({totalMatches} {totalMatches === 1 ? 'match' : 'matches'})
        </span>
      </div>

      {/* Quality Sections */}
      <div className="space-y-4">
        {renderQualitySection('excellent', suggestions.excellent)}
        {renderQualitySection('good', suggestions.good)}
        {renderQualitySection('fair', suggestions.fair)}
      </div>
    </div>
  )
}
