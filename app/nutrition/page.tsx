'use client'

/**
 * Nutrition Page - Simple Meals List
 *
 * Week 2.5: Basic meals list for quick verification
 * - Shows recent meals logged by coach
 * - No daily summary (keeping it minimal)
 * - Proper bottom spacing for nav
 */

import { useEffect, useState } from 'react'
import { getMeals, MealAPI } from '@/lib/api/nutrition'
import { BottomNav } from '@/components/BottomNav'
import { format } from 'date-fns'

export default function NutritionPage() {
  const [meals, setMeals] = useState<MealAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMeals() {
      try {
        setLoading(true)
        const mealsData = await getMeals({ limit: 50 })
        setMeals(mealsData)
      } catch (err) {
        console.error('Failed to fetch meals:', err)
        setError('Failed to load meals')
      } finally {
        setLoading(false)
      }
    }

    fetchMeals()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-iron-black text-iron-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iron-orange mx-auto mb-4"></div>
          <p className="text-iron-gray">Loading meals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-iron-black text-iron-white flex items-center justify-center pb-40">
        <div className="text-center px-4">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-iron-orange text-iron-black rounded-lg font-medium"
          >
            Retry
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iron-black text-iron-white pb-40">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-iron-black border-b border-iron-gray/30 px-4 py-4">
        <h1 className="text-2xl font-bold">Meals</h1>
        <p className="text-sm text-iron-gray">Recent meals logged</p>
      </div>

      {/* Meals List */}
      <div className="px-4 py-6 space-y-4">
        {meals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-xl font-semibold mb-2 text-iron-white">No meals yet</h2>
            <p className="text-iron-gray">
              Start logging meals with your coach!
            </p>
          </div>
        ) : (
          meals.map((meal) => (
            <div
              key={meal.id}
              className="bg-iron-dark-gray border border-iron-gray rounded-lg p-4"
            >
              {/* Meal Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-iron-white capitalize">
                    {meal.meal_type}
                  </h3>
                  <p className="text-xs text-iron-gray">
                    {format(new Date(meal.logged_at), 'MMM d, h:mm a')}
                  </p>
                </div>
                {meal.source === 'coach_chat' && (
                  <span className="text-xs bg-iron-orange/20 text-iron-orange px-2 py-1 rounded">
                    AI Logged
                  </span>
                )}
              </div>

              {/* Meal Items */}
              {meal.items && meal.items.length > 0 && (
                <div className="space-y-2 mb-3 border-t border-iron-gray/30 pt-3">
                  {meal.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-iron-white">
                        {item.foods?.name || 'Unknown'} ({item.grams}g)
                      </span>
                      <span className="text-iron-gray">
                        {Math.round(item.calories)} cal
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-iron-gray/30">
                <div className="text-center">
                  <div className="text-lg font-bold text-iron-orange">
                    {Math.round(meal.total_calories)}
                  </div>
                  <div className="text-xs text-iron-gray">cal</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-iron-white">
                    {Math.round(meal.total_protein_g)}g
                  </div>
                  <div className="text-xs text-iron-gray">protein</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-iron-white">
                    {Math.round(meal.total_carbs_g)}g
                  </div>
                  <div className="text-xs text-iron-gray">carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-iron-white">
                    {Math.round(meal.total_fat_g)}g
                  </div>
                  <div className="text-xs text-iron-gray">fat</div>
                </div>
              </div>

              {/* Notes */}
              {meal.notes && (
                <div className="mt-3 pt-3 border-t border-iron-gray/30">
                  <p className="text-sm text-iron-gray italic">{meal.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
