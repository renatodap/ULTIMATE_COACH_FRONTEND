/**
 * Log Activity Page - Simplified Manual Logging
 *
 * Clean, mobile-first activity logging with:
 * - Real-time calorie estimation
 * - Optional calories/METs (calculated automatically)
 * - Automatic pace calculation (distance + duration)
 * - Category-specific fields
 * - Consistent design with nutrition page
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createActivity } from '@/lib/api/activities'
import { getFullUserProfile } from '@/lib/api/profile'
import CalorieEstimator from '@/app/components/activities/CalorieEstimator'
import type { CreateActivityRequest, ActivityCategory, ActivityMetrics, Exercise } from '@/lib/types/activities'
import { ACTIVITY_CATEGORIES } from '@/lib/types/activities'

export default function LogActivityPage() {
  const router = useRouter()

  // User data
  const [userWeightKg, setUserWeightKg] = useState<number | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Form state - Required fields
  const [category, setCategory] = useState<ActivityCategory | ''>('')
  const [activityName, setActivityName] = useState('')
  const [startTime, setStartTime] = useState(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })
  const [endTime, setEndTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('')

  // Form state - Optional (auto-calculated if not provided)
  const [caloriesBurned, setCaloriesBurned] = useState<number | ''>('')
  const [intensityMets, setIntensityMets] = useState<number | ''>('')
  const [notes, setNotes] = useState('')

  // Category-specific state (cardio)
  const [distanceKm, setDistanceKm] = useState<number | ''>('')
  const [avgHeartRate, setAvgHeartRate] = useState<number | ''>('')
  const [maxHeartRate, setMaxHeartRate] = useState<number | ''>('')
  const [avgPace, setAvgPace] = useState('')
  const [paceManuallyEdited, setPaceManuallyEdited] = useState(false)
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

  // Load user profile to get weight for calorie estimation
  useEffect(() => {
    async function fetchProfile() {
      try {
        const profile = await getFullUserProfile()
        setUserWeightKg(profile.current_weight_kg || 70) // Default to 70kg
      } catch (err) {
        console.error('Failed to load profile:', err)
        setUserWeightKg(70) // Default fallback
      } finally {
        setLoadingProfile(false)
      }
    }
    fetchProfile()
  }, [])

  // Auto-calculate pace when distance and duration are provided
  useEffect(() => {
    // Only auto-calculate if user hasn't manually edited the pace
    if (!paceManuallyEdited && distanceKm && durationMinutes && typeof distanceKm === 'number' && typeof durationMinutes === 'number') {
      // Calculate pace in min/km
      const paceMinutes = durationMinutes / distanceKm
      const minutes = Math.floor(paceMinutes)
      const seconds = Math.round((paceMinutes - minutes) * 60)
      const formattedPace = `${minutes}:${seconds.toString().padStart(2, '0')}/km`
      setAvgPace(formattedPace)
    }
  }, [distanceKm, durationMinutes, paceManuallyEdited])

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

    // Validate required fields
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

    // Duration validation: Either duration OR end_time must be provided
    if (!durationMinutes && !endTime) {
      setError('Please enter either duration or end time')
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

      // Build request - calories and METs are optional (null if not provided)
      const data: CreateActivityRequest = {
        category,
        activity_name: activityName.trim(),
        start_time: new Date(startTime).toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : null,
        duration_minutes: durationMinutes ? Number(durationMinutes) : null,
        calories_burned: caloriesBurned ? Number(caloriesBurned) : null, // ✅ null if empty
        intensity_mets: intensityMets ? Number(intensityMets) : null,     // ✅ null if empty
        metrics,
        notes: notes.trim() || null
      }

      await createActivity(data)

      // Success! Redirect to activities page
      router.push('/activities')
    } catch (err: any) {
      console.error('Failed to create activity:', err)

      // Extract validation errors if available
      if (err.detail && Array.isArray(err.detail)) {
        const validationErrors = err.detail.map((e: any) =>
          `${e.loc?.join(' > ') || 'Field'}: ${e.msg}`
        ).join('\n')
        setError(`Validation errors:\n${validationErrors}`)
      } else {
        setError(err.message || 'Failed to create activity. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-iron-black pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-iron-black border-b border-iron-gray">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-iron-gray hover:text-iron-white transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-iron-white">Log Activity</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Activity Category */}
          <div className="bg-iron-dark-gray rounded-xl p-4 sm:p-6 border border-iron-gray">
            <h2 className="text-lg font-semibold text-iron-white mb-4">Activity Type</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(ACTIVITY_CATEGORIES).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key as ActivityCategory)}
                  className={`p-4 rounded-lg border-2 transition min-h-[88px] ${
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

          {/* Basic Fields */}
          {category && (
            <>
              <div className="bg-iron-dark-gray rounded-xl p-4 sm:p-6 border border-iron-gray space-y-4">
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
                    className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white placeholder:text-iron-gray focus:outline-none focus:border-iron-orange transition"
                    placeholder="e.g., Morning Run, Leg Day"
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
                      className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:border-iron-orange transition"
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
                      className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:border-iron-orange transition"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-iron-white mb-2">
                    Duration (minutes) {!endTime && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white placeholder:text-iron-gray focus:outline-none focus:border-iron-orange transition"
                    min="1"
                    placeholder="e.g., 30"
                  />
                  <p className="text-xs text-iron-gray mt-1">
                    {endTime ? 'Optional if end time is provided' : 'Required if end time is not provided'}
                  </p>
                </div>
              </div>

              {/* Calorie Estimator */}
              {!loadingProfile && (
                <CalorieEstimator
                  activityName={activityName}
                  category={category}
                  durationMinutes={durationMinutes}
                  userWeightKg={userWeightKg}
                />
              )}

              {/* Optional Override: Calories & METs */}
              <div className="bg-iron-dark-gray rounded-xl p-4 sm:p-6 border border-iron-gray space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-iron-white mb-1">
                    Advanced (Optional)
                  </h2>
                  <p className="text-sm text-iron-gray">
                    Leave these blank to calculate automatically based on activity type
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-iron-white mb-2">
                      Calories Burned
                    </label>
                    <input
                      type="number"
                      value={caloriesBurned}
                      onChange={(e) => setCaloriesBurned(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white placeholder:text-iron-gray focus:outline-none focus:border-iron-orange transition"
                      min="0"
                      placeholder="Auto-calculated"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-iron-white mb-2">
                      Intensity (METs)
                    </label>
                    <input
                      type="number"
                      value={intensityMets}
                      onChange={(e) => setIntensityMets(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white placeholder:text-iron-gray focus:outline-none focus:border-iron-orange transition"
                      min="0"
                      step="0.1"
                      placeholder="Auto-looked-up"
                    />
                  </div>
                </div>
              </div>

              {/* Category-Specific Fields: Cardio */}
              {(category === 'cardio_steady_state' || category === 'cardio_interval') && (
                <div className="bg-iron-dark-gray rounded-xl p-4 sm:p-6 border border-iron-gray space-y-4">
                  <h2 className="text-lg font-semibold text-iron-white">Cardio Metrics (Optional)</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-iron-white mb-2">
                        Distance (km)
                      </label>
                      <input
                        type="number"
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:border-iron-orange transition"
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
                        onChange={(e) => {
                          setAvgPace(e.target.value)
                          setPaceManuallyEdited(true)
                        }}
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:border-iron-orange transition"
                        placeholder="Auto-calculated from distance + duration"
                      />
                      {distanceKm && durationMinutes && (
                        <p className="text-xs text-iron-gray mt-1">
                          Calculated automatically from distance and duration
                        </p>
                      )}
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
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:border-iron-orange transition"
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
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:border-iron-orange transition"
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
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:border-iron-orange transition"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category-Specific Fields: Strength Training */}
              {category === 'strength_training' && (
                <div className="bg-iron-dark-gray rounded-xl p-4 sm:p-6 border border-iron-gray space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-iron-white">Exercises (Optional)</h2>
                    <button
                      type="button"
                      onClick={addExercise}
                      className="bg-iron-orange text-iron-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition min-h-[44px]"
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
                              className="text-xs text-red-500 hover:underline min-h-[44px] px-3"
                            >
                              Remove
                            </button>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) => updateExercise(index, 'name', e.target.value)}
                              className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:border-iron-orange transition"
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
                <div className="bg-iron-dark-gray rounded-xl p-4 sm:p-6 border border-iron-gray space-y-4">
                  <h2 className="text-lg font-semibold text-iron-white">Sports Details (Optional)</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-iron-white mb-2">
                        Sport Type
                      </label>
                      <input
                        type="text"
                        value={sportType}
                        onChange={(e) => setSportType(e.target.value)}
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:border-iron-orange transition"
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
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:border-iron-orange transition"
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
                        className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:border-iron-orange transition"
                        placeholder="6-4, 6-3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category-Specific Fields: Flexibility */}
              {category === 'flexibility' && (
                <div className="bg-iron-dark-gray rounded-xl p-4 sm:p-6 border border-iron-gray space-y-4">
                  <h2 className="text-lg font-semibold text-iron-white">Flexibility Details (Optional)</h2>

                  <div>
                    <label className="block text-sm font-medium text-iron-white mb-2">
                      Stretch Type
                    </label>
                    <input
                      type="text"
                      value={stretchType}
                      onChange={(e) => setStretchType(e.target.value)}
                      className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white focus:outline-none focus:border-iron-orange transition"
                      placeholder="e.g., Yoga, Static Stretching"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="bg-iron-dark-gray rounded-xl p-4 sm:p-6 border border-iron-gray space-y-4">
                <h2 className="text-lg font-semibold text-iron-white">Notes (Optional)</h2>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-iron-black border border-iron-gray rounded-lg px-4 py-3 text-iron-white placeholder:text-iron-gray focus:outline-none focus:border-iron-orange transition resize-none"
                  rows={4}
                  placeholder="How did it feel? Any observations?"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 bg-iron-gray/30 text-iron-white px-6 py-4 rounded-lg font-medium hover:bg-iron-gray/50 transition disabled:opacity-50 min-h-[56px]"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-iron-orange text-iron-white px-6 py-4 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
                  disabled={loading}
                >
                  {loading ? 'Logging Activity...' : 'Log Activity'}
                </button>
              </div>
            </>
          )}
        </form>
      </main>
    </div>
  )
}
