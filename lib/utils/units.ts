/**
 * Unit Conversion Utilities
 *
 * Handles metric/imperial conversions for:
 * - Weight (kg ↔ lbs)
 * - Height (cm ↔ ft/in)
 * - Distance (km ↔ miles)
 * - Energy (kcal ↔ kJ) - optional for metric users
 *
 * IMPORTANT:
 * - Backend ALWAYS stores in metric (kg, cm, km)
 * - Frontend converts for display based on user preference
 * - All conversions are reversible with minimal precision loss
 */

export type UnitSystem = 'metric' | 'imperial'

// ============================================================================
// CONVERSION CONSTANTS
// ============================================================================

const KG_TO_LBS = 2.20462
const LBS_TO_KG = 1 / KG_TO_LBS

const CM_TO_INCHES = 0.393701
const INCHES_TO_CM = 1 / CM_TO_INCHES

const KM_TO_MILES = 0.621371
const MILES_TO_KM = 1 / KM_TO_MILES

const KCAL_TO_KJ = 4.184
const KJ_TO_KCAL = 1 / KCAL_TO_KJ

// ============================================================================
// WEIGHT CONVERSIONS
// ============================================================================

export interface WeightDisplay {
  value: number
  unit: string
  formatted: string
}

/**
 * Convert weight from kg to user's preferred system
 */
export function displayWeight(kg: number, system: UnitSystem, decimals: number = 1): WeightDisplay {
  if (system === 'imperial') {
    const lbs = Math.round(kg * KG_TO_LBS * Math.pow(10, decimals)) / Math.pow(10, decimals)
    return {
      value: lbs,
      unit: 'lbs',
      formatted: `${lbs} lbs`
    }
  }

  const rounded = Math.round(kg * Math.pow(10, decimals)) / Math.pow(10, decimals)
  return {
    value: rounded,
    unit: 'kg',
    formatted: `${rounded} kg`
  }
}

/**
 * Convert weight from user's system to kg (for backend)
 */
export function weightToKg(value: number, system: UnitSystem): number {
  if (system === 'imperial') {
    return value * LBS_TO_KG
  }
  return value
}

/**
 * Convert weight from kg to user's system (for input fields)
 */
export function weightFromKg(kg: number, system: UnitSystem): number {
  if (system === 'imperial') {
    return Math.round(kg * KG_TO_LBS * 10) / 10
  }
  return Math.round(kg * 10) / 10
}

// ============================================================================
// HEIGHT CONVERSIONS
// ============================================================================

export interface HeightFeetInches {
  feet: number
  inches: number
}

export interface HeightDisplay {
  value: number | HeightFeetInches
  unit: string
  formatted: string
}

/**
 * Convert height from cm to user's preferred system
 */
export function displayHeight(cm: number, system: UnitSystem): HeightDisplay {
  if (system === 'imperial') {
    const totalInches = cm * CM_TO_INCHES
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)

    return {
      value: { feet, inches },
      unit: 'ft/in',
      formatted: `${feet}'${inches}"`
    }
  }

  const rounded = Math.round(cm)
  return {
    value: rounded,
    unit: 'cm',
    formatted: `${rounded} cm`
  }
}

/**
 * Convert height from user's system to cm (for backend)
 */
export function heightToCm(value: number | HeightFeetInches, system: UnitSystem): number {
  if (system === 'imperial' && typeof value === 'object') {
    const totalInches = (value.feet * 12) + value.inches
    return Math.round(totalInches * INCHES_TO_CM * 10) / 10
  }

  return typeof value === 'number' ? value : 0
}

/**
 * Convert height from cm to user's system (for input fields)
 */
export function heightFromCm(cm: number, system: UnitSystem): number | HeightFeetInches {
  if (system === 'imperial') {
    const totalInches = cm * CM_TO_INCHES
    return {
      feet: Math.floor(totalInches / 12),
      inches: Math.round(totalInches % 12)
    }
  }
  return Math.round(cm)
}

// ============================================================================
// DISTANCE CONVERSIONS
// ============================================================================

export interface DistanceDisplay {
  value: number
  unit: string
  formatted: string
}

/**
 * Convert distance from meters to user's preferred system
 */
