/**
 * Food Types
 *
 * Type definitions for foods, servings, and search results
 */

export type CompositionType = 'simple' | 'composed' | 'branded'
export type FoodType = 'ingredient' | 'dish' | 'branded' | 'restaurant'

export interface FoodServing {
  id: string
  food_id: string
  serving_size: number
  serving_unit: string
  serving_label: string | null
  grams_per_serving: number
  is_default: boolean
  display_order: number
  created_at: string
}

export interface Food {
  id: string
  name: string
  brand_name: string | null

  // Portuguese translations
  name_pt: string | null
  brand_name_pt: string | null

  // Nutrition (per 100g - single source of truth)
  calories_per_100g: number
  protein_g_per_100g: number
  carbs_g_per_100g: number
  fat_g_per_100g: number
  fiber_g_per_100g: number | null
  sugar_g_per_100g: number | null
  sodium_mg_per_100g: number | null

  // Composition info
  composition_type: CompositionType
  food_type: FoodType | null

  // For composed foods
  recipe_items: Array<{ food_id: string; grams: number }> | null
  servings_count: number
  composed_total_grams: number | null

  // Metadata
  dietary_flags: string[] | null
  is_public: boolean
  verified: boolean
  usage_count: number
  created_by: string | null
  created_at: string
  updated_at: string

  // Relations
  servings: FoodServing[]
}

export interface FoodSearchResult {
  quick_meals: QuickMeal[]
  recent_foods: Food[]
  foods: Food[]
}

export interface QuickMealFood {
  id: string
  quick_meal_id: string
  food_id: string
  quantity: number
  serving_id: string | null
  display_order: number
  created_at: string
  food: Food
}

export interface QuickMeal {
  id: string
  user_id: string
  name: string
  description: string | null
  is_favorite: boolean
  usage_count: number
  last_used_at: string | null
  created_at: string
  updated_at: string
  foods: QuickMealFood[]
}

export interface MealItemInput {
  food_id: string
  quantity: number
  unit: 'grams' | 'serving'
  serving_id?: string
}

export interface MealItemPreview extends MealItemInput {
  food: Food
  serving?: FoodServing
  calculated_grams: number
  calculated_calories: number
  calculated_protein_g: number
  calculated_carbs_g: number
  calculated_fat_g: number
}
