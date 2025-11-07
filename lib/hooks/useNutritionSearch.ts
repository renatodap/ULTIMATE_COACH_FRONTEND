/**
 * useNutritionSearch Hook
 *
 * Reusable hook for food search with debouncing and progressive disclosure.
 * Extracted from nutrition/log page to improve modularity.
 *
 * Features:
 * - Debounced search (300ms delay)
 * - Progressive disclosure (hide quick meals/recent foods when searching)
 * - Loading state management
 * - Error handling
 * - Minimum query length (2 characters)
 *
 * Benefits:
 * - Reduces nutrition/log page complexity (1018 LOC → ~600 LOC)
 * - Makes search logic testable in isolation
 * - Reusable for other food search scenarios
 * - Standardized debounce timing
 *
 * Usage:
 * ```typescript
 * const {
 *   searchQuery,
 *   setSearchQuery,
 *   searchResults,
 *   isSearching,
 *   showQuickMeals,
 *   showRecentFoods,
 * } = useNutritionSearch({
 *   quickMealsCount: quickMeals.length,
 *   recentFoodsCount: recentFoods.length,
 * })
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { searchFoods } from '@/lib/api/foods'
import { Food } from '@/lib/types/food'

// ============================================================================
// HOOK OPTIONS
// ============================================================================

export interface UseNutritionSearchOptions {
  /**
   * Number of quick meals available (for progressive disclosure)
   */
  quickMealsCount: number

  /**
   * Number of recent foods available (for progressive disclosure)
   */
  recentFoodsCount: number

  /**
   * Minimum query length to trigger search (default: 2)
   */
  minQueryLength?: number

  /**
   * Debounce delay in milliseconds (default: 300)
   */
  debounceMs?: number

  /**
   * Maximum search results to return (default: 20)
   */
  maxResults?: number

  /**
   * Optional: Called when search succeeds with results
   */
  onSearchSuccess?: (results: Food[]) => void

  /**
   * Optional: Called when search fails with error
   */
  onSearchError?: (error: Error) => void
}

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

export interface UseNutritionSearchReturn {
  /**
   * Current search query string
   */
  searchQuery: string

  /**
   * Update search query (triggers debounced search)
   */
  setSearchQuery: (query: string) => void

  /**
   * Search results (empty if no search or query < minQueryLength)
   */
  searchResults: Food[]

  /**
   * True when search API request is in flight
   */
  isSearching: boolean

  /**
   * True if quick meals should be shown (progressive disclosure)
   * Hidden when: searchQuery.length >= minQueryLength
   */
  showQuickMeals: boolean

  /**
   * True if recent foods should be shown (progressive disclosure)
   * Hidden when: searchQuery.length >= minQueryLength
   * Only shown when: recentFoodsCount >= 3
   */
  showRecentFoods: boolean

  /**
   * Clear search query and results
   */
  clearSearch: () => void

  /**
   * Last search error (null if no error)
   */
  searchError: Error | null
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Nutrition search hook with debouncing and progressive disclosure
 *
 * @param options - Hook configuration
 * @returns Hook methods and state
 */
export function useNutritionSearch(
  options: UseNutritionSearchOptions
): UseNutritionSearchReturn {
  const {
    quickMealsCount,
    recentFoodsCount,
    minQueryLength = 2,
    debounceMs = 300,
    maxResults = 20,
    onSearchSuccess,
    onSearchError,
  } = options

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Food[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<Error | null>(null)

  // Progressive disclosure state
  const [showQuickMeals, setShowQuickMeals] = useState(quickMealsCount > 0)
  const [showRecentFoods, setShowRecentFoods] = useState(recentFoodsCount >= 3)

  /**
   * Clear search state
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setSearchError(null)
    setShowQuickMeals(quickMealsCount > 0)
    setShowRecentFoods(recentFoodsCount >= 3)
  }, [quickMealsCount, recentFoodsCount])

  /**
   * Progressive disclosure: Hide quick meals & recent foods when searching
   */
  useEffect(() => {
    if (searchQuery.length >= minQueryLength) {
      setShowQuickMeals(false)
      setShowRecentFoods(false)
    } else {
      setShowQuickMeals(quickMealsCount > 0)
      setShowRecentFoods(recentFoodsCount >= 3)
    }
  }, [searchQuery, quickMealsCount, recentFoodsCount, minQueryLength])

  /**
   * Debounced search effect
   */
  useEffect(() => {
    // Clear results if query is too short
    if (searchQuery.length < minQueryLength) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    // Debounce search
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true)
        setSearchError(null)

        const results = await searchFoods(searchQuery, maxResults)
        const foods = results.foods || []

        setSearchResults(foods)

        // Optional success callback
        if (onSearchSuccess) {
          onSearchSuccess(foods)
        }
      } catch (error) {
        console.error('Search failed:', error)
        const err = error instanceof Error ? error : new Error('Search failed')
        setSearchError(err)

        // Optional error callback
        if (onSearchError) {
          onSearchError(err)
        }
      } finally {
        setIsSearching(false)
      }
    }, debounceMs)

    // Cleanup: Cancel pending search on query change
    return () => clearTimeout(timer)
  }, [searchQuery, minQueryLength, debounceMs, maxResults, onSearchSuccess, onSearchError])

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showQuickMeals,
    showRecentFoods,
    clearSearch,
    searchError,
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Simple food search hook without progressive disclosure
 *
 * Use this for simpler search scenarios that don't need quick meals/recent foods logic.
 *
 * Usage:
 * ```typescript
 * const { query, setQuery, results, isLoading } = useSimpleFoodSearch()
 * ```
 */
export function useSimpleFoodSearch(options?: {
  minQueryLength?: number
  debounceMs?: number
  maxResults?: number
}) {
  const {
    minQueryLength = 2,
    debounceMs = 300,
    maxResults = 20,
  } = options || {}

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (query.length < minQueryLength) {
      setResults([])
      setError(null)
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await searchFoods(query, maxResults)
        setResults(response.foods || [])
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Search failed')
        setError(error)
        console.error('Search failed:', error)
      } finally {
        setIsLoading(false)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, minQueryLength, debounceMs, maxResults])

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearQuery: () => setQuery(''),
  }
}
