/**
 * Tests for useMealBuilder Hook
 *
 * Tests the meal building hook that manages meal items, inline editing, and totals calculation.
 * Ensures proper state management and nutrition calculations.
 */

import { renderHook, act } from '@testing-library/react'
import { useMealBuilder, transformMealItemsForAPI, meetsMinimumCalories, checkMacroBalance } from '../useMealBuilder'
import type { MealItemPreview } from '@/lib/types/food'

describe('useMealBuilder', () => {
  const mockMealItem: MealItemPreview = {
    food_id: '1',
    quantity: 100,
    unit: 'grams',
    serving_id: null,
    food: {
      id: '1',
      name: 'Chicken Breast',
      composition_type: 'simple',
      calories_per_100g: 165,
      protein_g_per_100g: 31,
      carbs_g_per_100g: 0,
      fat_g_per_100g: 3.6,
      servings: [],
    },
    calculated_grams: 100,
    calculated_calories: 165,
    calculated_protein_g: 31,
    calculated_carbs_g: 0,
    calculated_fat_g: 3.6,
  }

  const mockMealItem2: MealItemPreview = {
    food_id: '2',
    quantity: 200,
    unit: 'grams',
    serving_id: null,
    food: {
      id: '2',
      name: 'Brown Rice',
      composition_type: 'simple',
      calories_per_100g: 370,
      protein_g_per_100g: 7.9,
      carbs_g_per_100g: 77,
      fat_g_per_100g: 2.9,
      servings: [],
    },
    calculated_grams: 200,
    calculated_calories: 740,
    calculated_protein_g: 15.8,
    calculated_carbs_g: 154,
    calculated_fat_g: 5.8,
  }

  describe('Basic Functionality', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useMealBuilder())

      expect(result.current.mealItems).toEqual([])
      expect(result.current.hasItems).toBe(false)
      expect(result.current.isValid).toBe(false)
      expect(result.current.editingIndex).toBeNull()
      expect(result.current.editingQuantity).toBe(0)
      expect(result.current.totals).toEqual({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        itemCount: 0,
      })
    })

    it('should add item to meal', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
      })

      expect(result.current.mealItems).toHaveLength(1)
      expect(result.current.mealItems[0]).toEqual(mockMealItem)
      expect(result.current.hasItems).toBe(true)
      expect(result.current.isValid).toBe(true)
    })

    it('should remove item from meal', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
        result.current.addItem(mockMealItem2)
      })

      expect(result.current.mealItems).toHaveLength(2)

      act(() => {
        result.current.removeItem(0)
      })

      expect(result.current.mealItems).toHaveLength(1)
      expect(result.current.mealItems[0]).toEqual(mockMealItem2)
    })

    it('should clear all items', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
        result.current.addItem(mockMealItem2)
      })

      expect(result.current.mealItems).toHaveLength(2)

      act(() => {
        result.current.clearMeal()
      })

      expect(result.current.mealItems).toEqual([])
      expect(result.current.hasItems).toBe(false)
      expect(result.current.editingIndex).toBeNull()
    })
  })

  describe('Totals Calculation', () => {
    it('should calculate totals correctly', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
        result.current.addItem(mockMealItem2)
      })

      expect(result.current.totals).toEqual({
        calories: 905, // 165 + 740
        protein: 46.8, // 31 + 15.8
        carbs: 154, // 0 + 154
        fat: 9.4, // 3.6 + 5.8
        itemCount: 2,
      })
    })

    it('should update totals when item quantity changes', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
      })

      // Initial totals
      expect(result.current.totals.calories).toBe(165)

      // Update quantity to 200g (should double the calories)
      act(() => {
        result.current.updateItemQuantity(0, 200)
      })

      expect(result.current.totals.calories).toBe(330)
    })

    it('should update totals when item removed', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
        result.current.addItem(mockMealItem2)
      })

      expect(result.current.totals.calories).toBe(905)

      act(() => {
        result.current.removeItem(1)
      })

      expect(result.current.totals.calories).toBe(165)
    })
  })

  describe('Inline Editing', () => {
    it('should start editing', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
      })

      act(() => {
        result.current.startEditing(0)
      })

      expect(result.current.editingIndex).toBe(0)
      expect(result.current.editingQuantity).toBe(100)
    })

    it('should stop editing without changes', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
      })

      act(() => {
        result.current.startEditing(0)
      })

      act(() => {
        result.current.stopEditing()
      })

      expect(result.current.editingIndex).toBeNull()
      expect(result.current.editingQuantity).toBe(0)
    })

    it('should save edits when stopping', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
      })

      act(() => {
        result.current.startEditing(0)
      })

      act(() => {
        result.current.setEditingQuantity(200)
      })

      act(() => {
        result.current.stopEditing()
      })

      expect(result.current.mealItems[0].quantity).toBe(200)
      expect(result.current.editingIndex).toBeNull()
    })

    it('should not save edits if quantity is 0', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
      })

      act(() => {
        result.current.startEditing(0)
      })

      act(() => {
        result.current.setEditingQuantity(0)
      })

      act(() => {
        result.current.stopEditing()
      })

      // Should not update when quantity is 0
      expect(result.current.mealItems[0].quantity).toBe(100)
    })
  })

  describe('Update Item Quantity', () => {
    it('should update item quantity and recalculate nutrition', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
      })

      act(() => {
        result.current.updateItemQuantity(0, 200)
      })

      const updatedItem = result.current.mealItems[0]
      expect(updatedItem.quantity).toBe(200)
      expect(updatedItem.calculated_calories).toBe(330) // 165 * 2
      expect(updatedItem.calculated_protein_g).toBe(62) // 31 * 2
    })

    it('should handle multiple quantity updates', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
      })

      // First update
      act(() => {
        result.current.updateItemQuantity(0, 200)
      })
      expect(result.current.mealItems[0].calculated_calories).toBe(330)

      // Second update
      act(() => {
        result.current.updateItemQuantity(0, 50)
      })
      expect(result.current.mealItems[0].calculated_calories).toBeCloseTo(82.5, 1)
    })
  })

  describe('Validation', () => {
    it('should be invalid when empty', () => {
      const { result } = renderHook(() => useMealBuilder())

      expect(result.current.isValid).toBe(false)
      expect(result.current.hasItems).toBe(false)
    })

    it('should be valid with 1+ items', () => {
      const { result } = renderHook(() => useMealBuilder())

      act(() => {
        result.current.addItem(mockMealItem)
      })

      expect(result.current.isValid).toBe(true)
      expect(result.current.hasItems).toBe(true)
    })
  })
})

