/**
 * Tests for useNutritionSearch Hook
 *
 * Tests the food search hook with debouncing and progressive disclosure.
 * Ensures search works correctly, debouncing is applied, and UI state updates properly.
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useNutritionSearch, useSimpleFoodSearch } from '../useNutritionSearch'
import { searchFoods } from '@/lib/api/foods'
import type { Food } from '@/lib/types/food'

// Mock the API
jest.mock('@/lib/api/foods', () => ({
  searchFoods: jest.fn(),
}))

const mockSearchFoods = searchFoods as jest.MockedFunction<typeof searchFoods>

// Mock food data
const mockFoods: Food[] = [
  {
    id: '1',
    name: 'Chicken Breast',
    composition_type: 'simple',
    calories_per_100g: 165,
    protein_g_per_100g: 31,
    carbs_g_per_100g: 0,
    fat_g_per_100g: 3.6,
    servings: [],
  },
  {
    id: '2',
    name: 'Brown Rice',
    composition_type: 'simple',
    calories_per_100g: 370,
    protein_g_per_100g: 7.9,
    carbs_g_per_100g: 77,
    fat_g_per_100g: 2.9,
    servings: [],
  },
]

describe('useNutritionSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Basic Functionality', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
        })
      )

      expect(result.current.searchQuery).toBe('')
      expect(result.current.searchResults).toEqual([])
      expect(result.current.isSearching).toBe(false)
      expect(result.current.showQuickMeals).toBe(true)
      expect(result.current.showRecentFoods).toBe(true)
      expect(result.current.searchError).toBeNull()
    })

    it('should update search query', () => {
      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
        })
      )

      act(() => {
        result.current.setSearchQuery('chicken')
      })

      expect(result.current.searchQuery).toBe('chicken')
    })

    it('should clear search state', () => {
      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
        })
      )

      act(() => {
        result.current.setSearchQuery('chicken')
      })

      act(() => {
        result.current.clearSearch()
      })

      expect(result.current.searchQuery).toBe('')
      expect(result.current.searchResults).toEqual([])
      expect(result.current.showQuickMeals).toBe(true)
      expect(result.current.showRecentFoods).toBe(true)
    })
  })

  describe('Debounced Search', () => {
    it('should not search with query less than minimum length', async () => {
      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
        })
      )

      act(() => {
        result.current.setSearchQuery('c')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(mockSearchFoods).not.toHaveBeenCalled()
      expect(result.current.searchResults).toEqual([])
    })

    it('should search when query meets minimum length', async () => {
      mockSearchFoods.mockResolvedValueOnce({ foods: mockFoods, total: 2 })

      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
        })
      )

      act(() => {
        result.current.setSearchQuery('chicken')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(mockSearchFoods).toHaveBeenCalledWith('chicken', 20)
        expect(result.current.searchResults).toEqual(mockFoods)
      })
    })

    it('should debounce search calls', async () => {
      mockSearchFoods.mockResolvedValue({ foods: mockFoods, total: 2 })

      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
        })
      )

      // Rapid typing
      act(() => {
        result.current.setSearchQuery('c')
      })
      act(() => {
        jest.advanceTimersByTime(100)
      })

      act(() => {
        result.current.setSearchQuery('ch')
      })
      act(() => {
        jest.advanceTimersByTime(100)
      })

      act(() => {
        result.current.setSearchQuery('chi')
      })
      act(() => {
        jest.advanceTimersByTime(300)
      })

      // Should only call API once after debounce period
      await waitFor(() => {
        expect(mockSearchFoods).toHaveBeenCalledTimes(1)
        expect(mockSearchFoods).toHaveBeenCalledWith('chi', 20)
      })
    })

    it('should use custom debounce time', async () => {
      mockSearchFoods.mockResolvedValueOnce({ foods: mockFoods, total: 2 })

      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
          debounceMs: 500,
        })
      )

      act(() => {
        result.current.setSearchQuery('chicken')
      })

      // 300ms should not trigger search
      act(() => {
        jest.advanceTimersByTime(300)
      })
      expect(mockSearchFoods).not.toHaveBeenCalled()

      // 500ms should trigger search
      act(() => {
        jest.advanceTimersByTime(200)
      })

      await waitFor(() => {
        expect(mockSearchFoods).toHaveBeenCalledWith('chicken', 20)
      })
    })
  })

  describe('Progressive Disclosure', () => {
    it('should show quick meals and recent foods initially', () => {
      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
        })
      )

      expect(result.current.showQuickMeals).toBe(true)
      expect(result.current.showRecentFoods).toBe(true)
    })

    it('should hide quick meals when searching', () => {
      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
        })
      )

      act(() => {
        result.current.setSearchQuery('chicken')
      })

      expect(result.current.showQuickMeals).toBe(false)
      expect(result.current.showRecentFoods).toBe(false)
    })

    it('should show quick meals again when search cleared', () => {
      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
        })
      )

      act(() => {
        result.current.setSearchQuery('chicken')
      })

      act(() => {
        result.current.setSearchQuery('')
      })

      expect(result.current.showQuickMeals).toBe(true)
      expect(result.current.showRecentFoods).toBe(true)
    })

    it('should not show quick meals if none available', () => {
      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 0,
          recentFoodsCount: 10,
        })
      )

      expect(result.current.showQuickMeals).toBe(false)
      expect(result.current.showRecentFoods).toBe(true)
    })

    it('should not show recent foods if less than threshold', () => {
      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 2, // Less than 3
        })
      )

      expect(result.current.showQuickMeals).toBe(true)
      expect(result.current.showRecentFoods).toBe(false)
    })
  })

  describe('Loading State', () => {
    it('should set isSearching during API call', async () => {
      let resolveSearch: (value: any) => void
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve
      })
      mockSearchFoods.mockReturnValueOnce(searchPromise as any)

      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
        })
      )

      act(() => {
        result.current.setSearchQuery('chicken')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      // Should be searching
      await waitFor(() => {
        expect(result.current.isSearching).toBe(true)
      })

      // Resolve promise
      act(() => {
        resolveSearch!({ foods: mockFoods, total: 2 })
      })

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle search errors', async () => {
      const error = new Error('Search failed')
      mockSearchFoods.mockRejectedValueOnce(error)

      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
        })
      )

      act(() => {
        result.current.setSearchQuery('chicken')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(result.current.searchError).toBe(error)
        expect(result.current.isSearching).toBe(false)
      })
    })

    it('should call onSearchError callback', async () => {
      const error = new Error('Search failed')
      const onSearchError = jest.fn()
      mockSearchFoods.mockRejectedValueOnce(error)

      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
          onSearchError,
        })
      )

      act(() => {
        result.current.setSearchQuery('chicken')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(onSearchError).toHaveBeenCalledWith(error)
      })
    })
  })

  describe('Success Callback', () => {
    it('should call onSearchSuccess callback', async () => {
      const onSearchSuccess = jest.fn()
      mockSearchFoods.mockResolvedValueOnce({ foods: mockFoods, total: 2 })

      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
          onSearchSuccess,
        })
      )

      act(() => {
        result.current.setSearchQuery('chicken')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(onSearchSuccess).toHaveBeenCalledWith(mockFoods)
      })
    })
  })

  describe('Custom Options', () => {
    it('should use custom min query length', async () => {
      mockSearchFoods.mockResolvedValueOnce({ foods: mockFoods, total: 2 })

      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
          minQueryLength: 3,
        })
      )

      // Query with 2 chars should not trigger search
      act(() => {
        result.current.setSearchQuery('ch')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(mockSearchFoods).not.toHaveBeenCalled()

      // Query with 3 chars should trigger search
      act(() => {
        result.current.setSearchQuery('chi')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(mockSearchFoods).toHaveBeenCalledWith('chi', 20)
      })
    })

    it('should use custom max results', async () => {
      mockSearchFoods.mockResolvedValueOnce({ foods: mockFoods, total: 2 })

      const { result } = renderHook(() =>
        useNutritionSearch({
          quickMealsCount: 5,
          recentFoodsCount: 10,
          maxResults: 50,
        })
      )

      act(() => {
        result.current.setSearchQuery('chicken')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(mockSearchFoods).toHaveBeenCalledWith('chicken', 50)
      })
    })
  })
})

describe('useSimpleFoodSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should work without progressive disclosure', async () => {
    mockSearchFoods.mockResolvedValueOnce({ foods: mockFoods, total: 2 })

    const { result } = renderHook(() => useSimpleFoodSearch())

    act(() => {
      result.current.setQuery('chicken')
    })

    act(() => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(result.current.results).toEqual(mockFoods)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should clear query', () => {
    const { result } = renderHook(() => useSimpleFoodSearch())

    act(() => {
      result.current.setQuery('chicken')
    })

    act(() => {
      result.current.clearQuery()
    })

    expect(result.current.query).toBe('')
  })
})
