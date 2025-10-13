'use client'

/**
 * Nutrition Page
 *
 * Main nutrition tracking page - displays daily nutrition summary and all meals.
 * Mobile-first design with collapsible meal cards.
 *
 * Features:
 * - Daily calorie and macro summary
 * - Meal cards grouped by type (breakfast/lunch/dinner/snack)
 * - Expandable food items within each meal
 * - Button to log new meals
 * - Real-time data from API
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import DailySummaryCard from '../components/nutrition/DailySummaryCard'
import MealTypeCard from '../components/nutrition/MealTypeCard'
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { useOnboardingCheck } from '@/lib/hooks/useOnboardingCheck'
import { getDailyNutrition, deleteMeal } from '@/lib/api/nutrition'
import { transformDailyNutrition } from '@/lib/utils/nutrition-transformer'
import { mockNutritionData } from '@/lib/mock-data/nutrition'
import type { DailyNutrition } from '@/lib/types/nutrition'

// Animation variants
const summaryVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}

const mealListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
}

const mealCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}

const emptyStateVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}

const fabVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut', delay: 0.2 }
  }
}

export default function NutritionPage() {
  // Check authentication and onboarding status
  const { loading: authLoading, onboardingComplete } = useOnboardingCheck()

  const [nutritionData, setNutritionData] = useState<DailyNutrition | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  // Fetch nutrition data only after auth is confirmed
  useEffect(() => {
    if (authLoading || !onboardingComplete) {
      return // Wait for auth check to complete
    }

    async function fetchData() {
      try {
        setDataLoading(true)
        setError(null)

        const { stats, meals } = await getDailyNutrition(selectedDate)
        const transformed = transformDailyNutrition(stats, meals)
        setNutritionData(transformed)
      } catch (err) {
        console.error('Failed to load nutrition data:', err)
        setError('Failed to load nutrition data')
        // Fallback to mock data in development
        if (process.env.NODE_ENV === 'development') {
          setNutritionData(mockNutritionData)
        }
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [selectedDate, authLoading, onboardingComplete])

  const handleEditMeal = (mealId: string) => {
    // TODO: Phase 3 - Implement meal editing
    // Placeholder for meal editing functionality
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) {
      return
    }

    try {
      await deleteMeal(mealId)

      // Refresh data after deletion
      const { stats, meals } = await getDailyNutrition(selectedDate)
      const transformed = transformDailyNutrition(stats, meals)
      setNutritionData(transformed)
    } catch (err) {
      console.error('Failed to delete meal:', err)
      alert('Failed to delete meal. Please try again.')
    }
  }

  const handleEditFoodItem = (mealId: string, itemId: string) => {
    // TODO: Phase 2 - Implement food item editing
    // Placeholder for food item editing functionality
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <>
        <LoadingScreen message="Verifying authentication..." showBottomNav />
        <BottomNav />
      </>
    )
  }

  // Don't render if onboarding not complete (hook will redirect)
  if (!onboardingComplete) {
    return null
  }

  // Show loading state while fetching nutrition data
  if (dataLoading && !nutritionData) {
    return (
      <>
        <LoadingScreen message="Loading nutrition data..." showBottomNav />
        <BottomNav />
      </>
    )
  }

  // Error state (only show if no data and not in development)
  if (error && !nutritionData) {
    return (
      <div className="min-h-screen bg-iron-black pb-20">
        <header className="sticky top-0 z-40 bg-iron-black border-b border-iron-gray/30">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-iron-white uppercase tracking-wider">
              Nutrition Tracker
            </h1>
          </div>
        </header>
        <div className="flex items-center justify-center px-4 py-12">
          <div className="card-glass border border-red-500/50 p-8 text-center max-w-md">
            <p className="text-4xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold text-iron-white uppercase tracking-wider mb-2">
              Unable to Load Data
            </h2>
            <p className="text-iron-gray mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-6 py-3"
            >
              Try Again
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  // Ensure we have data before rendering
  if (!nutritionData) {
    return null
  }

  const hasNoMeals = nutritionData.meals.length === 0

  return (
    <div className={`bg-iron-black ${hasNoMeals ? 'h-screen flex flex-col' : 'min-h-screen pb-20'}`}>
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-iron-black border-b border-iron-gray/30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-iron-white uppercase tracking-wider">
                Nutrition Tracker
              </h1>
              <p className="text-sm text-iron-gray mt-1 uppercase tracking-wider">
                {new Date(nutritionData.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-4xl mx-auto px-4 ${hasNoMeals ? 'flex-1 flex flex-col' : 'py-6'}`}>
        {/* Daily Summary */}
        <motion.div
          className={hasNoMeals ? 'mb-4' : ''}
          variants={summaryVariants}
          initial="hidden"
          animate="visible"
        >
          <DailySummaryCard
            totalCalories={nutritionData.totalCalories}
            totalProtein={nutritionData.totalProtein}
            totalCarbs={nutritionData.totalCarbs}
            totalFat={nutritionData.totalFat}
            calorieGoal={nutritionData.calorieGoal}
            proteinGoal={nutritionData.proteinGoal}
            carbsGoal={nutritionData.carbsGoal}
            fatGoal={nutritionData.fatGoal}
          />
        </motion.div>

        {/* Meals Section */}
        <div className={hasNoMeals ? 'flex-1 flex flex-col justify-center mb-4' : 'mb-6'}>
          {!hasNoMeals && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-iron-gray text-xs uppercase tracking-wider">
                🍽️ Today&apos;s Meals
              </h2>
              <span className="text-xs text-iron-gray uppercase tracking-wider">
                {nutritionData.meals.length} meal{nutritionData.meals.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {nutritionData.meals.length > 0 ? (
            <motion.div
              className="space-y-3"
              variants={mealListVariants}
              initial="hidden"
              animate="visible"
            >
              {nutritionData.meals.map((meal) => (
                <motion.div key={meal.id} variants={mealCardVariants}>
                  <MealTypeCard
                    meal={meal}
                    onEdit={() => handleEditMeal(meal.id)}
                    onDelete={() => handleDeleteMeal(meal.id)}
                    onEditFoodItem={(item) => handleEditFoodItem(meal.id, item.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="card-glass border border-iron-gray/30 p-8 text-center"
              variants={emptyStateVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="text-3xl mb-3">🍽️</div>
              <h3 className="text-lg font-semibold text-iron-white mb-2 uppercase tracking-wider">
                No Meals Logged Yet
              </h3>
              <p className="text-iron-gray text-sm max-w-xs mx-auto">
                Start tracking your nutrition by logging your first meal
              </p>
            </motion.div>
          )}
        </div>

        {/* Log New Meal Button */}
        <button
          onClick={() => {
            window.location.href = '/nutrition/log'
          }}
          className="w-full bg-iron-orange text-iron-black py-4 border-2 border-iron-orange font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-iron-black hover:text-iron-orange transition-colors active:scale-95"
        >
          <Plus className="w-6 h-6" />
          Log New Meal
        </button>
      </main>

      {/* Floating Action Button - Always visible above bottom nav */}
      <motion.button
        onClick={() => {
          window.location.href = '/nutrition/log'
        }}
        className="group fixed bottom-24 right-4 z-[200] w-14 h-14 bg-iron-orange border-2 border-iron-orange flex items-center justify-center hover:bg-iron-black transition-colors active:scale-95 shadow-lg hover:shadow-iron-orange/50"
        aria-label="Log new meal"
        variants={fabVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus className="w-7 h-7 text-iron-black group-hover:text-iron-orange transition-colors" />
      </motion.button>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