describe('transformMealItemsForAPI', () => {
  const mockItems: MealItemPreview[] = [
    {
      food_id: '1',
      quantity: 100,
      unit: 'grams',
      serving_id: null,
      food: {} as any,
      calculated_grams: 100,
      calculated_calories: 165.5,
      calculated_protein_g: 31.25,
      calculated_carbs_g: 0.33,
      calculated_fat_g: 3.67,
    },
    {
      food_id: '2',
      quantity: 2,
      unit: 'serving',
      serving_id: 'serving-id-123',
      serving: {
        id: 'serving-id-123',
        food_id: '2',
        serving_unit: 'scoop',
        serving_label: 'large',
        grams_per_serving: 30,
      },
      food: {} as any,
      calculated_grams: 60,
      calculated_calories: 120.8,
      calculated_protein_g: 24.44,
      calculated_carbs_g: 2.22,
      calculated_fat_g: 1.11,
    },
  ]

  it('should transform items to API format', () => {
    const apiItems = transformMealItemsForAPI(mockItems)

    expect(apiItems).toHaveLength(2)
    expect(apiItems[0]).toEqual({
      food_id: '1',
      quantity: 100,
      serving_id: null,
      grams: 100,
      calories: 166, // Rounded
      protein_g: 31.3, // Rounded to 1 decimal
      carbs_g: 0.3,
      fat_g: 3.7,
      display_unit: 'g',
      display_label: null,
    })
    expect(apiItems[1]).toEqual({
      food_id: '2',
      quantity: 2,
      serving_id: 'serving-id-123',
      grams: 60,
      calories: 121, // Rounded
      protein_g: 24.4, // Rounded to 1 decimal
      carbs_g: 2.2,
      fat_g: 1.1,
      display_unit: 'scoop',
      display_label: 'large',
    })
  })

  it('should handle empty array', () => {
    const apiItems = transformMealItemsForAPI([])

    expect(apiItems).toEqual([])
  })
})

describe('meetsMinimumCalories', () => {
  it('should return true when above minimum', () => {
    const totals = { calories: 100, protein: 0, carbs: 0, fat: 0, itemCount: 1 }
    expect(meetsMinimumCalories(totals)).toBe(true)
  })

  it('should return false when below minimum', () => {
    const totals = { calories: 30, protein: 0, carbs: 0, fat: 0, itemCount: 1 }
    expect(meetsMinimumCalories(totals)).toBe(false)
  })

  it('should use custom minimum', () => {
    const totals = { calories: 60, protein: 0, carbs: 0, fat: 0, itemCount: 1 }
    expect(meetsMinimumCalories(totals, 100)).toBe(false)
    expect(meetsMinimumCalories(totals, 50)).toBe(true)
  })
})

describe('checkMacroBalance', () => {
  it('should return null for balanced meal', () => {
    const totals = {
      calories: 500,
      protein: 30,
      carbs: 50,
      fat: 20,
      itemCount: 1,
    }

    expect(checkMacroBalance(totals)).toBeNull()
  })

  it('should warn about very low protein', () => {
    const totals = {
      calories: 500,
      protein: 5, // Only 5g protein
      carbs: 80,
      fat: 15,
      itemCount: 1,
    }

    const warning = checkMacroBalance(totals)
    expect(warning).toContain('low in protein')
  })

  it('should warn about very high fat', () => {
    const totals = {
      calories: 500,
      protein: 10,
      carbs: 10,
      fat: 80, // 80% of macros from fat
      itemCount: 1,
    }

    const warning = checkMacroBalance(totals)
    expect(warning).toContain('high in fat')
  })

  it('should warn about very high carbs', () => {
    const totals = {
      calories: 500,
      protein: 10,
      carbs: 85, // 85% of macros from carbs
      fat: 5,
      itemCount: 1,
    }

    const warning = checkMacroBalance(totals)
    expect(warning).toContain('high in carbs')
  })

  it('should not warn for low protein on small meals', () => {
    const totals = {
      calories: 200, // Small meal
      protein: 5,
      carbs: 30,
      fat: 10,
      itemCount: 1,
    }

    expect(checkMacroBalance(totals)).toBeNull()
  })

  it('should return null for zero macros', () => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      itemCount: 0,
    }

    expect(checkMacroBalance(totals)).toBeNull()
  })
})
