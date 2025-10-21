/**
 * Language Utilities
 *
 * Utilities for multi-language support (i18n)
 */

import { Food } from '@/lib/types/food'

export type SupportedLanguage = 'en' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'zh'

/**
 * Get localized food name based on user's language preference
 *
 * @param food - Food object with name
 * @param language - User's language preference
 * @returns Localized food name, falling back to English if translation unavailable
 */
export function getLocalizedFoodName(food: Food, language: SupportedLanguage = 'en'): string {
  // Currently only English is supported
  // Future: Add support for other languages when translations are available
  return food.name
}

/**
 * Get localized brand name based on user's language preference
 *
 * @param food - Food object with brand_name
 * @param language - User's language preference
 * @returns Localized brand name or null, falling back to English if translation unavailable
 */
export function getLocalizedBrandName(food: Food, language: SupportedLanguage = 'en'): string | null {
  // Currently only English is supported
  // Future: Add support for other languages when translations are available
  return food.brand_name
}

/**
 * Get full localized food display name with brand (if present)
 *
 * @param food - Food object
 * @param language - User's language preference
 * @returns "Brand Name - Food Name" or just "Food Name" if no brand
 *
 * @example
 * getFullFoodName(food, 'en') // "Chobani - Greek Yogurt Strawberry"
 */
export function getFullFoodName(food: Food, language: SupportedLanguage = 'en'): string {
  const foodName = getLocalizedFoodName(food, language)
  const brandName = getLocalizedBrandName(food, language)

  if (brandName) {
    return `${brandName} - ${foodName}`
  }
  return foodName
}

/**
 * Detect browser language and return supported language code
 *
 * @returns Detected language code (defaults to 'en' if unsupported)
 */
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return 'en' // Server-side default
  }

  // Get browser language (e.g., "pt-BR" → "pt")
  const browserLang = navigator.language.split('-')[0]

  // Check if supported
  const supportedLanguages: SupportedLanguage[] = ['en', 'fr', 'de', 'it', 'ja', 'ko', 'zh']

  if (supportedLanguages.includes(browserLang as SupportedLanguage)) {
    return browserLang as SupportedLanguage
  }

  return 'en' // Default fallback
}

/**
 * Get language display name for UI
 *
 * @param language - Language code
 * @returns Human-readable language name
 */
export function getLanguageDisplayName(language: SupportedLanguage): string {
  const displayNames: Record<SupportedLanguage, string> = {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    ja: '日本語',
    ko: '한국어',
    zh: '中文'
  }

  return displayNames[language] || 'English'
}
