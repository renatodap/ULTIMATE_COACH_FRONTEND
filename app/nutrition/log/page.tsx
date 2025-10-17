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
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Loader2, Edit2, Check, Star, Clock } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { FABFullWidth } from '@/components/shared/FAB'
import Toast from '@/app/components/shared/Toast'
import { useOnboardingCheck } from '@/lib/hooks/useOnboardingCheck'
import { useUserLanguage } from '@/lib/hooks/useUserLanguage'
import { useTranslation } from '@/lib/i18n'
import { useTimezone } from '@/lib/context/TimezoneContext'
import { toUTC } from '@/lib/utils/timezone'
import { searchFoods, getRecentFoods } from '@/lib/api/foods'
import { listQuickMeals, createQuickMeal, logQuickMeal } from '@/lib/api/quick-meals'
import { createMeal } from '@/lib/api/nutrition'
import { calculateFoodNutrition, formatNutrition } from '@/lib/utils/nutrition-calculator'
import type { Food, FoodServing, MealItemPreview, QuickMeal } from '@/lib/types/food'
import type { CreateMealRequest, CreateMealItemRequest } from '@/lib/api/nutrition'

export default function LogMealPage() {
  const router = useRouter()
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
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'>('other')
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(0)

  // Modal states
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [modalQuantity, setModalQuantity] = useState<number>(100)
  const [modalUnit, setModalUnit] = useState<'grams' | 'serving'>('grams')
  const [modalServing, setModalServing] = useState<FoodServing | null>(null)

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
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchInitialData()
  }, [authLoading, onboardingComplete])

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
  const handleSelectFood = (food: Food) => {
    console.log('[LOG] Food selected:', {
      name: food.name,
      id: food.id,
      servings_count: food.servings?.length || 0,
      servings: food.servings
    })
    setSelectedFood(food)

    // CRITICAL: Reset all modal state to defaults
    // modalQuantity = 100 because default mode is grams
    // This is RESET POINT #1 (see NUTRITION_LOGGING_ARCHITECTURE.md)
    setModalQuantity(100)
    setModalUnit('grams')
    setModalServing(food.servings?.find(s => s.is_default) || food.servings?.[0] || null)
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

      // Refresh quick meals list
      const meals = await listQuickMeals()
      setQuickMeals(meals)

      // Reset modal
      setShowSaveModal(false)
      setQuickMealName('')
      setQuickMealDescription('')

      setToast({ message: t('nutrition.quickMealSaved'), type: 'success' })
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
            onClick={() => router.push('/nutrition')}
            className="text-iron-gray hover:text-iron-white transition-colors"
            aria-label={t('nutrition.backToNutrition')}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="font-heading text-2xl text-iron-white uppercase tracking-wider">
              {t('nutrition.logMeal')}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Quick Meals Section */}
        {!initialLoading && quickMeals.length > 0 && (
          <div className="mb-6">
            <h2 className="font-heading text-base font-medium text-iron-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-iron-orange" />
              {t('nutrition.quickMeals')}
            </h2>
            <div className="space-y-2">
              {quickMeals.slice(0, 5).map((quickMeal) => (
                <button
                  key={quickMeal.id}
                  onClick={() => handleLogQuickMeal(quickMeal.id)}
                  disabled={logging}
                  className="w-full bg-iron-dark-gray border border-iron-gray p-3 text-left hover:border-iron-orange/50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-iron-white font-medium flex items-center gap-2">
                        {quickMeal.name}
                        {quickMeal.is_favorite && <Star className="w-3 h-3 text-iron-orange fill-iron-orange" />}
                      </div>
                      {quickMeal.description && (
                        <div className="text-xs text-iron-gray mt-1">{quickMeal.description}</div>
                      )}
                      <div className="text-xs text-iron-gray mt-1">
                        {quickMeal.foods.length} {quickMeal.foods.length !== 1 ? t('nutrition.items') : t('nutrition.item')}
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-iron-orange flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Foods Section */}
        {!initialLoading && recentFoods.length > 0 && !searchQuery && (
          <div className="mb-6">
            <h2 className="font-heading text-base font-medium text-iron-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-iron-orange" />
              {t('nutrition.recentFoods')}
            </h2>
            <div className="space-y-2">
              {recentFoods.slice(0, 5).map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleSelectFood(food)}
                  className="w-full bg-iron-dark-gray border border-iron-gray p-3 text-left hover:border-iron-orange/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-iron-white font-medium">{getFoodName(food)}</div>
                      {getBrandName(food) && (
                        <div className="text-xs text-iron-gray">{getBrandName(food)}</div>
                      )}
                      <div className="text-xs text-iron-gray mt-1">
                        {food.calories_per_100g} {t('nutrition.calPerHundredG')}
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-iron-orange flex-shrink-0" />
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
                  {searchResults.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className="w-full px-4 py-3 text-left hover:bg-iron-gray/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-iron-white font-medium">{getFoodName(food)}</div>
                          {getBrandName(food) && (
                            <div className="text-sm text-iron-gray">{getBrandName(food)}</div>
                          )}
                          <div className="text-xs text-iron-gray mt-1">
                            {food.calories_per_100g} {t('nutrition.calPerHundredG')}
                            {food.composition_type === 'composed' && ` • ${t('nutrition.composedMeal')}`}
                            {food.composition_type === 'branded' && ` • ${t('nutrition.branded')}`}
                          </div>
                        </div>
                        <div className="text-iron-orange text-sm">
                          {food.composition_type === 'composed' ? '🍽️' : food.composition_type === 'branded' ? '🏪' : '🥩'}
                        </div>
                      </div>
                    </button>
                  ))}
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
                {t('nutrition.buildingMeal')}
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

            {/* Meal Type Selector */}
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto">
                {(['breakfast', 'lunch', 'dinner', 'snack', 'other'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                      mealType === type
                        ? 'bg-iron-orange text-iron-black'
                        : 'bg-iron-gray/10 text-iron-white hover:bg-iron-gray/20'
                    }`}
                  >
                    {t(`nutrition.${type}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-iron-dark-gray border border-iron-gray p-4 space-y-3">
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

      {/* Sticky Log Button - Always visible above nav */}
      {mealItems.length > 0 && (
        <FABFullWidth
          label={logging ? t('nutrition.logging') : `${t('nutrition.logMeal')} (${Math.round(mealTotals.calories)} cal)`}
          icon={logging ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
          onClick={handleLogMeal}
          disabled={logging}
          variant="primary"
        />
      )}

      {/* Food Selection Modal */}
      {selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-iron-dark-gray border border-iron-gray max-w-md w-full p-6">
            <h3 className="font-heading text-xl text-iron-white uppercase tracking-wider mb-4">
              {getFoodName(selectedFood)}
            </h3>

            {getBrandName(selectedFood) && (
              <div className="text-sm text-iron-gray mb-4">{getBrandName(selectedFood)}</div>
            )}

            {/* Unit Selection */}
            <div className="mb-4">
              <label className="block text-sm text-iron-gray mb-2">{t('nutrition.unit')}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setModalUnit('grams')
                    // RESET POINT #2a: Switching to grams mode
                    // modalQuantity = 100 (standard default for grams)
                    // See NUTRITION_LOGGING_ARCHITECTURE.md - State Management Rules
                    setModalQuantity(100)
                  }}
                  className={`flex-1 py-2 px-4 font-medium transition-colors ${
                    modalUnit === 'grams'
                      ? 'bg-iron-orange text-iron-black'
                      : 'bg-iron-gray/10 text-iron-white hover:bg-iron-gray/20'
                  }`}
                >
                  {t('nutrition.grams')}
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
                    className={`flex-1 py-2 px-4 font-medium transition-colors ${
                      modalUnit === 'serving'
                        ? 'bg-iron-orange text-iron-black'
                        : 'bg-iron-gray/10 text-iron-white hover:bg-iron-gray/20'
                    }`}
                  >
                    {t('nutrition.serving')}
                  </button>
                )}
              </div>
            </div>

            {/* Quantity Input */}
            {/* TODO i18n: Add translations for amountGrams, numberOfServings, servingHelperText */}
            <div className="mb-4">
              <label className="block text-sm text-iron-gray mb-2">
                {modalUnit === 'grams' ? 'Amount (grams)' : 'How many servings?'}
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
                <label className="block text-sm text-iron-gray mb-2">{t('nutrition.servingSize')}</label>
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
                  className="w-full bg-iron-dark-gray border border-iron-gray px-4 py-3 text-iron-white focus:border-iron-orange focus:outline-none"
                >
                  {selectedFood.servings.map((serving) => (
                    <option key={serving.id} value={serving.id}>
                      {serving.serving_size} {serving.serving_unit}
                      {serving.serving_label && ` (${serving.serving_label})`}
                      {' '}= {serving.grams_per_serving}g
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Preview */}
            <div className="mb-6 p-4 bg-iron-gray/10">
              <div className="text-sm text-iron-gray mb-1">{t('nutrition.nutrition')}</div>
              <div className="text-iron-white font-medium">
                {(() => {
                  try {
                    // FRONTEND PREVIEW CALCULATION (NOT TRUSTED BY BACKEND)
                    // This calculation is for UX only - shows live preview as user adjusts quantity
                    // Backend will RECALCULATE everything from scratch at meal creation time
                    // See NUTRITION_LOGGING_ARCHITECTURE.md - Frontend/Backend Contract
                    const nutrition = calculateFoodNutrition(
                      selectedFood,
                      modalQuantity,
                      modalUnit,
                      modalServing || undefined
                    )
                    return formatNutrition(nutrition)
                  } catch {
                    return t('nutrition.invalidInput')
                  }
                })()}
              </div>
            </div>

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
