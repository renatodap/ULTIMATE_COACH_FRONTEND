/**
 * METs Database - Frontend Subset
 *
 * Simplified version of backend METs database for real-time calorie estimation.
 * Formula: Calories = METs × Weight(kg) × Duration(hours)
 *
 * Based on Compendium of Physical Activities
 */

import type { ActivityCategory } from '@/lib/types/activities'

interface METSEntry {
  mets: number
  description: string
}

// Common activities METs database (subset of backend's 100+ activities)
const METS_DATABASE: Record<string, METSEntry> = {
  // Walking/Running
  'walking': { mets: 3.5, description: 'Walking, moderate pace' },
  'jogging': { mets: 7.0, description: 'Jogging, general' },
  'running': { mets: 9.8, description: 'Running, 6 mph (10 min/mile)' },

  // Cycling
  'cycling': { mets: 8.0, description: 'Cycling, moderate effort' },
  'biking': { mets: 8.0, description: 'Cycling, moderate effort' },

  // Swimming
  'swimming': { mets: 9.8, description: 'Swimming, freestyle, fast' },

  // Cardio Equipment
  'elliptical': { mets: 5.0, description: 'Elliptical, moderate' },
  'rowing': { mets: 7.0, description: 'Rowing, moderate effort' },
  'stairmaster': { mets: 9.0, description: 'StairMaster/StairClimber' },

  // HIIT/Interval
  'hiit': { mets: 12.0, description: 'HIIT, vigorous intensity' },
  'tabata': { mets: 12.5, description: 'Tabata training' },
  'circuit': { mets: 8.0, description: 'Circuit training' },
  'burpees': { mets: 8.0, description: 'Burpees' },

  // Strength Training
  'weight': { mets: 5.0, description: 'Weight lifting, moderate' },
  'weights': { mets: 5.0, description: 'Weight lifting, moderate' },
  'lifting': { mets: 5.0, description: 'Weight lifting, moderate' },
  'bodyweight': { mets: 5.5, description: 'Bodyweight exercises, moderate' },
  'calisthenics': { mets: 3.8, description: 'Calisthenics, light' },

  // Sports
  'basketball': { mets: 8.0, description: 'Basketball, game' },
  'soccer': { mets: 10.0, description: 'Soccer, competitive' },
  'tennis': { mets: 8.0, description: 'Tennis, singles' },
  'volleyball': { mets: 8.0, description: 'Volleyball, competitive' },
  'football': { mets: 9.0, description: 'Football, competitive' },

  // Flexibility
  'yoga': { mets: 3.0, description: 'Yoga, Vinyasa/Flow' },
  'pilates': { mets: 3.0, description: 'Pilates' },
  'stretching': { mets: 2.3, description: 'Stretching, light' },

  // Other
  'dancing': { mets: 4.5, description: 'Dancing, moderate' },
  'hiking': { mets: 6.0, description: 'Hiking, no load' },
}

// Category default METs (fallback if no match found)
const CATEGORY_DEFAULT_METS: Record<ActivityCategory, number> = {
  'cardio_steady_state': 7.0,   // Moderate running
  'cardio_interval': 10.0,      // HIIT
  'strength_training': 5.0,     // Moderate weight training
  'sports': 7.0,                // General sports
  'flexibility': 3.0,           // Yoga/stretching
  'other': 5.0,                 // General moderate activity
}

/**
 * Lookup METs value for an activity
 * Returns: { mets, description, method }
 */
export function lookupMETs(
  activityName: string,
  category: ActivityCategory
): { mets: number; description: string; method: 'exact' | 'partial' | 'category' } {
  const normalized = activityName.toLowerCase().trim()

  // Try exact match
  if (METS_DATABASE[normalized]) {
    return {
      mets: METS_DATABASE[normalized].mets,
      description: METS_DATABASE[normalized].description,
      method: 'exact'
    }
  }

  // Try partial match (e.g., "morning run" contains "run")
  for (const [key, entry] of Object.entries(METS_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return {
        mets: entry.mets,
        description: entry.description,
        method: 'partial'
      }
    }
  }

  // Fallback to category default
  return {
    mets: CATEGORY_DEFAULT_METS[category],
    description: `General ${category.replace(/_/g, ' ')}`,
    method: 'category'
  }
}

/**
 * Calculate estimated calories burned
 * Formula: Calories = METs × Weight(kg) × Duration(hours)
 */
export function estimateCalories(
  mets: number,
  weightKg: number,
  durationMinutes: number
): number {
  if (weightKg <= 0 || durationMinutes <= 0 || mets <= 0) {
    return 0
  }

  const durationHours = durationMinutes / 60
  const calories = mets * weightKg * durationHours

  return Math.round(calories)
}

/**
 * Get estimate for an activity
 * Returns null if insufficient data
 */
export function getActivityEstimate(
  activityName: string,
  category: ActivityCategory,
  durationMinutes: number | null,
  userWeightKg: number | null
): {
  calories: number
  mets: number
  description: string
  method: 'exact' | 'partial' | 'category'
} | null {
  if (!durationMinutes || !userWeightKg || durationMinutes <= 0 || userWeightKg <= 0) {
    return null
  }

  const { mets, description, method } = lookupMETs(activityName || '', category)
  const calories = estimateCalories(mets, userWeightKg, durationMinutes)

  return {
    calories,
    mets,
    description,
    method
  }
}