export function displayDistance(meters: number, system: UnitSystem, decimals: number = 2): DistanceDisplay {
  if (system === 'imperial') {
    const miles = (meters / 1000) * KM_TO_MILES
    const rounded = Math.round(miles * Math.pow(10, decimals)) / Math.pow(10, decimals)
    return {
      value: rounded,
      unit: 'miles',
      formatted: `${rounded} mi`
    }
  }

  const km = meters / 1000
  const rounded = Math.round(km * Math.pow(10, decimals)) / Math.pow(10, decimals)
  return {
    value: rounded,
    unit: 'km',
    formatted: `${rounded} km`
  }
}

/**
 * Convert distance from user's system to meters (for backend)
 */
export function distanceToMeters(value: number, system: UnitSystem): number {
  if (system === 'imperial') {
    return value * MILES_TO_KM * 1000
  }
  return value * 1000
}

// ============================================================================
// ENERGY CONVERSIONS (Optional - for strict metric users)
// ============================================================================

export interface EnergyDisplay {
  value: number
  unit: string
  formatted: string
}

/**
 * Convert energy from kcal to user's preferred system
 * (Most users prefer kcal even in metric regions)
 */
export function displayEnergy(kcal: number, system: UnitSystem, useKJ: boolean = false): EnergyDisplay {
  if (system === 'metric' && useKJ) {
    const kJ = Math.round(kcal * KCAL_TO_KJ)
    return {
      value: kJ,
      unit: 'kJ',
      formatted: `${kJ} kJ`
    }
  }

  const rounded = Math.round(kcal)
  return {
    value: rounded,
    unit: 'kcal',
    formatted: `${rounded} cal`
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get weight unit for system
 */
export function getWeightUnit(system: UnitSystem): string {
  return system === 'imperial' ? 'lbs' : 'kg'
}

/**
 * Get height unit for system
 */
export function getHeightUnit(system: UnitSystem): string {
  return system === 'imperial' ? 'ft/in' : 'cm'
}

/**
 * Get distance unit for system
 */
export function getDistanceUnit(system: UnitSystem): string {
  return system === 'imperial' ? 'miles' : 'km'
}

/**
 * Format weight with proper precision
 */
export function formatWeight(value: number, system: UnitSystem): string {
  const decimals = system === 'imperial' ? 1 : 1
  return value.toFixed(decimals)
}

/**
 * Format height as string
 */
export function formatHeight(value: number | HeightFeetInches, system: UnitSystem): string {
  if (system === 'imperial' && typeof value === 'object') {
    return `${value.feet}'${value.inches}"`
  }
  return `${value} cm`
}

/**
 * Format distance with proper precision
 */
export function formatDistance(value: number, system: UnitSystem): string {
  const decimals = value < 1 ? 3 : (value < 10 ? 2 : 1)
  const unit = system === 'imperial' ? 'mi' : 'km'
  return `${value.toFixed(decimals)} ${unit}`
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate weight input
 */
export function isValidWeight(value: number, system: UnitSystem): boolean {
  if (system === 'imperial') {
    return value >= 66 && value <= 660  // 30-300 kg in lbs
  }
  return value >= 30 && value <= 300  // kg
}

/**
 * Validate height input
 */
export function isValidHeight(value: number | HeightFeetInches, system: UnitSystem): boolean {
  if (system === 'imperial' && typeof value === 'object') {
    const totalInches = (value.feet * 12) + value.inches
    return totalInches >= 39 && totalInches <= 118  // 100-300 cm in inches
  }
  return typeof value === 'number' && value >= 100 && value <= 300  // cm
}

/**
 * Get weight input constraints for validation
 */
export function getWeightConstraints(system: UnitSystem) {
  if (system === 'imperial') {
    return { min: 66, max: 660, step: 0.1 }  // lbs
  }
  return { min: 30, max: 300, step: 0.1 }  // kg
}

/**
 * Get height input constraints for validation
 */
export function getHeightConstraints(system: UnitSystem) {
  if (system === 'imperial') {
    return { minFeet: 3, maxFeet: 9, minInches: 0, maxInches: 11 }
  }
  return { min: 100, max: 300, step: 1 }  // cm
}

// ============================================================================
// TYPESCRIPT TYPES (exported above)
// ============================================================================
