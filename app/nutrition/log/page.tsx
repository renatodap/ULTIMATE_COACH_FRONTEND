'use client'

/**
 * Nutrition Log Page - Complete Edition
 *
 * Full-featured meal logging with:
 * - Quick meals display and instant logging
 * - Recent foods for quick access
 * - Live search with unified results
 * - Inline editing of meal items
 * - Save current meal as quick meal
 * - Complete API integration
 *
 * CRITICAL STATE MANAGEMENT RULES (See NUTRITION_LOGGING_ARCHITECTURE.md):
 * 1. modalQuantity has TWO meanings: grams (if serving_id=null) OR serving count (if serving_id present)
 * 2. MUST reset modalQuantity when:
 *    a) Switching between grams/serving modes (line 624-641)
 *    b) Selecting a serving from dropdown (line 695-700)
 *    c) Opening modal for new food (line 132-143)
 * 3. Frontend calculations are PREVIEW ONLY - backend recalculates everything
 *
 * VALIDATION LAYERS:
 * - HTML: max=20 servings (line 674)
 * - Frontend Warning: >10 servings (line 677-680)
 * - Backend Rejection: >50 servings (nutrition_service.py:693-698)
 */

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, X, Loader2, Edit2, Check, Star, Clock, Sparkles } from 'lucide-react'
import { getDefaultMealType } from '@/lib/utils/meal-time'
import { BottomNav } from '@/components/BottomNav'
import { FABFullWidth } from '@/components/shared/FAB'
import Toast from '@/app/components/shared/Toast'
import { useOnboardingCheck } from '@/lib/hooks/useOnboardingCheck'
import { useUserLanguage } from '@/lib/hooks/useUserLanguage'
import { useTranslation } from '@/lib/i18n'
import { useTimezone } from '@/lib/context/TimezoneContext'
import { toUTC } from '@/lib/utils/timezone'
import { searchFoods, getRecentFoods, getFood } from '@/lib/api/foods'
import { listQuickMeals, createQuickMeal, logQuickMeal } from '@/lib/api/quick-meals'
import { createMeal } from '@/lib/api/nutrition'
import { calculateFoodNutrition, formatNutrition } from '@/lib/utils/nutrition-calculator'
import type { Food, FoodServing, MealItemPreview, QuickMeal } from '@/lib/types/food'
import type { CreateMealRequest, CreateMealItemRequest } from '@/lib/api/nutrition'

