'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import WorkoutCard from '@/components/program/WorkoutCard'
import MealCard from '@/components/program/MealCard'

interface TodaysPlan {
  date: string
  program: {
    id: string
    primary_goal: string
    program_start_date: string
    duration_weeks: number
  }
  training_session: {
    id: string
    session_kind: string
    session_name: string
    time_of_day: string
    estimated_duration_minutes: number
    notes?: string
    state: string
    completed_at?: string | null
    exercises: Array<{
      name: string
      muscle_groups: string[]
      sets: number
      rep_range: string
      rest_seconds: number
      rir?: number
      notes?: string
    }>
  } | null
  meals: Array<{
    id: string
    meal_type: string
    meal_name: string
    notes?: string
    completed_at?: string | null
    totals: {
      calories: number
      protein_g: number
      carbs_g: number
      fat_g: number
    }
    items: Array<{
      food_name: string
      serving_size: number
      serving_unit: string
      calories: number
      protein_g: number
      carbs_g: number
      fat_g: number
    }>
  }>
  daily_targets: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
  week_info: {
    week_index: number
    day_index: number
    days_elapsed: number
  }
}

export default function TodayPage() {
  const router = useRouter()
  const [plan, setPlan] = useState<TodaysPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTodaysPlan()
  }, [])

  async function fetchTodaysPlan() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/programs/today`,
        {
          credentials: 'include',
        }
      )

      if (!res.ok) {
        if (res.status === 404) {
          setError('No program found. Generate a program first.')
          return
        }
        throw new Error('Failed to fetch today\'s plan')
      }

      const data = await res.json()
      setPlan(data)
    } catch (err) {
      console.error('Error fetching plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to load plan')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkSessionComplete(sessionId: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/programs/sessions/${sessionId}/complete`,
        {
          method: 'PATCH',
          credentials: 'include',
        }
      )

      if (!res.ok) {
        throw new Error('Failed to mark session complete')
      }

      // Refresh the plan
      await fetchTodaysPlan()
    } catch (err) {
      console.error('Error marking session complete:', err)
      alert('Failed to mark session complete. Please try again.')
    }
  }

  async function handleMarkMealComplete(mealId: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/programs/meals/${mealId}/complete`,
        {
          method: 'PATCH',
          credentials: 'include',
        }
      )

      if (!res.ok) {
        throw new Error('Failed to mark meal complete')
      }

      // Refresh the plan
      await fetchTodaysPlan()
    } catch (err) {
      console.error('Error marking meal complete:', err)
      alert('Failed to mark meal complete. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-iron-orange"></div>
          <p className="mt-2 text-iron-gray">Loading today's plan...</p>
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

  if (!plan) {
    return null
  }

  const totalMealCalories = plan.meals.reduce((sum, meal) => sum + meal.totals.calories, 0)
  const totalMealProtein = plan.meals.reduce((sum, meal) => sum + meal.totals.protein_g, 0)
  const totalMealCarbs = plan.meals.reduce((sum, meal) => sum + meal.totals.carbs_g, 0)
  const totalMealFat = plan.meals.reduce((sum, meal) => sum + meal.totals.fat_g, 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-iron-dark-gray border border-iron-gray rounded-lg p-4">
        <h2 className="text-lg font-semibold text-iron-white mb-1">
          Today's Plan
        </h2>
        <p className="text-sm text-iron-gray">
          {new Date(plan.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <div className="mt-2 flex items-center gap-4 text-xs text-iron-gray">
          <span>Goal: {plan.program.primary_goal}</span>
          <span>•</span>
          <span>
            Week {plan.week_info.week_index + 1} of {plan.program.duration_weeks}
          </span>
          <span>•</span>
          <span>Day {plan.week_info.day_index + 1}</span>
        </div>
      </div>

      {/* Daily Targets */}
      <div className="bg-iron-dark-gray border border-iron-gray rounded-lg p-4">
        <h3 className="text-sm font-semibold text-iron-white mb-3">
          Daily Nutrition Targets
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-xs text-iron-gray mb-1">Calories</div>
            <div className="text-lg font-bold text-iron-white">
              {totalMealCalories}
            </div>
            <div className="text-xs text-iron-gray">
              of {plan.daily_targets.calories}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-iron-gray mb-1">Protein</div>
            <div className="text-lg font-bold text-iron-white">
              {Math.round(totalMealProtein)}g
            </div>
            <div className="text-xs text-iron-gray">
              of {plan.daily_targets.protein_g}g
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-iron-gray mb-1">Carbs</div>
            <div className="text-lg font-bold text-iron-white">
              {Math.round(totalMealCarbs)}g
            </div>
            <div className="text-xs text-iron-gray">
              of {plan.daily_targets.carbs_g}g
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-iron-gray mb-1">Fat</div>
            <div className="text-lg font-bold text-iron-white">
              {Math.round(totalMealFat)}g
            </div>
            <div className="text-xs text-iron-gray">
              of {plan.daily_targets.fat_g}g
            </div>
          </div>
        </div>
      </div>

      {/* Training Session */}
      {plan.training_session ? (
        <div>
          <h3 className="text-sm font-semibold text-iron-gray mb-2 px-1">
            Today's Workout
          </h3>
          <WorkoutCard
            session={plan.training_session}
            onComplete={() => handleMarkSessionComplete(plan.training_session!.id)}
          />
        </div>
      ) : (
        <div className="bg-iron-dark-gray border border-iron-gray rounded-lg p-6 text-center">
          <span className="text-4xl mb-2 block">😴</span>
          <h3 className="text-base font-semibold text-iron-white mb-1">
            Rest Day
          </h3>
          <p className="text-sm text-iron-gray">
            No workout scheduled today. Your muscles are recovering and growing!
          </p>
        </div>
      )}

      {/* Meals */}
      <div>
        <h3 className="text-sm font-semibold text-iron-gray mb-2 px-1">
          Today's Meals
        </h3>
        <div className="space-y-3">
          {plan.meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onComplete={() => handleMarkMealComplete(meal.id)}
            />
          ))}
        </div>
      </div>

      {/* View Week Button */}
      <button
        onClick={() => router.push('/plan/week')}
        className="w-full py-3 bg-iron-gray/20 border border-iron-gray rounded-lg text-iron-white font-semibold hover:bg-iron-gray/30 transition-colors"
      >
        View Full Week Schedule
      </button>
    </div>
  )
}
