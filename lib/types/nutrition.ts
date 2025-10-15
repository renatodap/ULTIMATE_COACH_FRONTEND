/**
 * Nutrition Data Types
 *
 * TypeScript interfaces for nutrition tracking features.
 * Aligned with database schema (meals, meal_items, foods, food_servings).
 */

export interface DailyNutrition {
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  calorieGoal: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
  meals: Meal[]
}

export interface Meal {
  id: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
  name?: string
  loggedAt: string
  notes?: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  source: 'manual' | 'ai_text' | 'ai_voice' | 'ai_photo' | 'coach_chat'
  aiConfidence?: number
  foodItems: FoodItem[]
}

export interface FoodItem {
  id: string
  mealId: string
  foodId: string
  foodName: string
  brandName?: string

  // User's logged quantity
  quantity: number
  servingId: string
  displayUnit: string
  displayLabel?: string

  // Calculated values (stored at log time)
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number

  // Available servings for this food
  availableServings: FoodServing[]

  // Ordering
  displayOrder: number
}

export interface FoodServing {
  id: string
  foodId: string
  unit: string // "cup", "scoop", "oz", "serving"
  grams: number
  label?: string // "medium", "heaping", "small"
  isDefault: boolean
}

export interface Food {
  id: string
  name: string
  brandName?: string

  // Nutrition per 100g (CANONICAL BASE)
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number

  // Optional micros
  fiberPer100g?: number
  sugarPer100g?: number
  sodiumPer100g?: number

  // Metadata
  foodType: 'ingredient' | 'dish' | 'branded' | 'restaurant'
  dietaryFlags?: string[]
  isPublic: boolean
  verified: boolean
}

// Component Props Types
export interface DailySummaryProps {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  calorieGoal: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
}

export interface MealTypeCardProps {
  meal: Meal
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

export interface FoodItemCardProps {
  item: FoodItem
  onEdit: (item: FoodItem) => void
  onDelete: (itemId: string) => void
  isEditing: boolean
}

export interface MacroProgressCircleProps {
  label: string
  current: number
  target: number
  color: 'success' | 'info' | 'warning'
}

// API Request/Response Types
export interface UpdateFoodItemRequest {
  quantity?: number
  servingId?: string
}

export interface UpdateMealRequest {
  name?: string
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
  notes?: string
}
