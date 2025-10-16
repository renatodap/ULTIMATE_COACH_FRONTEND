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

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import DailySummaryCard from '@/components/shared/DailySummaryCard'
import MealTypeCard from '../components/nutrition/MealTypeCard'
import DateRangeControls from '@/app/components/ui/DateRangeControls'
import SegmentedControl from '@/app/components/ui/SegmentedControl'
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { FAB } from '@/components/shared/FAB'
import { useOnboardingCheck } from '@/lib/hooks/useOnboardingCheck'
import { getDailyNutrition, deleteMeal } from '@/lib/api/nutrition'
import { transformDailyNutrition } from '@/lib/utils/nutrition-transformer'
import type { DailyNutrition } from '@/lib/types/nutrition'
import { useTranslation } from '@/lib/i18n'
import { useTimezone } from '@/lib/context/TimezoneContext'

// Animation variants
const summaryVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
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
    transition: { duration: 0.3 }
  }
}

const emptyStateVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
}

const fabVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, delay: 0.2 }
  }
}

// Wrap component to handle useSearchParams
function NutritionPageContent() {
  // Translation hook
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { timezone } = useTimezone()

  // Check authentication and onboarding status
  const { loading: authLoading, onboardingComplete } = useOnboardingCheck()

  const [nutritionData, setNutritionData] = useState<DailyNutrition | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get date from URL or default to today
  const selectedDate = searchParams?.get('date') || new Date().toISOString().split('T')[0]

  // Update URL when date changes
  const handleDateChange = (newDate: string) => {
    router.push(`/nutrition?date=${newDate}`)
  }

  // Fetch nutrition data function (with refresh support)
  const loadNutritionData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setDataLoading(true)
      }
      setError(null)

      const { stats, meals } = await getDailyNutrition(selectedDate, timezone)
      const transformed = transformDailyNutrition(stats, meals)
      setNutritionData(transformed)

      if (isRefresh) {
        toast.success('Nutrition data refreshed!')
      }
    } catch (err) {
      console.error('Failed to load nutrition data:', err)
      setError('Failed to load nutrition data')
      toast.error('Failed to load nutrition data')
    } finally {
      setDataLoading(false)
      setRefreshing(false)
    }
  }, [selectedDate, timezone])

  // Fetch nutrition data only after auth is confirmed
  useEffect(() => {
    if (authLoading || !onboardingComplete) {
      return // Wait for auth check to complete
    }

    loadNutritionData()
  }, [selectedDate, authLoading, onboardingComplete, loadNutritionData])

  const handleRefresh = () => {
    loadNutritionData(true)
  }

  const handleEditMeal = (mealId: string) => {
    router.push(`/nutrition/meals/${mealId}?returnDate=${selectedDate}`)
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm(t('nutrition.deleteMealConfirm'))) {
      return
    }

    const toastId = toast.loading('Deleting meal...')

    try {
      await deleteMeal(mealId)
      toast.success('Meal deleted!', { id: toastId })
      // Refresh data after deletion
      await loadNutritionData()
    } catch (err) {
      console.error('Failed to delete meal:', err)
      toast.error('Failed to delete meal', { id: toastId })
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
        <LoadingScreen message={t('nutrition.verifyingAuth')} showBottomNav />
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
        <LoadingScreen message={t('nutrition.loadingNutritionData')} showBottomNav />
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
              {t('nutrition.pageTitle')}
            </h1>
          </div>
        </header>
        <div className="flex items-center justify-center px-4 py-12">
          <div className="card-glass border border-red-500/50 p-8 text-center max-w-md">
            <p className="text-4xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold text-iron-white uppercase tracking-wider mb-2">
              {t('nutrition.unableToLoadData')}
            </h2>
            <p className="text-iron-gray mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-6 py-3"
            >
              {t('nutrition.tryAgain')}
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
      {/* Header - NEW CONSISTENT DESIGN */}
      <PageHeader
        title={t('nutrition.pageTitle')}
        showRefresh={true}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Sticky Controls (mobile-first) */}
      <div className="sticky top-16 z-[90] bg-iron-black/95 backdrop-blur border-b border-iron-gray/30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            <SegmentedControl
              options={[{ key: 'day', label: 'Day' }]}
              value={'day'}
              onChange={() => {}}
            />
            <DateRangeControls mode="day" date={selectedDate} onChange={handleDateChange} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`max-w-4xl mx-auto px-4 ${hasNoMeals ? 'flex-1 flex flex-col' : 'py-6'}`}>
        {/* Daily Summary */}
        <motion.div
          className={hasNoMeals ? 'mb-4' : ''}
          variants={summaryVariants}
          initial="hidden"
          animate="visible"
        >
          <DailySummaryCard type="nutrition" summary={nutritionData} />
        </motion.div>

        {/* Meals Section */}
        <div className={hasNoMeals ? 'flex-1 flex flex-col justify-center' : ''}>
          {!hasNoMeals && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-iron-white uppercase tracking-wider">
                🍽️ {t('nutrition.todaysMeals')}
              </h2>
              <span className="text-xs text-iron-gray uppercase tracking-wider">
                {nutritionData.meals.length} {nutritionData.meals.length !== 1 ? t('nutrition.meals') : t('nutrition.meal')}
              </span>
            </div>
          )}

          {nutritionData.meals.length > 0 ? (
            <motion.div
              className="space-y-4"
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
            <EmptyState
              icon="🍽️"
              title="No Meals Logged"
              subtitle="Start tracking your nutrition to hit your calorie and macro goals"
              actionLabel="Log Your First Meal"
              onAction={() => router.push('/nutrition/log')}
            />
          )}
        </div>
      </main>

      {/* FAB - Floating Action Button */}
      <FAB
        href="/nutrition/log"
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

// Export with Suspense wrapper for useSearchParams
export default function NutritionPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading nutrition..." />}>
      <NutritionPageContent />
    </Suspense>
  )
}