export default function LogMealPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams?.get('mode')
  const isTemplateMode = mode === 'create'

  const { loading: authLoading, onboardingComplete } = useOnboardingCheck()
  const { getFoodName, getBrandName } = useUserLanguage()
  const { t } = useTranslation()
  const { timezone } = useTimezone()

  // Data loading state
  const [quickMeals, setQuickMeals] = useState<QuickMeal[]>([])
  const [recentFoods, setRecentFoods] = useState<Food[]>([])
  const [initialLoading, setInitialLoading] = useState(true)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Food[]>([])
  const [searching, setSearching] = useState(false)

  // Meal building state
  const [mealItems, setMealItems] = useState<MealItemPreview[]>([])
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'>(getDefaultMealType())
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(0)

  // Progressive disclosure states
  const [showQuickMeals, setShowQuickMeals] = useState(true)
  const [showRecentFoods, setShowRecentFoods] = useState(true)

  // Modal states
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [modalQuantity, setModalQuantity] = useState<number>(100)
  const [modalUnit, setModalUnit] = useState<'grams' | 'serving'>('grams')
  const [modalServing, setModalServing] = useState<FoodServing | null>(null)
  const [loadingFoodDetails, setLoadingFoodDetails] = useState(false)

  // Smart defaults: Remember last entered quantity for better UX
  const [lastEnteredQuantity, setLastEnteredQuantity] = useState<number>(100)

  // Save as quick meal modal
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [quickMealName, setQuickMealName] = useState('')
  const [quickMealDescription, setQuickMealDescription] = useState('')
  const [saving, setSaving] = useState(false)

  // Logging state
  const [logging, setLogging] = useState(false)

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Fetch initial data
  useEffect(() => {
    if (authLoading || !onboardingComplete) {
      return
    }

    async function fetchInitialData() {
      try {
        setInitialLoading(true)
        const [meals, recent] = await Promise.all([
          listQuickMeals().catch(() => []),
          getRecentFoods(10).catch(() => [])
        ])
        setQuickMeals(meals)
        setRecentFoods(recent)

        // Set progressive disclosure based on data availability
        setShowQuickMeals(meals.length > 0)
        setShowRecentFoods(recent.length >= 3)
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchInitialData()
  }, [authLoading, onboardingComplete])

  // Progressive disclosure: Hide Quick Meals & Recent Foods when searching
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setShowQuickMeals(false)
      setShowRecentFoods(false)
    } else {
      setShowQuickMeals(quickMeals.length > 0)
      setShowRecentFoods(recentFoods.length >= 3)
    }
  }, [searchQuery, quickMeals.length, recentFoods.length])

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true)
        const results = await searchFoods(searchQuery, 20)
        setSearchResults(results.foods || [])
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle quick meal logging
  const handleLogQuickMeal = async (quickMealId: string) => {
    try {
      setLogging(true)
      await logQuickMeal(quickMealId)
      router.push('/nutrition')
    } catch (error) {
      console.error('Failed to log quick meal:', error)
      setToast({ message: t('nutrition.failedToLogQuickMeal'), type: 'error' })
    } finally {
      setLogging(false)
    }
  }

  // Handle food selection
  const handleSelectFood = async (food: Food) => {
    console.log('[LOG] Food selected (initial):', {
      name: food.name,
      id: food.id,
      servings_count: food.servings?.length || 0,
      servings: food.servings
    })

    // Show modal immediately with loading state
    setSelectedFood(food)
    setLoadingFoodDetails(true)

    // CRITICAL FIX: Fetch full food details to get servings data
    // Search results may not include servings to keep response light
    try {
      const fullFood = await getFood(food.id)
      console.log('[LOG] Full food loaded:', {
        name: fullFood.name,
        servings_count: fullFood.servings?.length || 0,
        servings: fullFood.servings
      })

      // Update with full food data
      setSelectedFood(fullFood)
      setModalServing(fullFood.servings?.find(s => s.is_default) || fullFood.servings?.[0] || null)
    } catch (err) {
      console.error('Failed to load full food details:', err)
      // Fall back to original food data (already set above)
      setModalServing(food.servings?.find(s => s.is_default) || food.servings?.[0] || null)
    } finally {
      setLoadingFoodDetails(false)
    }

    // CRITICAL: Reset all modal state to defaults
    // This is RESET POINT #1 (see NUTRITION_LOGGING_ARCHITECTURE.md)
    // UX IMPROVEMENT: Use last entered quantity instead of always 100
    // This helps users who are adding multiple similar-sized foods
    setModalQuantity(lastEnteredQuantity)
    setModalUnit('grams')
    // Note: modalServing is now set in the try/catch above after fetching
  }

  // Handle add to meal
  const handleAddToMeal = () => {
    if (!selectedFood) return

    try {
      const nutrition = calculateFoodNutrition(
        selectedFood,
        modalQuantity,
        modalUnit,
        modalServing || undefined
      )

      const newItem: MealItemPreview = {
        food_id: selectedFood.id,
        quantity: modalQuantity,
        unit: modalUnit,
        serving_id: modalServing?.id,
        food: selectedFood,
        serving: modalServing || undefined,
        calculated_grams: nutrition.grams,
        calculated_calories: nutrition.calories,
        calculated_protein_g: nutrition.protein_g,
        calculated_carbs_g: nutrition.carbs_g,
        calculated_fat_g: nutrition.fat_g,
      }

      setMealItems([...mealItems, newItem])

      // UX IMPROVEMENT: Remember the last quantity entered
      // This helps when adding multiple foods of similar sizes
      // Only remember if in grams mode (servings vary too much between foods)
      if (modalUnit === 'grams') {
        setLastEnteredQuantity(modalQuantity)
      }

      setSelectedFood(null)
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      console.error('Failed to add item:', error)
      setToast({ message: t('nutrition.failedToAddItem'), type: 'error' })
    }
  }

  // Handle inline edit
  const handleStartEdit = (index: number) => {
    setEditingItemIndex(index)
    setEditQuantity(mealItems[index].quantity)
  }

  const handleSaveEdit = () => {
    if (editingItemIndex === null) return

    const item = mealItems[editingItemIndex]

    try {
      const nutrition = calculateFoodNutrition(
        item.food,
        editQuantity,
        item.unit,
        item.serving
      )

      const updatedItem: MealItemPreview = {
        ...item,
        quantity: editQuantity,
        calculated_grams: nutrition.grams,
        calculated_calories: nutrition.calories,
        calculated_protein_g: nutrition.protein_g,
        calculated_carbs_g: nutrition.carbs_g,
        calculated_fat_g: nutrition.fat_g,
      }

      const newItems = [...mealItems]
      newItems[editingItemIndex] = updatedItem
      setMealItems(newItems)
      setEditingItemIndex(null)
    } catch (error) {
      console.error('Failed to update item:', error)
      setToast({ message: t('nutrition.failedToUpdateItem'), type: 'error' })
    }
  }

  // Calculate meal totals
  const mealTotals = mealItems.reduce(
    (totals, item) => ({
      calories: totals.calories + item.calculated_calories,
      protein_g: totals.protein_g + item.calculated_protein_g,
      carbs_g: totals.carbs_g + item.calculated_carbs_g,
      fat_g: totals.fat_g + item.calculated_fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  // Handle save as quick meal
  const handleSaveAsQuickMeal = async () => {
    if (!quickMealName.trim() || mealItems.length === 0) {
      setToast({ message: t('nutrition.pleaseProvideName'), type: 'error' })
      return
    }

    try {
      setSaving(true)
      await createQuickMeal({
        name: quickMealName.trim(),
        description: quickMealDescription.trim() || undefined,
        foods: mealItems.map((item, index) => ({
          food_id: item.food_id,
          quantity: item.quantity,
          serving_id: item.serving_id,
          display_order: index
        }))
      })

      // Reset modal
      setShowSaveModal(false)
      setQuickMealName('')
      setQuickMealDescription('')

      setToast({ message: t('nutrition.quickMealSaved'), type: 'success' })

      // Redirect based on mode
      if (isTemplateMode) {
        // In template creation mode, go back to templates page
        router.push('/templates')
      } else {
        // In regular logging mode, refresh quick meals list
        const meals = await listQuickMeals()
        setQuickMeals(meals)
      }
    } catch (error) {
      console.error('Failed to save quick meal:', error)
      setToast({ message: t('nutrition.failedToSaveQuickMeal'), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // Handle log meal
  const handleLogMeal = async () => {
    if (mealItems.length === 0) {
      setToast({ message: t('nutrition.pleaseAddOneItem'), type: 'error' })
      return
    }

    try {
      setLogging(true)

      // Transform MealItemPreview[] to CreateMealItemRequest[]
      // IMPORTANT: Backend will IGNORE calculated_* values and recalculate everything
      // We send them for logging/debugging purposes only
      // See NUTRITION_LOGGING_ARCHITECTURE.md - Frontend/Backend Contract
      const items: CreateMealItemRequest[] = mealItems.map(item => ({
        food_id: item.food_id,

        // CRITICAL: quantity semantic depends on serving_id
        // - If serving_id is null → quantity = grams
        // - If serving_id present → quantity = number of servings
        quantity: item.quantity,
        serving_id: item.serving_id || null,

        // Frontend-calculated values (backend will RECALCULATE and ignore these)
        grams: item.calculated_grams,
        calories: Math.round(item.calculated_calories),
        protein_g: Math.round(item.calculated_protein_g * 10) / 10,
        carbs_g: Math.round(item.calculated_carbs_g * 10) / 10,
        fat_g: Math.round(item.calculated_fat_g * 10) / 10,

        // Display fields (used for showing meal history)
        display_unit: item.unit === 'grams' ? 'g' : item.serving?.serving_unit || 'serving',
        display_label: item.serving?.serving_label || null,
      }))

      const request: CreateMealRequest = {
        meal_type: mealType,
        logged_at: toUTC(new Date(), timezone), // Convert user's current time to UTC
        items,
        source: 'manual'
      }

      console.log('[LOG] Creating meal with request:', {
        meal_type: mealType,
        items_count: items.length,
        items: items.map(i => ({
          food_id: i.food_id,
          quantity: i.quantity,
          serving_id: i.serving_id,
          grams: i.grams,
          calories: i.calories,
          display_unit: i.display_unit
        }))
      })

      await createMeal(request)

      // Navigate back to nutrition page
      router.push('/nutrition')
    } catch (error) {
      console.error('Failed to log meal:', error)
      setToast({ message: t('nutrition.failedToLogMeal'), type: 'error' })
    } finally {
      setLogging(false)
    }
  }

  // Auth loading
  if (authLoading || !onboardingComplete) {
    return (
      <div className="min-h-screen bg-iron-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-iron-orange animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iron-black pb-40">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-iron-black border-b border-iron-gray">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push(isTemplateMode ? '/templates' : '/nutrition')}
            className="text-iron-gray hover:text-iron-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
            aria-label={isTemplateMode ? 'Back to Templates' : t('nutrition.backToNutrition')}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="font-heading text-2xl text-iron-white uppercase tracking-wider">
              {isTemplateMode ? 'Create Quick Meal' : t('nutrition.logMeal')}
            </h1>
            {isTemplateMode && (
              <p className="text-sm text-iron-gray mt-1">
                Build a reusable meal template
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Meal Type Selector - Hidden in template mode */}
        {!isTemplateMode && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-3">
              What meal are you logging?
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {(['breakfast', 'lunch', 'dinner', 'snack', 'other'] as const).map((type) => {
                const isDefault = type === getDefaultMealType()
                return (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`px-4 py-2.5 font-medium transition-colors whitespace-nowrap rounded-lg relative min-h-[44px] ${
                      mealType === type
                        ? 'bg-iron-orange text-iron-black'
                        : 'bg-iron-gray/10 text-iron-white hover:bg-iron-gray/20'
                    }`}
                  >
                    {t(`nutrition.${type}`)}
                    {isDefault && mealType === type && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-iron-orange opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-iron-orange">
                          <Sparkles className="h-2 w-2 text-iron-black m-auto" />
                        </span>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {mealType === getDefaultMealType() && (
              <p className="text-xs text-iron-gray mt-2">
                ✨ Suggested for this time of day
              </p>
            )}
          </div>
        )}

        {/* Quick Meals Section - Hidden in template mode */}
        {!isTemplateMode && !initialLoading && showQuickMeals && quickMeals.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-iron-orange fill-iron-orange" />
              <h2 className="font-heading text-base font-medium text-iron-white uppercase tracking-wider">
                {t('nutrition.quickMeals')}
              </h2>
            </div>
            <p className="text-xs text-iron-gray mb-3">
              ⚡ Tap to log instantly
            </p>
            <div className="space-y-3">
              {quickMeals.slice(0, 5).map((quickMeal) => (
                <button
                  key={quickMeal.id}
                  onClick={() => handleLogQuickMeal(quickMeal.id)}
                  disabled={logging}
                  className="w-full bg-iron-dark-gray border-2 border-iron-orange/30 p-4 text-left hover:border-iron-orange hover:bg-iron-orange/5 transition-all disabled:opacity-50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-iron-white font-semibold flex items-center gap-2 text-base">
                        {quickMeal.name}
                        {quickMeal.is_favorite && <Star className="w-3.5 h-3.5 text-iron-orange fill-iron-orange" />}
                      </div>
                      {quickMeal.description && (
                        <div className="text-sm text-iron-gray mt-1">{quickMeal.description}</div>
                      )}
                      <div className="text-xs text-iron-gray/80 mt-2 flex items-center gap-1">
                        <span>{quickMeal.foods.length} {quickMeal.foods.length !== 1 ? t('nutrition.items') : t('nutrition.item')}</span>
                      </div>
                    </div>
                    <Plus className="w-6 h-6 text-iron-orange flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Foods Section - Hidden in template mode */}
        {!isTemplateMode && !initialLoading && showRecentFoods && recentFoods.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-iron-gray" />
              <h2 className="font-heading text-base font-medium text-iron-white uppercase tracking-wider">
                {t('nutrition.recentFoods')}
              </h2>
            </div>
            <p className="text-xs text-iron-gray mb-3">
              📝 Recently logged foods
            </p>
            <div className="space-y-2">
              {recentFoods.slice(0, 5).map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleSelectFood(food)}
                  className="w-full bg-iron-dark-gray border border-iron-gray/40 p-3 text-left hover:border-iron-gray hover:bg-iron-gray/5 transition-all rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-iron-white font-medium">{getFoodName(food)}</div>
                      {getBrandName(food) && (
                        <div className="text-xs text-iron-gray mt-0.5">{getBrandName(food)}</div>
                      )}
                      <div className="text-xs text-iron-gray mt-1.5">
                        {food.calories_per_100g} {t('nutrition.calPerHundredG')}
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-iron-gray flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={t('nutrition.searchFoods')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-iron-dark-gray border border-iron-gray px-4 py-3 text-iron-white placeholder:text-iron-gray focus:border-iron-orange focus:outline-none"
          />

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="mt-2 bg-iron-dark-gray border border-iron-gray overflow-hidden">
              {searching ? (
                <div className="p-4 text-center text-iron-gray">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-iron-gray/10">
                  {searchResults.map((food) => {
                    // Calculate typical serving nutrition for preview
                    const typicalServing = food.servings?.[0]
                    const typicalGrams = typicalServing?.grams_per_serving || 100
                    const factor = typicalGrams / 100
                    const typicalCalories = Math.round(food.calories_per_100g * factor)
                    const typicalProtein = Math.round(food.protein_g_per_100g * factor)

                    return (
                      <button
                        key={food.id}
                        onClick={() => handleSelectFood(food)}
                        className="w-full px-4 py-3 text-left hover:bg-iron-gray/10 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="text-iron-white font-medium">{getFoodName(food)}</div>
                            {getBrandName(food) && (
                              <div className="text-sm text-iron-gray">{getBrandName(food)}</div>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <div className="text-iron-gray">
                                Per 100g: {food.calories_per_100g} cal
                                {food.composition_type === 'composed' && ` • ${t('nutrition.composedMeal')}`}
                                {food.composition_type === 'branded' && ` • ${t('nutrition.branded')}`}
                              </div>
                            </div>
                            {/* Typical serving preview */}
                            <div className="mt-1.5 text-xs text-iron-orange/80">
                              Typical ({typicalGrams}g): {typicalCalories} cal • {typicalProtein}g protein
                            </div>
                          </div>
                          <div className="text-2xl flex-shrink-0">
                            {food.composition_type === 'composed' ? '🍽️' : food.composition_type === 'branded' ? '🏪' : '🥩'}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-iron-gray">
                  {t('nutrition.noFoodsFound')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Building Meal */}
        {mealItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg text-iron-white uppercase tracking-wider">
                Building {t(`nutrition.${mealType}`)} 🍽️
              </h2>
              {mealItems.length >= 2 && (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="text-xs text-iron-orange hover:text-iron-orange/80 transition-colors uppercase tracking-wider"
                >
                  {t('nutrition.saveAsQuickMeal')}
                </button>
              )}
            </div>

            <div className="bg-iron-dark-gray border border-iron-gray p-4 space-y-3 rounded-lg">
              {mealItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-iron-white font-medium">{getFoodName(item.food)}</div>

                    {/* Inline Editing */}
                    {editingItemIndex === index ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(Number(e.target.value))}
                          className="w-24 bg-iron-black border border-iron-orange px-2 py-1 text-iron-white text-sm"
                          min="0"
                          step={item.unit === 'grams' ? '1' : '0.1'}
                          autoFocus
                        />
                        <span className="text-sm text-iron-gray">
                          {item.unit === 'grams' ? 'g' : item.serving?.serving_unit || 'serving'}
                        </span>
                        <button
                          onClick={handleSaveEdit}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-iron-orange hover:text-iron-orange/80 transition-colors"
                          aria-label="Save changes"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-iron-gray">
                          {item.quantity} {item.unit === 'grams' ? 'g' : item.serving?.serving_unit || 'serving'}
                        </span>
                        <button
                          onClick={() => handleStartEdit(index)}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-iron-gray hover:text-iron-white transition-colors"
                          aria-label="Edit quantity"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    <div className="text-xs text-iron-gray mt-1">
                      {formatNutrition({
                        calories: item.calculated_calories,
                        protein_g: item.calculated_protein_g,
                        carbs_g: item.calculated_carbs_g,
                        fat_g: item.calculated_fat_g,
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => setMealItems(mealItems.filter((_, i) => i !== index))}
                    className="text-iron-gray hover:text-iron-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="pt-3 border-t border-iron-gray/30">
                <div className="text-iron-white font-heading uppercase tracking-wider text-sm mb-1">
                  {t('nutrition.total')}
                </div>
                <div className="text-iron-orange font-medium">
                  {formatNutrition(mealTotals)}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Sticky Action Button - Log Meal or Save Template */}
      {mealItems.length > 0 && (
        <FABFullWidth
          label={
            isTemplateMode
              ? `Save as Quick Meal (${mealItems.length} item${mealItems.length > 1 ? 's' : ''})`
              : logging
              ? t('nutrition.logging')
              : `${t('nutrition.logMeal')} (${Math.round(mealTotals.calories)} cal)`
          }
          icon={logging ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
          onClick={isTemplateMode ? () => setShowSaveModal(true) : handleLogMeal}
          disabled={logging}
          variant="primary"
        />
      )}

      {/* Food Selection Modal */}
      {selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-iron-dark-gray border border-iron-gray max-w-md w-full p-6 rounded-xl">
            {/* Food Info Header */}
            <div className="mb-4">
              <h3 className="font-heading text-xl text-iron-white uppercase tracking-wider">
                {getFoodName(selectedFood)}
              </h3>
              {getBrandName(selectedFood) && (
                <div className="text-sm text-iron-gray mt-1">{getBrandName(selectedFood)}</div>
              )}
            </div>

            {/* Live Nutrition Preview Card - ALWAYS VISIBLE */}
            <div className="mb-6 p-4 bg-iron-black/60 border border-iron-orange/30 rounded-lg">
              <div className="text-xs text-iron-gray uppercase tracking-wider mb-2">Live Preview</div>
              <div className="text-iron-white font-medium text-lg">
                {(() => {
                  try {
                    const nutrition = calculateFoodNutrition(
                      selectedFood,
                      modalQuantity,
                      modalUnit,
                      modalServing || undefined
                    )
                    return (
                      <div className="space-y-1">
                        <div className="text-2xl font-heading text-iron-orange">{Math.round(nutrition.calories)} cal</div>
                        <div className="text-sm text-iron-gray">
                          {Math.round(nutrition.protein_g)}g protein • {Math.round(nutrition.carbs_g)}g carbs • {Math.round(nutrition.fat_g)}g fat
                        </div>
                      </div>
                    )
                  } catch {
                    return <span className="text-red-500">{t('nutrition.invalidInput')}</span>
                  }
                })()}
              </div>
            </div>

            {/* Unit Selection */}
            <div className="mb-4">
              <label className="block text-sm text-iron-gray mb-2">How do you want to log this?</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setModalUnit('grams')
                    // RESET POINT #2a: Switching to grams mode
                    // UX IMPROVEMENT: Use last entered quantity instead of always 100
                    // See NUTRITION_LOGGING_ARCHITECTURE.md - State Management Rules
                    setModalQuantity(lastEnteredQuantity)
                  }}
                  className={`flex-1 py-3 px-4 font-medium transition-colors rounded-lg flex items-center gap-2 justify-center ${
                    modalUnit === 'grams'
                      ? 'bg-iron-orange text-iron-black'
                      : 'bg-iron-gray/10 text-iron-white hover:bg-iron-gray/20'
                  }`}
                >
                  <span>⚖️</span>
                  <span>{t('nutrition.grams')}</span>
                </button>
                {selectedFood.servings && selectedFood.servings.length > 0 && (
                  <button
                    onClick={() => {
                      setModalUnit('serving')
                      // RESET POINT #2b: Switching to serving mode
                      // CRITICAL: MUST reset to 1 (prevents "100 banana" bug)
                      // If we don't reset here, user would log 100 servings instead of 1
                      // See NUTRITION_LOGGING_ARCHITECTURE.md - Bug #1
                      setModalQuantity(1)
                    }}
                    className={`flex-1 py-3 px-4 font-medium transition-colors rounded-lg flex items-center gap-2 justify-center ${
                      modalUnit === 'serving'
                        ? 'bg-iron-orange text-iron-black'
                        : 'bg-iron-gray/10 text-iron-white hover:bg-iron-gray/20'
                    }`}
                  >
                    <span>🥄</span>
                    <span>{t('nutrition.serving')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quantity Input */}
            <div className="mb-4">
              <label className="block text-sm text-iron-white font-medium mb-2">
                {modalUnit === 'grams' ? '⚖️ How many grams?' : `🥄 How many ${modalServing?.serving_unit || 'servings'}?`}
              </label>
              <input
                type="number"
                value={modalQuantity}
                onChange={(e) => {
                  const newQuantity = Number(e.target.value)

                  // VALIDATION LAYER 1: Frontend warning for >20 servings
                  // HTML max attribute blocks input >20, but user could override via DevTools
                  if (modalUnit === 'serving' && newQuantity > 20) {
                    console.warn('Warning: Quantity > 20 servings may be incorrect')
                  }

                  setModalQuantity(newQuantity)
                }}
                className="w-full bg-iron-dark-gray border border-iron-gray px-4 py-3 text-iron-white focus:border-iron-orange focus:outline-none"
                min="0"
                max={modalUnit === 'serving' ? 20 : undefined}  // VALIDATION LAYER 2: HTML blocks >20
                step={modalUnit === 'grams' ? '1' : '0.1'}
              />
              {modalUnit === 'serving' && modalQuantity > 10 && (
                // VALIDATION LAYER 3: Visual warning for >10 servings
                // Helps catch typos (e.g., user meant 1.5, not 15)
                <div className="mt-2 text-xs text-red-400">
                  ⚠️ Are you sure? {modalQuantity} servings = {modalQuantity * (modalServing?.grams_per_serving || 0)}g
                </div>
              )}
              {modalUnit === 'serving' && modalQuantity <= 10 && (
                <div className="mt-2 text-xs text-iron-gray">
                  Choose serving size below and enter how many
                </div>
              )}
            </div>

            {/* Serving Selection */}
            {modalUnit === 'serving' && selectedFood.servings && selectedFood.servings.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm text-iron-white font-medium mb-2">Which serving size?</label>
                <select
                  value={modalServing?.id || ''}
                  onChange={(e) => {
                    const serving = selectedFood.servings?.find(s => s.id === e.target.value)
                    setModalServing(serving || null)

                    // RESET POINT #3: Serving selection from dropdown
                    // CRITICAL FIX: This line PREVENTS the "100 banana" bug!
                    //
                    // Bug scenario if this line is removed:
                    // 1. Modal opens: quantity = 100 (grams default)
                    // 2. User clicks "Serving" button: quantity = 1 ✓
                    // 3. User selects "medium banana" from dropdown: quantity NOT reset ✗
                    // 4. User submits: 100 servings × 118g = 11,800g = 10,502 cal 🔴
                    //
                    // With this line: quantity = 1 (correct) ✓
                    // See NUTRITION_LOGGING_ARCHITECTURE.md - Bug #1
                    setModalQuantity(1)
                  }}
                  className="w-full bg-iron-black border border-iron-gray px-4 py-3 text-iron-white focus:border-iron-orange focus:outline-none rounded-lg"
                >
                  {selectedFood.servings.map((serving) => (
                    <option key={serving.id} value={serving.id}>
                      {serving.serving_size} {serving.serving_unit}
                      {serving.serving_label && ` (${serving.serving_label})`}
                      {' '}= {serving.grams_per_serving}g
                    </option>
                  ))}
                </select>
                <p className="text-xs text-iron-gray mt-2">
                  💡 The nutrition preview above updates automatically
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFood(null)}
                className="flex-1 bg-iron-gray/10 text-iron-white py-3 font-medium hover:bg-iron-gray/20 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddToMeal}
                className="flex-1 bg-iron-orange text-iron-black py-3 font-medium hover:bg-iron-orange/90 transition-colors"
              >
                {t('nutrition.addToMeal')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save as Quick Meal Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-iron-dark-gray border border-iron-gray max-w-md w-full p-6">
            <h3 className="font-heading text-xl text-iron-white uppercase tracking-wider mb-4">
              {t('nutrition.saveQuickMealTitle')}
            </h3>

            <div className="mb-4">
              <label className="block text-sm text-iron-gray mb-2">{t('nutrition.quickMealName')} *</label>
              <input
                type="text"
                value={quickMealName}
                onChange={(e) => setQuickMealName(e.target.value)}
                placeholder={t('nutrition.quickMealNamePlaceholder')}
                className="w-full bg-iron-dark-gray border border-iron-gray px-4 py-3 text-iron-white placeholder:text-iron-gray focus:border-iron-orange focus:outline-none"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-iron-gray mb-2">{t('nutrition.quickMealDescription')}</label>
              <input
                type="text"
                value={quickMealDescription}
                onChange={(e) => setQuickMealDescription(e.target.value)}
                placeholder={t('nutrition.quickMealDescriptionPlaceholder')}
                className="w-full bg-iron-dark-gray border border-iron-gray px-4 py-3 text-iron-white placeholder:text-iron-gray focus:border-iron-orange focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setQuickMealName('')
                  setQuickMealDescription('')
                }}
                disabled={saving}
                className="flex-1 bg-iron-gray/10 text-iron-white py-3 font-medium hover:bg-iron-gray/20 transition-colors disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveAsQuickMeal}
                disabled={saving || !quickMealName.trim()}
                className="flex-1 bg-iron-orange text-iron-black py-3 font-medium hover:bg-iron-orange/90 transition-colors disabled:opacity-50"
              >
                {saving ? t('nutrition.saving') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
