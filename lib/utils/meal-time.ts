/**
 * Meal Time Intelligence Utilities
 *
 * Auto-detects appropriate meal type based on time of day
 * Helps users by pre-selecting the most likely meal they're logging
 */

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'

/**
 * Get default meal type based on current time
 *
 * Time ranges:
 * - 6am-10am: breakfast 🌅
 * - 10am-2pm: lunch 🍽️
 * - 2pm-5pm: snack 🍪
 * - 5pm-9pm: dinner 🌙
 * - 9pm-6am: snack 🍪
 */
export function getDefaultMealType(date: Date = new Date()): MealType {
  const hour = date.getHours()

  if (hour >= 6 && hour < 10) {
    return 'breakfast'
  } else if (hour >= 10 && hour < 14) {
    return 'lunch'
  } else if (hour >= 14 && hour < 17) {
    return 'snack'
  } else if (hour >= 17 && hour < 21) {
    return 'dinner'
  } else {
    // 9pm-6am
    return 'snack'
  }
}

/**
 * Get suggested label for meal type based on time
 * Shows "Suggested for now" badge
 */
export function getMealTypeSuggestionLabel(mealType: MealType): string {
  const defaultType = getDefaultMealType()
  return mealType === defaultType ? 'Suggested for now' : ''
}
