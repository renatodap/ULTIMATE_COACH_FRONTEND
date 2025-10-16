/**
 * Unit tests for nutrition-calculator utility.
 *
 * Tests frontend nutrition calculations (mirrors backend).
 */

import { describe, it, expect } from 'vitest'
import {
  calculateSimpleFoodNutrition,
  calculateComposedFoodNutrition,
  calculateFoodNutrition,
} from '../nutrition-calculator'
import type { Food, FoodServing } from '@/lib/types/food'

describe('calculateSimpleFoodNutrition', () => {
  const chickenBreast: Food = {
    id: 'chicken-001',
    name: 'Chicken Breast',
    composition_type: 'simple',
    calories_per_100g: 165,
    protein_g_per_100g: 31,
    carbs_g_per_100g: 0,
    fat_g_per_100g: 3.6,
    is_public: true,
    verified: true,
    servings: [],
  }

  it('should calculate nutrition for 200g chicken breast', () => {
    const result = calculateSimpleFoodNutrition(chickenBreast, 200)

    expect(result.calories).toBe(330)
    expect(result.protein_g).toBe(62)
    expect(result.carbs_g).toBe(0)
    expect(result.fat_g).toBeCloseTo(7.2, 1)
  })

  it('should calculate nutrition for 100g (identity)', () => {
    const result = calculateSimpleFoodNutrition(chickenBreast, 100)

    expect(result.calories).toBe(165)
    expect(result.protein_g).toBe(31)
    expect(result.carbs_g).toBe(0)
    expect(result.fat_g).toBeCloseTo(3.6, 1)
  })

  it('should calculate nutrition for 50g (half)', () => {
    const result = calculateSimpleFoodNutrition(chickenBreast, 50)

    expect(result.calories).toBeCloseTo(82.5, 1)
    expect(result.protein_g).toBeCloseTo(15.5, 1)
    expect(result.carbs_g).toBe(0)
    expect(result.fat_g).toBeCloseTo(1.8, 1)
  })

  it('should handle fractional grams', () => {
    const result = calculateSimpleFoodNutrition(chickenBreast, 33.5)

    expect(result.calories).toBeCloseTo(55.3, 1)
    expect(result.protein_g).toBeCloseTo(10.4, 1)
  })

  it('should handle zero carbs correctly', () => {
    const result = calculateSimpleFoodNutrition(chickenBreast, 100)

    expect(result.carbs_g).toBe(0)
  })
})

describe('calculateComposedFoodNutrition', () => {
  const chickenBreast: Food = {
    id: 'chicken-001',
    name: 'Chicken Breast',
    composition_type: 'simple',
    calories_per_100g: 165,
    protein_g_per_100g: 31,
    carbs_g_per_100g: 0,
    fat_g_per_100g: 3.6,
    is_public: true,
    verified: true,
    servings: [],
  }

  const brownRice: Food = {
    id: 'rice-001',
    name: 'Brown Rice',
    composition_type: 'simple',
    calories_per_100g: 111,
    protein_g_per_100g: 2.6,
    carbs_g_per_100g: 23,
    fat_g_per_100g: 0.9,
    is_public: true,
    verified: true,
    servings: [],
  }

  const proteinShake: Food = {
    id: 'shake-001',
    name: 'Protein Shake',
    composition_type: 'composed',
    calories_per_100g: 0,
    protein_g_per_100g: 0,
    carbs_g_per_100g: 0,
    fat_g_per_100g: 0,
    recipe_items: [
      { food_id: 'chicken-001', grams: 100 },
      { food_id: 'rice-001', grams: 100 },
    ],
    servings_count: 1,
    composed_total_grams: 200,
    is_public: true,
    verified: false,
    servings: [],
  }

  const getFoodById = (id: string): Food => {
    const foods: Record<string, Food> = {
      'chicken-001': chickenBreast,
      'rice-001': brownRice,
    }
    return foods[id]
  }

  it('should calculate composed food for 1 serving', () => {
    const result = calculateComposedFoodNutrition(proteinShake, 1, getFoodById)

    // Chicken: 165 cal, 31g protein, 0g carbs, 3.6g fat
    // Rice: 111 cal, 2.6g protein, 23g carbs, 0.9g fat
    // Total: 276 cal, 33.6g protein, 23g carbs, 4.5g fat
    expect(result.calories).toBe(276)
    expect(result.protein_g).toBeCloseTo(33.6, 1)
    expect(result.carbs_g).toBe(23)
    expect(result.fat_g).toBeCloseTo(4.5, 1)
  })

  it('should calculate composed food for 2 servings', () => {
    const result = calculateComposedFoodNutrition(proteinShake, 2, getFoodById)

    expect(result.calories).toBe(552)
    expect(result.protein_g).toBeCloseTo(67.2, 1)
    expect(result.carbs_g).toBe(46)
    expect(result.fat_g).toBeCloseTo(9.0, 1)
  })

  it('should calculate composed food for 0.5 servings', () => {
    const result = calculateComposedFoodNutrition(proteinShake, 0.5, getFoodById)

    expect(result.calories).toBe(138)
    expect(result.protein_g).toBeCloseTo(16.8, 1)
    expect(result.carbs_g).toBeCloseTo(11.5, 1)
    expect(result.fat_g).toBeCloseTo(2.3, 1)
  })

  it('should handle composed food with multiple ingredients', () => {
    const complexMeal: Food = {
      ...proteinShake,
      recipe_items: [
        { food_id: 'chicken-001', grams: 150 },
        { food_id: 'rice-001', grams: 200 },
      ],
    }

    const result = calculateComposedFoodNutrition(complexMeal, 1, getFoodById)

    // Chicken 150g: 247.5 cal, 46.5g protein
    // Rice 200g: 222 cal, 5.2g protein, 46g carbs
    expect(result.calories).toBeCloseTo(469.5, 1)
    expect(result.protein_g).toBeCloseTo(51.7, 1)
    expect(result.carbs_g).toBe(46)
  })
})

