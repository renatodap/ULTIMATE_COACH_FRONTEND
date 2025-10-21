'use client'

import { useState, useEffect } from 'react'
import { Search, X, Apple } from 'lucide-react'
import { TypicalFoodEntry } from '@/lib/api/onboarding'
import { apiClient } from '@/lib/api/client'

interface Food {
  id: string
  name: string
  brand_name?: string
  composition_type?: string
}

interface FoodSearchSelectorProps {
  selectedFoods: TypicalFoodEntry[]
  onChange: (foods: TypicalFoodEntry[]) => void
  mealTimeIds?: string[]  // Optional: to associate foods with meal times
}

export default function FoodSearchSelector({
  selectedFoods,
  onChange,
  mealTimeIds = []
}: FoodSearchSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Food[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await apiClient.get<{foods: Food[]}>(
          `/api/v1/foods/search?q=${encodeURIComponent(searchQuery)}&limit=20`
        )
        setSearchResults(results.foods || [])
      } catch (error) {
        console.error('Failed to search foods:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSelectFood = (food: Food) => {
    // Check if already selected
    const existing = selectedFoods.find(f => f.food_id === food.id)
    if (existing) return

    // Add with default values
    const newEntry: TypicalFoodEntry = {
      food_id: food.id,
      frequency: 'weekly'
    }

    onChange([...selectedFoods, newEntry])
    setSearchQuery('')
    setSearchResults([])
  }

  const handleRemoveFood = (foodId: string) => {
    onChange(selectedFoods.filter(f => f.food_id !== foodId))
  }

  const handleUpdateFrequency = (
    foodId: string,
    frequency: TypicalFoodEntry['frequency']
  ) => {
    onChange(
      selectedFoods.map(f =>
        f.food_id === foodId ? { ...f, frequency } : f
      )
    )
  }

  const handleUpdateMealTime = (foodId: string, mealTimeId: string | undefined) => {
    onChange(
      selectedFoods.map(f =>
        f.food_id === foodId ? { ...f, meal_time_id: mealTimeId } : f
      )
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-iron-gray">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search foods (chicken, rice, banana, etc.)..."
          className="w-full pl-10 pr-4 py-3 bg-iron-dark-gray border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-iron-orange border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-iron-dark-gray border border-iron-gray rounded-lg divide-y divide-iron-gray max-h-64 overflow-y-auto">
          {searchResults.map((food) => {
            const isSelected = selectedFoods.some(f => f.food_id === food.id)
            return (
              <button
                key={food.id}
                onClick={() => handleSelectFood(food)}
                disabled={isSelected}
                className="w-full px-4 py-3 text-left hover:bg-iron-gray/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Apple className="w-5 h-5 text-iron-gray flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-iron-white font-medium">{food.name}</div>
                    {food.brand_name && (
                      <div className="text-xs text-iron-gray mt-0.5">{food.brand_name}</div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="text-iron-orange text-sm">Added</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Selected Foods */}
      {selectedFoods.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-iron-white font-medium">
            Typical Foods ({selectedFoods.length})
          </h3>
          {selectedFoods.map((entry) => (
            <div
              key={entry.food_id}
              className="p-4 bg-iron-dark-gray border border-iron-gray rounded-lg space-y-3"
            >
              {/* Header with remove button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Apple className="w-4 h-4 text-iron-gray" />
                  <span className="text-iron-white font-medium">Food</span>
                </div>
                <button
                  onClick={() => handleRemoveFood(entry.food_id)}
                  className="text-iron-gray hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <label className="text-sm text-iron-gray">How often do you eat this?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['daily', 'several_times_week', 'weekly', 'occasionally'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => handleUpdateFrequency(entry.food_id, freq)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        entry.frequency === freq
                          ? 'bg-iron-orange text-iron-black'
                          : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                      }`}
                    >
                      {freq === 'several_times_week' ? '2-3x/week' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal Time Association (if meal times provided) */}
              {mealTimeIds.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm text-iron-gray">
                    Which meal? (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUpdateMealTime(entry.food_id, undefined)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !entry.meal_time_id
                          ? 'bg-iron-orange text-iron-black'
                          : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                      }`}
                    >
                      Any
                    </button>
                    {mealTimeIds.map(mealTimeId => (
                      <button
                        key={mealTimeId}
                        onClick={() => handleUpdateMealTime(entry.food_id, mealTimeId)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          entry.meal_time_id === mealTimeId
                            ? 'bg-iron-orange text-iron-black'
                            : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                        }`}
                      >
                        {mealTimeId}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional: Typical Quantity */}
              <details className="text-sm">
                <summary className="text-iron-gray cursor-pointer hover:text-iron-white transition-colors">
                  Add typical quantity (optional)
                </summary>
                <div className="mt-3">
                  <label className="block text-iron-gray mb-1">Typical Quantity (grams)</label>
                  <input
                    type="number"
                    value={entry.typical_quantity_grams || ''}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : undefined
                      onChange(
                        selectedFoods.map(f =>
                          f.food_id === entry.food_id
                            ? { ...f, typical_quantity_grams: value }
                            : f
                        )
                      )
                    }}
                    placeholder="e.g., 200"
                    className="w-full px-3 py-2 bg-iron-black border border-iron-gray rounded-lg text-iron-white placeholder-iron-gray focus:outline-none focus:ring-2 focus:ring-iron-orange"
                  />
                </div>
              </details>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {selectedFoods.length === 0 && searchQuery.length === 0 && (
        <div className="text-center py-8 text-iron-gray">
          <p>Search to add foods you typically eat</p>
          <p className="text-sm mt-1">This helps us create personalized meal plans</p>
        </div>
      )}
    </div>
  )
}
