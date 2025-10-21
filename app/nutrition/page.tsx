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

import { Suspense, useRef, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import DailySummaryCard from '@/components/shared/DailySummaryCard'
import MealTypeCard from '../components/nutrition/MealTypeCard'
import DateRangeControls from '@/app/components/ui/DateRangeControls'
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { FAB } from '@/components/shared/FAB'
import { StickyMiniSummary } from '@/components/shared/StickyMiniSummary'
import { useOnboardingCheck } from '@/lib/hooks/useOnboardingCheck'
import { useNutritionData } from '@/lib/hooks/useNutritionData'
import { useTranslation } from '@/lib/i18n'
import { useTimezone } from '@/lib/context/TimezoneContext'
import { createQuickMeal } from '@/lib/api/quick-meals'
import type { Meal } from '@/lib/types/nutrition'

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

  // Intersection Observer for smart summary display
  const [bigCardVisible, setBigCardVisible] = useState(true)
  const bigCardRef = useRef<HTMLDivElement>(null)

  // Save as template modal state
  const [savingMeal, setSavingMeal] = useState<Meal | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)

  // Check authentication and onboarding status
  const { loading: authLoading, onboardingComplete } = useOnboardingCheck()

  // Use nutrition data hook
  const {
    data: nutritionData,
    loading: dataLoading,
    refreshing,
    error,
    selectedDate,
    setSelectedDate,
    refresh,
    deleteMealAndRefresh
  } = useNutritionData({
    timezone,
    initialDate: searchParams?.get('date') || undefined,
    skip: authLoading || !onboardingComplete,
    onSuccess: () => {
      // Optional: Add any success handling here
    },
    onError: (err) => {
      toast.error(err.message)
    }
  })

  // Update URL when date changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    router.push(`/nutrition?date=${newDate}`)
  }

  const handleRefresh = () => {
    refresh()
    toast.success('Nutrition data refreshed!')
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
      await deleteMealAndRefresh(mealId)
      toast.success('Meal deleted!', { id: toastId })
    } catch (err) {
      console.error('Failed to delete meal:', err)
      toast.error('Failed to delete meal', { id: toastId })
    }
  }

  const handleEditFoodItem = (mealId: string, itemId: string) => {
    // TODO: Phase 2 - Implement food item editing
    // Placeholder for food item editing functionality
  }

  const handleSaveAsTemplate = (meal: Meal) => {
    setSavingMeal(meal)
    setTemplateName(meal.name || `${meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)} Template`)
    setTemplateDescription('')
  }

  const handleSaveTemplateSubmit = async () => {
    if (!savingMeal || !templateName.trim()) {
      toast.error('Please enter a template name')
      return
    }

    setIsSavingTemplate(true)

    try {
      await createQuickMeal({
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        foods: savingMeal.foodItems.map((item, index) => ({
          food_id: item.foodId,
          quantity: item.quantity,
          serving_id: item.servingId || undefined,
          display_order: index
        }))
      })

      toast.success('Quick meal template saved!')
      setSavingMeal(null)
      setTemplateName('')
      setTemplateDescription('')
    } catch (err) {
      console.error('Failed to save template:', err)
      toast.error('Failed to save template. Please try again.')
    } finally {
      setIsSavingTemplate(false)
    }
  }

  // Set up Intersection Observer for smart summary transition
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setBigCardVisible(entry.isIntersecting)
      },
      {
        threshold: 0.1, // Trigger when 10% of card is visible
        rootMargin: '-56px 0px 0px 0px' // Account for header height
      }
    )

    const currentRef = bigCardRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

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
    <div className={`bg-iron-black ${hasNoMeals ? 'h-screen flex flex-col' : 'min-h-screen pb-36'}`}>
      {/* Header with integrated date controls */}
      <PageHeader
        title={t('nutrition.pageTitle')}
        showRefresh={true}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        rightAction={
          <div className="hidden sm:block">
            <DateRangeControls mode="day" date={selectedDate} onChange={handleDateChange} />
          </div>
        }
      />

      {/* Mobile date controls - below header, not sticky */}
      <div className="sm:hidden bg-iron-black border-b border-iron-gray/30 px-4 py-3">
        <DateRangeControls mode="day" date={selectedDate} onChange={handleDateChange} />
      </div>

      {/* Sticky Mini Summary - Only visible when big card scrolls away */}
      {nutritionData && (
        <StickyMiniSummary
          type="nutrition"
          totalCalories={nutritionData.totalCalories}
          calorieGoal={nutritionData.calorieGoal}
          protein={nutritionData.totalProtein}
          carbs={nutritionData.totalCarbs}
          fat={nutritionData.totalFat}
          className={`transition-opacity duration-300 ${bigCardVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        />
      )}

      {/* Main Content */}
      <main className={`max-w-4xl mx-auto px-4 ${hasNoMeals ? 'flex-1 flex flex-col' : 'py-6'}`}>
        {/* Daily Summary - with ref for Intersection Observer */}
        <motion.div
          ref={bigCardRef}
          className={hasNoMeals ? 'mb-4' : 'mb-6'}
          variants={summaryVariants}
          initial="hidden"
          animate="visible"
        >
          <DailySummaryCard type="nutrition" summary={nutritionData} />
        </motion.div>

        {/* Meals Section */}
        <div className={hasNoMeals ? 'flex-1 flex flex-col justify-center' : ''}>
          {!hasNoMeals && (
            <div className="flex items-center justify-between mb-6">
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
              className="space-y-6"
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
                    onSaveAsTemplate={() => handleSaveAsTemplate(meal)}
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
        positioning="high"
      />

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Save as Template Modal */}
      {savingMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-iron-dark-gray border border-iron-gray max-w-md w-full p-6 rounded-xl">
            <h3 className="font-heading text-xl text-iron-white uppercase tracking-wider mb-4">
              Save as Quick Meal
            </h3>

            <p className="text-sm text-iron-gray mb-4">
              Save this meal as a quick meal template to easily log it again in the future.
            </p>

            <div className="mb-4">
              <label className="block text-sm text-iron-white font-medium mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Morning Protein Shake"
                className="w-full bg-iron-black border border-iron-gray px-4 py-3 text-iron-white placeholder:text-iron-gray focus:border-iron-orange focus:outline-none rounded-lg"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-iron-white font-medium mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="e.g., My go-to pre-workout fuel"
                className="w-full bg-iron-black border border-iron-gray px-4 py-3 text-iron-white placeholder:text-iron-gray focus:border-iron-orange focus:outline-none rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSavingMeal(null)}
                disabled={isSavingTemplate}
                className="flex-1 bg-iron-gray/10 text-iron-white py-3 font-medium hover:bg-iron-gray/20 transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplateSubmit}
                disabled={isSavingTemplate || !templateName.trim()}
                className="flex-1 bg-iron-orange text-iron-black py-3 font-medium hover:bg-iron-orange/90 transition-colors rounded-lg disabled:opacity-50"
              >
                {isSavingTemplate ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
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
