'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface DaySchedule {
  day_index: number
  day_name: string
  date: string
  is_today: boolean
  training_session: {
    id: string
    session_kind: string
    session_name: string
    time_of_day: string
    estimated_duration_minutes: number
    notes?: string
    state: string
    completed_at?: string | null
    exercise_count: number
  } | null
  meals: Array<{
    id: string
    meal_type: string
    meal_name: string
    totals: {
      calories: number
      protein_g: number
      carbs_g: number
      fat_g: number
    }
  }>
  is_rest_day: boolean
}

interface WeekSchedule {
  week_index: number
  week_start: string
  week_end: string
  current_day_index: number
  program: {
    id: string
    primary_goal: string
    program_start_date: string
    duration_weeks: number
  }
  schedule: DaySchedule[]
}

export default function WeekPage() {
  const router = useRouter()
  const [weekData, setWeekData] = useState<WeekSchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeekSchedule()
  }, [])

  async function fetchWeekSchedule() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/programs/week`,
        {
          credentials: 'include',
        }
      )

      if (!res.ok) {
        if (res.status === 404) {
          setError('No program found. Generate a program first.')
          return
        }
        throw new Error('Failed to fetch week schedule')
      }

      const data = await res.json()
      setWeekData(data)
    } catch (err) {
      console.error('Error fetching week:', err)
      setError(err instanceof Error ? err.message : 'Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-iron-orange"></div>
          <p className="mt-2 text-iron-gray">Loading week schedule...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-iron-orange text-iron-black rounded font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!weekData) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-iron-dark-gray border border-iron-gray rounded-lg p-4">
        <h2 className="text-lg font-semibold text-iron-white mb-1">
          Week {weekData.week_index + 1} of {weekData.program.duration_weeks}
        </h2>
        <p className="text-sm text-iron-gray">
          {new Date(weekData.week_start).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}{' '}
          -{' '}
          {new Date(weekData.week_end).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <p className="text-xs text-iron-gray mt-1">
          Goal: {weekData.program.primary_goal}
        </p>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-3">
        {weekData.schedule.map((day) => {
          const totalCalories = day.meals.reduce(
            (sum, meal) => sum + meal.totals.calories,
            0
          )
          const isCompleted = day.training_session?.completed_at

          return (
            <div
              key={day.day_index}
              className={`bg-iron-dark-gray border rounded-lg p-4 ${
                day.is_today
                  ? 'border-iron-orange'
                  : 'border-iron-gray'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-iron-white">
                      {day.day_name}
                    </h3>
                    {day.is_today && (
                      <span className="px-2 py-0.5 rounded text-xs bg-iron-orange text-iron-black font-semibold">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-iron-gray mt-0.5">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {day.is_today && (
                  <button
                    onClick={() => router.push('/plan/today')}
                    className="px-3 py-1.5 rounded text-sm bg-iron-orange text-iron-black font-semibold hover:bg-iron-orange/90"
                  >
                    View Details
                  </button>
                )}
              </div>

              {/* Training Session */}
              {day.is_rest_day ? (
                <div className="p-3 rounded bg-iron-black/50 border border-iron-gray/30 text-center">
                  <span className="text-2xl block mb-1">😴</span>
                  <p className="text-sm text-iron-gray">Rest Day</p>
                </div>
              ) : (
                <div
                  className={`p-3 rounded border ${
                    isCompleted
                      ? 'bg-green-900/10 border-green-700/50'
                      : 'bg-iron-black/50 border-iron-gray/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💪</span>
                        <div>
                          <p className="text-sm font-medium text-iron-white">
                            {day.training_session?.session_name}
                          </p>
                          <p className="text-xs text-iron-gray mt-0.5">
                            {day.training_session?.exercise_count} exercises •{' '}
                            {day.training_session?.estimated_duration_minutes} min •{' '}
                            {day.training_session?.time_of_day}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isCompleted && (
                      <span className="px-2 py-1 rounded text-xs bg-green-900/30 border border-green-700 text-green-300">
                        ✓ Done
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Meals Summary */}
              <div className="mt-3 p-3 rounded bg-iron-black/50 border border-iron-gray/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍽️</span>
                    <div>
                      <p className="text-sm font-medium text-iron-white">
                        {day.meals.length} Meals
                      </p>
                      <p className="text-xs text-iron-gray">
                        {totalCalories} calories total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-iron-gray">
                      {day.meals.map((m) => m.meal_type).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Back to Today Button */}
      <button
        onClick={() => router.push('/plan/today')}
        className="w-full py-3 bg-iron-orange text-iron-black rounded-lg font-semibold hover:bg-iron-orange/90 transition-colors"
      >
        Back to Today
      </button>
    </div>
  )
}
