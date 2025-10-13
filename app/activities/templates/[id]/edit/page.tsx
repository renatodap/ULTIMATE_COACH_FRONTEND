/**
 * Edit Template Page
 *
 * Form to edit an existing activity template
 * Pre-populates with current template data
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getTemplate, updateTemplate } from '@/lib/api/templates'
import type { UpdateTemplateRequest, ActivityType, ActivityTemplate } from '@/lib/types/templates'
import { ACTIVITY_TYPE_META, DAYS_OF_WEEK } from '@/lib/types/templates'

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  const [originalTemplate, setOriginalTemplate] = useState<ActivityTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<{
    template_name: string
    activity_type: ActivityType
    description: string
    icon: string
    expected_distance_m: number | undefined
    distance_tolerance_percent: number
    expected_duration_minutes: number | undefined
    duration_tolerance_percent: number
    auto_match_enabled: boolean
    min_match_score: number
    require_gps_match: boolean
    typical_start_time: string | undefined
    time_window_hours: number
    preferred_days: number[] | undefined
    target_zone: string
    goal_notes: string
  }>({
    template_name: '',
    activity_type: 'running',
    description: '',
    icon: '',
    expected_distance_m: undefined,
    distance_tolerance_percent: 10,
    expected_duration_minutes: undefined,
    duration_tolerance_percent: 15,
    auto_match_enabled: true,
    min_match_score: 70,
    require_gps_match: false,
    typical_start_time: undefined,
    time_window_hours: 2,
    preferred_days: undefined,
    target_zone: '',
    goal_notes: ''
  })

  const [selectedDays, setSelectedDays] = useState<number[]>([])

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      setError(null)

      const template = await getTemplate(templateId)
      setOriginalTemplate(template)

      // Pre-populate form
      setFormData({
        template_name: template.template_name,
        activity_type: template.activity_type,
        description: template.description || '',
        icon: template.icon,
        expected_distance_m: template.expected_distance_m ? template.expected_distance_m / 1000 : undefined, // Convert m to km
        distance_tolerance_percent: template.distance_tolerance_percent,
        expected_duration_minutes: template.expected_duration_minutes || undefined,
        duration_tolerance_percent: template.duration_tolerance_percent,
        auto_match_enabled: template.auto_match_enabled,
        min_match_score: template.min_match_score,
        require_gps_match: template.require_gps_match,
        typical_start_time: template.typical_start_time || undefined,
        time_window_hours: template.time_window_hours,
        preferred_days: template.preferred_days || undefined,
        target_zone: template.target_zone || '',
        goal_notes: template.goal_notes || ''
      })

      setSelectedDays(template.preferred_days || [])
    } catch (err: any) {
      console.error('Failed to load template:', err)
      setError('Failed to load template. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.template_name.trim()) {
      setError('Template name is required')
      return
    }

    if (!formData.activity_type) {
      setError('Activity type is required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Build update payload
      const payload: UpdateTemplateRequest = {
        template_name: formData.template_name.trim(),
        activity_type: formData.activity_type,
        description: formData.description?.trim() || null,
        icon: formData.icon || ACTIVITY_TYPE_META[formData.activity_type].icon,
        expected_distance_m: formData.expected_distance_m ? formData.expected_distance_m * 1000 : null, // Convert km to m
        distance_tolerance_percent: formData.distance_tolerance_percent,
        expected_duration_minutes: formData.expected_duration_minutes || null,
        duration_tolerance_percent: formData.duration_tolerance_percent,
        auto_match_enabled: formData.auto_match_enabled,
        min_match_score: formData.min_match_score,
        require_gps_match: formData.require_gps_match,
        typical_start_time: formData.typical_start_time || null,
        time_window_hours: formData.time_window_hours,
        preferred_days: selectedDays.length > 0 ? selectedDays : null,
        target_zone: formData.target_zone?.trim() || null,
        goal_notes: formData.goal_notes?.trim() || null
      }

      await updateTemplate(templateId, payload)

      // Redirect to templates list
      router.push('/activities/templates')
    } catch (err: any) {
      console.error('Failed to update template:', err)
      setError(err.message || 'Failed to update template. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    )
  }

  const activityTypes: ActivityType[] = [
    'running', 'cycling', 'swimming', 'walking', 'hiking',
    'strength_training', 'yoga', 'flexibility',
    'sports', 'cardio_steady_state', 'cardio_interval', 'other'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-iron-black flex items-center justify-center">
        <div className="text-iron-white">Loading template...</div>
      </div>
    )
  }

  if (error && !originalTemplate) {
    return (
      <div className="min-h-screen bg-iron-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-iron-orange hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iron-black pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-iron-black border-b border-iron-gray">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="text-iron-gray hover:text-iron-white transition mb-2"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-iron-white">Edit Template</h1>
            {originalTemplate && (
              <p className="text-sm text-iron-gray mt-1">
                {originalTemplate.use_count} uses • Last used{' '}
                {originalTemplate.last_used_at
                  ? new Date(originalTemplate.last_used_at).toLocaleDateString()
                  : 'never'}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
            <h2 className="text-lg font-semibold text-iron-white mb-4">Basic Information</h2>

            {/* Template Name */}
            <div>
              <label className="block text-sm font-medium text-iron-white mb-2">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.template_name}
                onChange={e => setFormData({ ...formData, template_name: e.target.value })}
                placeholder="e.g., Morning 5K Route, Leg Day, Evening Yoga"
                className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
                maxLength={100}
                required
              />
            </div>

            {/* Activity Type */}
            <div>
              <label className="block text-sm font-medium text-iron-white mb-2">
                Activity Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.activity_type}
                onChange={e => setFormData({ ...formData, activity_type: e.target.value as ActivityType })}
                className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:ring-2 focus:ring-iron-orange"
                required
              >
                {activityTypes.map(type => (
                  <option key={type} value={type}>
                    {ACTIVITY_TYPE_META[type].icon} {ACTIVITY_TYPE_META[type].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-iron-white mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add notes about this template..."
                rows={3}
                maxLength={500}
                className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange resize-none"
              />
            </div>
          </div>

          {/* Expected Metrics */}
          <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
            <h2 className="text-lg font-semibold text-iron-white mb-4">Expected Metrics</h2>
            <p className="text-sm text-iron-gray mb-4">
              Set expected values to help auto-match activities to this template
            </p>

            {/* Distance */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-iron-white mb-2">
                  Distance (km)
                </label>
                <input
                  type="number"
                  value={formData.expected_distance_m || ''}
                  onChange={e => setFormData({ ...formData, expected_distance_m: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="5.0"
                  step="0.1"
                  min="0"
                  className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-iron-white mb-2">
                  Tolerance (±%)
                </label>
                <input
                  type="number"
                  value={formData.distance_tolerance_percent}
                  onChange={e => setFormData({ ...formData, distance_tolerance_percent: parseInt(e.target.value) || 10 })}
                  min="0"
                  max="100"
                  className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:ring-2 focus:ring-iron-orange"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-iron-white mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.expected_duration_minutes || ''}
                  onChange={e => setFormData({ ...formData, expected_duration_minutes: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="45"
                  min="1"
                  className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-iron-white mb-2">
                  Tolerance (±%)
                </label>
                <input
                  type="number"
                  value={formData.duration_tolerance_percent}
                  onChange={e => setFormData({ ...formData, duration_tolerance_percent: parseInt(e.target.value) || 15 })}
                  min="0"
                  max="100"
                  className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:ring-2 focus:ring-iron-orange"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
            <h2 className="text-lg font-semibold text-iron-white mb-4">Schedule (optional)</h2>

            {/* Typical Start Time */}
            <div>
              <label className="block text-sm font-medium text-iron-white mb-2">
                Typical Start Time
              </label>
              <input
                type="time"
                value={formData.typical_start_time || ''}
                onChange={e => setFormData({ ...formData, typical_start_time: e.target.value || undefined })}
                className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:ring-2 focus:ring-iron-orange"
              />
            </div>

            {/* Preferred Days */}
            <div>
              <label className="block text-sm font-medium text-iron-white mb-2">
                Preferred Days
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      selectedDays.includes(day.value)
                        ? 'bg-iron-orange text-iron-white'
                        : 'bg-iron-black text-iron-gray hover:text-iron-white'
                    }`}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Auto-Matching */}
          <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
            <h2 className="text-lg font-semibold text-iron-white mb-4">Auto-Matching</h2>

            {/* Enable Auto-Match */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-iron-white">Enable Auto-Matching</p>
                <p className="text-xs text-iron-gray mt-1">
                  Automatically suggest this template for matching activities
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, auto_match_enabled: !formData.auto_match_enabled })}
                className={`relative w-12 h-6 rounded-full transition ${
                  formData.auto_match_enabled ? 'bg-iron-orange' : 'bg-iron-gray'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.auto_match_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Min Match Score */}
            {formData.auto_match_enabled && (
              <div>
                <label className="block text-sm font-medium text-iron-white mb-2">
                  Minimum Match Score (0-100)
                </label>
                <input
                  type="number"
                  value={formData.min_match_score}
                  onChange={e => setFormData({ ...formData, min_match_score: parseInt(e.target.value) || 70 })}
                  min="0"
                  max="100"
                  className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:ring-2 focus:ring-iron-orange"
                />
                <p className="text-xs text-iron-gray mt-1">
                  Higher scores mean stricter matching
                </p>
              </div>
            )}
          </div>

          {/* Workout Goals */}
          <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
            <h2 className="text-lg font-semibold text-iron-white mb-4">Workout Goals (optional)</h2>

            {/* Target Zone */}
            <div>
              <label className="block text-sm font-medium text-iron-white mb-2">
                Target Zone/Effort
              </label>
              <input
                type="text"
                value={formData.target_zone || ''}
                onChange={e => setFormData({ ...formData, target_zone: e.target.value })}
                placeholder="e.g., Zone 2, Easy Effort, Tempo"
                maxLength={50}
                className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
              />
            </div>

            {/* Goal Notes */}
            <div>
              <label className="block text-sm font-medium text-iron-white mb-2">
                Goal/Purpose
              </label>
              <textarea
                value={formData.goal_notes || ''}
                onChange={e => setFormData({ ...formData, goal_notes: e.target.value })}
                placeholder="e.g., Build endurance, Active recovery, Strength maintenance"
                rows={3}
                maxLength={500}
                className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-iron-dark-gray text-iron-white px-6 py-3 rounded-lg font-medium hover:bg-iron-gray transition"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-iron-orange text-iron-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