describe('calculateFoodNutrition', () => {
  const chickenBreast: Food = {
    id: 'chicken-001',
    name: 'Chicken Breast',
    composition_type: 'simple',
    calories_per_100g: 165,
    protein_g_per_100g: 31,
    carbs_g_per_100g: 0,
    fat_g_per_100g: 3.6,
    is_public: true,
    verified: true,
    servings: [],
  }

  const scoop: FoodServing = {
    id: 'serving-001',
    food_id: 'chicken-001',
    serving_unit: 'scoop',
    serving_label: 'large',
    grams_per_serving: 30,
  }

  it('should calculate simple food by grams', () => {
    const result = calculateFoodNutrition(chickenBreast, 200, 'grams')

    expect(result.grams).toBe(200)
    expect(result.calories).toBe(330)
    expect(result.protein_g).toBe(62)
  })

  it('should calculate simple food by serving', () => {
    const result = calculateFoodNutrition(chickenBreast, 2, 'serving', scoop)

    // 2 scoops × 30g = 60g
    // 60g × (165/100) = 99 cal
    expect(result.grams).toBe(60)
    expect(result.calories).toBeCloseTo(99, 0)
  })

  it('should throw error for composed food by grams', () => {
    const composedFood: Food = {
      ...chickenBreast,
      composition_type: 'composed',
      recipe_items: [{ food_id: 'chicken-001', grams: 100 }],
    }

    expect(() => {
      calculateFoodNutrition(composedFood, 100, 'grams')
    }).toThrow('Composed foods cannot be logged by grams')
  })

  it('should throw error for serving without serving data', () => {
    expect(() => {
      calculateFoodNutrition(chickenBreast, 2, 'serving')
    }).toThrow('Serving required when unit is serving')
  })

  it('should throw error for invalid unit', () => {
    expect(() => {
      // @ts-expect-error - Testing invalid unit
      calculateFoodNutrition(chickenBreast, 100, 'liters')
    }).toThrow('Invalid unit')
  })

  it('should handle fractional servings', () => {
    const result = calculateFoodNutrition(chickenBreast, 1.5, 'serving', scoop)

    // 1.5 scoops × 30g = 45g
    expect(result.grams).toBe(45)
    expect(result.calories).toBeCloseTo(74, 0)
  })
})

describe('Edge cases', () => {
  const food: Food = {
    id: 'test-001',
    name: 'Test Food',
    composition_type: 'simple',
    calories_per_100g: 100,
    protein_g_per_100g: 10,
    carbs_g_per_100g: 20,
    fat_g_per_100g: 5,
    is_public: true,
    verified: true,
    servings: [],
  }

  it('should handle very small amounts', () => {
    const result = calculateSimpleFoodNutrition(food, 1)

    expect(result.calories).toBeCloseTo(1, 1)
    expect(result.protein_g).toBeCloseTo(0.1, 1)
  })

  it('should handle very large amounts', () => {
    const result = calculateSimpleFoodNutrition(food, 1000)

    expect(result.calories).toBe(1000)
    expect(result.protein_g).toBe(100)
    expect(result.carbs_g).toBe(200)
    expect(result.fat_g).toBe(50)
  })

  it('should maintain precision with decimal grams', () => {
    const result = calculateSimpleFoodNutrition(food, 33.33)

    expect(result.calories).toBeCloseTo(33.33, 1)
    expect(result.protein_g).toBeCloseTo(3.333, 1)
  })
})
