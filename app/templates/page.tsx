/**
 * Unified Templates Page
 *
 * Displays both Quick Meals (nutrition templates) and Activity Templates (workout templates)
 * with tab navigation for easy switching between types
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Dumbbell, Plus, ArrowLeft } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import QuickMealCard from '@/app/components/templates/QuickMealCard'
import TemplateCard from '@/app/components/templates/TemplateCard'
import Toast from '@/app/components/shared/Toast'
import { listQuickMeals, deleteQuickMeal, toggleQuickMealFavorite } from '@/lib/api/quick-meals'
import { getTemplates, deleteTemplate } from '@/lib/api/templates'
import type { QuickMeal } from '@/lib/types/food'
import type { ActivityTemplate } from '@/lib/types/templates'

type TabType = 'meals' | 'workouts'

export default function TemplatesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('meals')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Quick Meals state
  const [quickMeals, setQuickMeals] = useState<QuickMeal[]>([])

  // Activity Templates state
  const [activityTemplates, setActivityTemplates] = useState<ActivityTemplate[]>([])

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      const [meals, templates] = await Promise.all([
        listQuickMeals().catch(() => []),
        getTemplates({ limit: 100, is_active: true }).then(res => res.templates).catch(() => [])
      ])

      setQuickMeals(meals)
      setActivityTemplates(templates)
    } catch (err) {
      console.error('Failed to load templates:', err)
      setError('Failed to load templates. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Quick Meal handlers
  const handleEditQuickMeal = (id: string) => {
    // TODO: Implement edit modal or navigate to edit page
    setToast({ message: 'Edit functionality coming soon', type: 'success' })
  }

  const handleDeleteQuickMeal = async (id: string) => {
    const meal = quickMeals.find(m => m.id === id)
    if (!meal) return

    if (!confirm(`Delete "${meal.name}"? This will not delete meals that used this template.`)) {
      return
    }

    try {
      await deleteQuickMeal(id)
      await loadTemplates()
      setToast({ message: 'Quick meal deleted', type: 'success' })
    } catch (err) {
      console.error('Failed to delete quick meal:', err)
      setToast({ message: 'Failed to delete quick meal', type: 'error' })
    }
  }

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await toggleQuickMealFavorite(id, isFavorite)
      await loadTemplates()
      setToast({ message: isFavorite ? 'Added to favorites' : 'Removed from favorites', type: 'success' })
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      setToast({ message: 'Failed to update favorite status', type: 'error' })
    }
  }

  const handleUseQuickMeal = (id: string) => {
    router.push(`/nutrition/log?quick_meal=${id}`)
  }

  // Activity Template handlers
  const handleEditTemplate = (id: string) => {
    router.push(`/activities/templates/${id}/edit`)
  }

  const handleDeleteTemplate = async (id: string) => {
    const template = activityTemplates.find(t => t.id === id)
    if (!template) return

    if (!confirm(`Delete "${template.template_name}"? This will not delete activities that used this template.`)) {
      return
    }

    try {
      await deleteTemplate(id)
      await loadTemplates()
      setToast({ message: 'Template deleted', type: 'success' })
    } catch (err) {
      console.error('Failed to delete template:', err)
      setToast({ message: 'Failed to delete template', type: 'error' })
    }
  }

  const handleViewStats = (id: string) => {
    router.push(`/activities/templates/${id}/stats`)
  }

  const handleUseTemplate = (id: string) => {
    router.push(`/activities/log?template=${id}`)
  }

  if (loading) {
    return <LoadingScreen message="Loading templates..." />
  }

  const hasMeals = quickMeals.length > 0
  const hasWorkouts = activityTemplates.length > 0
  const hasAnyTemplates = hasMeals || hasWorkouts

  return (
    <div className="min-h-screen bg-iron-black pb-40">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-iron-black border-b border-iron-gray">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/profile')}
            className="text-iron-gray hover:text-iron-white transition mb-3 flex items-center gap-2"
            aria-label="Back to profile"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-iron-white uppercase tracking-wider">Templates</h1>
              <p className="text-sm text-iron-gray mt-1">
                Manage your quick meals and workout templates
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-iron-gray pb-2">
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-colors ${
              activeTab === 'meals'
                ? 'bg-iron-dark-gray text-iron-white border-b-2 border-iron-orange'
                : 'text-iron-gray hover:text-iron-white'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Quick Meals</span>
            {hasMeals && (
              <span className="ml-1 px-2 py-0.5 bg-iron-orange/20 text-iron-orange text-xs rounded-full">
                {quickMeals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-colors ${
              activeTab === 'workouts'
                ? 'bg-iron-dark-gray text-iron-white border-b-2 border-iron-orange'
                : 'text-iron-gray hover:text-iron-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Workouts</span>
            {hasWorkouts && (
              <span className="ml-1 px-2 py-0.5 bg-iron-orange/20 text-iron-orange text-xs rounded-full">
                {activityTemplates.length}
              </span>
            )}
          </button>
        </div>

        {/* Quick Meals Tab */}
        {activeTab === 'meals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading text-iron-white uppercase tracking-wider">
                Quick Meals
              </h2>
              <button
                onClick={() => router.push('/nutrition/log')}
                className="bg-iron-orange text-iron-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New</span>
              </button>
            </div>

            {hasMeals ? (
              <div className="grid gap-4 md:grid-cols-2">
                {quickMeals
                  .sort((a, b) => {
                    // Favorites first, then by name
                    if (a.is_favorite && !b.is_favorite) return -1
                    if (!a.is_favorite && b.is_favorite) return 1
                    return a.name.localeCompare(b.name)
                  })
                  .map((meal) => (
                    <QuickMealCard
                      key={meal.id}
                      quickMeal={meal}
                      onEdit={handleEditQuickMeal}
                      onDelete={handleDeleteQuickMeal}
                      onToggleFavorite={handleToggleFavorite}
                      onUse={handleUseQuickMeal}
                    />
                  ))}
              </div>
            ) : (
              <div className="bg-iron-dark-gray rounded-xl p-12 border border-iron-gray text-center">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-iron-white mb-2">
                  No quick meals yet
                </h3>
                <p className="text-iron-gray mb-6 max-w-md mx-auto">
                  Create quick meals to save time when logging your nutrition. Add 2 or more foods to a meal and save it as a quick meal.
                </p>
                <button
                  onClick={() => router.push('/nutrition/log')}
                  className="bg-iron-orange text-iron-black px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
                >
                  Log a Meal
                </button>
              </div>
            )}
          </div>
        )}

        {/* Workout Templates Tab */}
        {activeTab === 'workouts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading text-iron-white uppercase tracking-wider">
                Workout Templates
              </h2>
              <button
                onClick={() => router.push('/activities/templates/new')}
                className="bg-iron-orange text-iron-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New</span>
              </button>
            </div>

            {hasWorkouts ? (
              <div className="grid gap-4 md:grid-cols-2">
                {activityTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                    onViewStats={handleViewStats}
                    onUseTemplate={handleUseTemplate}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-iron-dark-gray rounded-xl p-12 border border-iron-gray text-center">
                <div className="text-4xl mb-4">🏋️</div>
                <h3 className="text-xl font-semibold text-iron-white mb-2">
                  No workout templates yet
                </h3>
                <p className="text-iron-gray mb-6 max-w-md mx-auto">
                  Create templates for your recurring workouts to auto-match activities and prefill log data.
                </p>
                <button
                  onClick={() => router.push('/activities/templates/new')}
                  className="bg-iron-orange text-iron-black px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
                >
                  Create Your First Template
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tips Section */}
        {hasAnyTemplates && (
          <div className="bg-iron-dark-gray/50 rounded-lg p-4 border border-iron-gray/50">
            <h3 className="text-sm font-semibold text-iron-white mb-2">💡 Tips</h3>
            <ul className="text-sm text-iron-gray space-y-1">
              <li>• Create templates for meals you eat regularly</li>
              <li>• Favorite your most-used templates for quick access</li>
              <li>• Templates can be created from existing meals or workouts</li>
            </ul>
          </div>
        )}
      </main>

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
