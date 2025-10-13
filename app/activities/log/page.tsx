/**
 * Log Activity Page
 *
 * Complete activity logging form with template integration
 * Supports all activity categories with category-specific fields
 */

'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createActivity } from '@/lib/api/activities'
import { getTemplates } from '@/lib/api/templates'
import TemplateSuggestions from '@/app/components/templates/TemplateSuggestions'
import type { CreateActivityRequest, ActivityCategory, ActivityMetrics, Exercise } from '@/lib/types/activities'
import type { ActivityTemplate } from '@/lib/types/templates'
import { ACTIVITY_CATEGORIES } from '@/lib/types/activities'

function LogActivityForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Templates state
  const [templates, setTemplates] = useState<ActivityTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null)
  const [templatesLoading, setTemplatesLoading] = useState(false)

  // Form state
  const [category, setCategory] = useState<ActivityCategory | ''>('')
  const [activityName, setActivityName] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('')
  const [caloriesBurned, setCaloriesBurned] = useState<number | ''>('')
  const [intensityMets, setIntensityMets] = useState<number | ''>('')
  const [notes, setNotes] = useState('')

  // Category-specific state (cardio)
  const [distanceKm, setDistanceKm] = useState<number | ''>('')
  const [avgHeartRate, setAvgHeartRate] = useState<number | ''>('')
  const [maxHeartRate, setMaxHeartRate] = useState<number | ''>('')
  const [avgPace, setAvgPace] = useState('')
  const [elevationGain, setElevationGain] = useState<number | ''>('')

  // Category-specific state (strength training)
  const [exercises, setExercises] = useState<Exercise[]>([])

  // Category-specific state (sports)
  const [sportType, setSportType] = useState('')
  const [opponent, setOpponent] = useState('')
  const [score, setScore] = useState('')

  // Category-specific state (flexibility)
  const [stretchType, setStretchType] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true)
      const response = await getTemplates({ is_active: true })
      setTemplates(response.templates)
    } catch (err) {
      console.error('Failed to load templates:', err)
      // Non-critical, don't show error to user
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    // Pre-fill form with template data
    setSelectedTemplate(template)
    setCategory(template.activity_type as ActivityCategory)
    setActivityName(template.template_name)

    // Expected values
    if (template.expected_distance_m) {
      setDistanceKm(template.expected_distance_m / 1000)
    }
    if (template.expected_duration_minutes) {
      setDurationMinutes(template.expected_duration_minutes)
    }

    // Default metrics
    if (template.default_metrics) {
      const metrics = template.default_metrics as ActivityMetrics
      if (metrics.avg_heart_rate) setAvgHeartRate(metrics.avg_heart_rate)
      if (metrics.max_heart_rate) setMaxHeartRate(metrics.max_heart_rate)
      if (metrics.avg_pace) setAvgPace(metrics.avg_pace)
      if (metrics.elevation_gain_m) setElevationGain(metrics.elevation_gain_m)
      if (metrics.exercises) setExercises(metrics.exercises)
      if (metrics.sport_type) setSportType(metrics.sport_type)
      if (metrics.opponent) setOpponent(metrics.opponent)
      if (metrics.score) setScore(metrics.score)
      if (metrics.stretch_type) setStretchType(metrics.stretch_type)
    }

    // Notes
    if (template.default_notes) {
      setNotes(template.default_notes)
    }

    setShowSuggestions(false)
  }, [templates])

  // Handle URL parameter for pre-selecting template
  useEffect(() => {
    const templateParam = searchParams.get('template')
    if (templateParam && templates.length > 0) {
      const template = templates.find(t => t.id === templateParam)
      if (template) {
        handleTemplateSelect(template.id)
      }
    }
  }, [searchParams, templates, handleTemplateSelect])

  // Show suggestions when category is selected (and no template selected)
  useEffect(() => {
    if (category && !selectedTemplate) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [category, selectedTemplate])

  const handleApplyTemplate = (templateId: string, template: ActivityTemplate) => {
    handleTemplateSelect(templateId)
  }

  const clearTemplate = () => {
    setSelectedTemplate(null)
    // Don't clear the form - user might want to keep the data
  }

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: '', sets: 1, reps: 1, weight_kg: 0 }
    ])
  }

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category) {
      setError('Please select an activity category')
      return
    }

    if (!activityName.trim()) {
      setError('Please enter an activity name')
      return
    }

    if (!startTime) {
      setError('Please enter a start time')
      return
    }

    if (caloriesBurned === '' || caloriesBurned < 0) {
      setError('Please enter calories burned')
      return
    }

    if (intensityMets === '' || intensityMets < 0) {
      setError('Please enter intensity (METs)')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Build metrics object based on category
      const metrics: ActivityMetrics = {}

      if (category === 'cardio_steady_state' || category === 'cardio_interval') {
        if (distanceKm) metrics.distance_km = Number(distanceKm)
        if (avgHeartRate) metrics.avg_heart_rate = Number(avgHeartRate)
        if (maxHeartRate) metrics.max_heart_rate = Number(maxHeartRate)
        if (avgPace) metrics.avg_pace = avgPace
        if (elevationGain) metrics.elevation_gain_m = Number(elevationGain)
      } else if (category === 'strength_training') {
        metrics.exercises = exercises.filter(ex => ex.name.trim() !== '')
        if (metrics.exercises.length > 0) {
          metrics.total_volume_kg = metrics.exercises.reduce(
            (sum, ex) => sum + ((ex.weight_kg || 0) * ex.sets * ex.reps),
            0
          )
        }
      } else if (category === 'sports') {
        if (sportType) metrics.sport_type = sportType
        if (opponent) metrics.opponent = opponent
        if (score) metrics.score = score
      } else if (category === 'flexibility') {
        if (stretchType) metrics.stretch_type = stretchType
      }

      const data: CreateActivityRequest = {
        category,
        activity_name: activityName.trim(),
        start_time: new Date(startTime).toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : null,
        duration_minutes: durationMinutes ? Number(durationMinutes) : null,
        calories_burned: Number(caloriesBurned),
        intensity_mets: Number(intensityMets),
        metrics,
        notes: notes.trim() || null
      }

      const activity = await createActivity(data)

      // Success! Redirect to activities page
      router.push('/activities')
    } catch (err: any) {
      console.error('Failed to create activity:', err)
      setError(err.message || 'Failed to create activity. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-iron-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-iron-black border-b border-iron-gray">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-iron-white hover:text-iron-orange transition"
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-iron-white">Log Activity</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Template Selection */}
          <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
            <h2 className="text-lg font-semibold text-iron-white">Use Template (Optional)</h2>

            {templatesLoading ? (
              <div className="text-sm text-iron-gray">Loading templates...</div>
            ) : templates.length > 0 ? (
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
              >
                <option value="">No template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.icon} {template.template_name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-iron-gray">
                No templates yet. Create templates from your activities to speed up logging!
              </p>
            )}

            {/* Applied Template Badge */}
            {selectedTemplate && (
              <div className="bg-iron-orange/20 p-3 rounded-lg border border-iron-orange/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-iron-orange">
                    Using template: {selectedTemplate.icon} {selectedTemplate.template_name}
                  </p>
                  <button
                    type="button"
                    onClick={clearTemplate}
                    className="text-xs text-iron-gray hover:text-iron-white transition"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Activity Category */}
          <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
            <h2 className="text-lg font-semibold text-iron-white">Activity Type</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(ACTIVITY_CATEGORIES).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key as ActivityCategory)}
                  className={`p-4 rounded-lg border-2 transition ${
                    category === key
                      ? 'border-iron-orange bg-iron-orange/10'
                      : 'border-iron-gray hover:border-iron-orange/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{meta.icon}</div>
                  <div className="text-sm font-medium text-iron-white">{meta.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Suggestions */}
          {showSuggestions && category && (
            <TemplateSuggestions
              activityData={{
                activity_type: category,
                distance_km: distanceKm ? Number(distanceKm) : undefined,
                duration_minutes: durationMinutes ? Number(durationMinutes) : undefined,
                start_time: startTime ? new Date(startTime).toISOString() : undefined
              }}
              onApplyTemplate={handleApplyTemplate}
              autoFetch={true}
            />
          )}

          {/* Basic Fields */}
          {category && (
            <>
              <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
                <h2 className="text-lg font-semibold text-iron-white">Basic Information</h2>

                {/* Activity Name */}
                <div>
                  <label className="block text-sm font-medium text-iron-white mb-2">
                    Activity Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                    placeholder="e.g., Morning Run"
                  />
                </div>

                {/* Times */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-iron-white mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-iron-white mb-2">
                      End Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                    />
                  </div>
                </div>

                {/* Duration, Calories, Intensity */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-iron-white mb-2">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-iron-white mb-2">
                      Calories <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={caloriesBurned}
                      onChange={(e) => setCaloriesBurned(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-iron-white mb-2">
                      Intensity (METs) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={intensityMets}
                      onChange={(e) => setIntensityMets(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Category-Specific Fields: Cardio */}
              {(category === 'cardio_steady_state' || category === 'cardio_interval') && (
                <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
                  <h2 className="text-lg font-semibold text-iron-white">Cardio Metrics</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-iron-white mb-2">
                        Distance (km)
                      </label>
                      <input
                        type="number"
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-iron-white mb-2">
                        Avg Pace (e.g., 5:47/km)
                      </label>
                      <input
                        type="text"
                        value={avgPace}
                        onChange={(e) => setAvgPace(e.target.value)}
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                        placeholder="5:47/km"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-iron-white mb-2">
                        Avg HR (bpm)
                      </label>
                      <input
                        type="number"
                        value={avgHeartRate}
                        onChange={(e) => setAvgHeartRate(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-iron-white mb-2">
                        Max HR (bpm)
                      </label>
                      <input
                        type="number"
                        value={maxHeartRate}
                        onChange={(e) => setMaxHeartRate(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-iron-white mb-2">
                        Elevation Gain (m)
                      </label>
                      <input
                        type="number"
                        value={elevationGain}
                        onChange={(e) => setElevationGain(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category-Specific Fields: Strength Training */}
              {category === 'strength_training' && (
                <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-iron-white">Exercises</h2>
                    <button
                      type="button"
                      onClick={addExercise}
                      className="bg-iron-orange text-iron-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                      + Add Exercise
                    </button>
                  </div>

                  {exercises.length === 0 ? (
                    <p className="text-sm text-iron-gray">No exercises added yet</p>
                  ) : (
                    <div className="space-y-4">
                      {exercises.map((exercise, index) => (
                        <div key={index} className="bg-iron-black/50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-iron-white">
                              Exercise {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeExercise(index)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) => updateExercise(index, 'name', e.target.value)}
                              className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                              placeholder="Exercise name"
                            />
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs text-iron-gray mb-1">Sets</label>
                              <input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => updateExercise(index, 'sets', Number(e.target.value))}
                                className="w-full bg-iron-black border border-iron-gray rounded-lg px-3 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition text-sm"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-iron-gray mb-1">Reps</label>
                              <input
                                type="number"
                                value={exercise.reps}
                                onChange={(e) => updateExercise(index, 'reps', Number(e.target.value))}
                                className="w-full bg-iron-black border border-iron-gray rounded-lg px-3 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition text-sm"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-iron-gray mb-1">Weight (kg)</label>
                              <input
                                type="number"
                                value={exercise.weight_kg || ''}
                                onChange={(e) => updateExercise(index, 'weight_kg', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full bg-iron-black border border-iron-gray rounded-lg px-3 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition text-sm"
                                min="0"
                                step="0.5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-iron-gray mb-1">RPE (1-10)</label>
                              <input
                                type="number"
                                value={exercise.rpe || ''}
                                onChange={(e) => updateExercise(index, 'rpe', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full bg-iron-black border border-iron-gray rounded-lg px-3 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition text-sm"
                                min="1"
                                max="10"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Category-Specific Fields: Sports */}
              {category === 'sports' && (
                <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
                  <h2 className="text-lg font-semibold text-iron-white">Sports Details</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-iron-white mb-2">
                        Sport Type
                      </label>
                      <input
                        type="text"
                        value={sportType}
                        onChange={(e) => setSportType(e.target.value)}
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                        placeholder="e.g., Tennis, Basketball"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-iron-white mb-2">
                        Opponent
                      </label>
                      <input
                        type="text"
                        value={opponent}
                        onChange={(e) => setOpponent(e.target.value)}
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-iron-white mb-2">
                        Score
                      </label>
                      <input
                        type="text"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                        placeholder="6-4, 6-3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category-Specific Fields: Flexibility */}
              {category === 'flexibility' && (
                <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
                  <h2 className="text-lg font-semibold text-iron-white">Flexibility Details</h2>

                  <div>
                    <label className="block text-sm font-medium text-iron-white mb-2">
                      Stretch Type
                    </label>
                    <input
                      type="text"
                      value={stretchType}
                      onChange={(e) => setStretchType(e.target.value)}
                      className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition"
                      placeholder="e.g., Yoga, Static Stretching"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray space-y-4">
                <h2 className="text-lg font-semibold text-iron-white">Notes (Optional)</h2>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-2 text-iron-white focus:outline-none focus:border-iron-orange transition resize-none"
                  rows={4}
                  placeholder="How did it feel? Any observations?"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 bg-iron-gray/30 text-iron-white px-6 py-3 rounded-lg font-medium hover:bg-iron-gray/50 transition disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-iron-orange text-iron-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Logging Activity...' : 'Log Activity'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default function LogActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-iron-black flex items-center justify-center">
        <div className="text-iron-white">Loading...</div>
      </div>
    }>
      <LogActivityForm />
    </Suspense>
  )
}
