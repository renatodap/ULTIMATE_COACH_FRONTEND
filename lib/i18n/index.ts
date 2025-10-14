/**
 * i18n (Internationalization) System
 *
 * Type-safe translations with easy language switching.
 * Supports interpolation and pluralization.
 */

import { en, type TranslationKey } from './translations/en'
import { pt } from './translations/pt'

// ============================================================================
// TYPES
// ============================================================================

type Language = 'en' | 'es' | 'pt' | 'fr' | 'de'

type DeepKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${DeepKeyOf<T[K]>}`
          : K
        : never
    }[keyof T]
  : never

type TranslationKeys = DeepKeyOf<TranslationKey>

type InterpolationValues = Record<string, string | number>

// ============================================================================
// STATE
// ============================================================================

let currentLanguage: Language = 'en'

const translations: Record<Language, TranslationKey> = {
  en,
  pt,
  // Future languages:
  // es: () => import('./translations/es').then(m => m.default),
  // fr: () => import('./translations/fr').then(m => m.default),
  // de: () => import('./translations/de').then(m => m.default),
} as any

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}

/**
 * Replace interpolation placeholders with values
 * Example: "Hello, {{name}}!" with {name: "John"} => "Hello, John!"
 */
function interpolate(text: string, values?: InterpolationValues): string {
  if (!values) return text

  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key]?.toString() || match
  })
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Get translation by key
 *
 * @param key - Translation key (dot notation)
 * @param values - Optional interpolation values
 *
 * @example
 * t('auth.loginButton') => 'LOG IN'
 * t('dashboard.greeting', { name: 'John' }) => 'Hello, John!'
 */
export function t(key: TranslationKeys, values?: InterpolationValues): string {
  const translation = getNestedValue(translations[currentLanguage], key)
  return interpolate(translation, values)
}

/**
 * Get current language
 */
export function getLanguage(): Language {
  return currentLanguage
}

/**
 * Set current language
 *
 * @param language - Language code
 */
export function setLanguage(language: Language): void {
  if (!translations[language]) {
    console.warn(`Language "${language}" not available, falling back to "en"`)
    currentLanguage = 'en'
    return
  }

  currentLanguage = language

  // Store in localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', language)
  }
}

/**
 * Initialize i18n system
 * Reads saved language from localStorage
 */
export function initI18n(): void {
  if (typeof window === 'undefined') return

  const savedLanguage = localStorage.getItem('language') as Language
  if (savedLanguage && translations[savedLanguage]) {
    currentLanguage = savedLanguage
  } else {
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0] as Language
    if (translations[browserLang]) {
      currentLanguage = browserLang
    }
  }
}

/**
 * Get all available languages
 */
export function getAvailableLanguages(): { code: Language; name: string }[] {
  return [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    // Future:
    // { code: 'es', name: 'Español' },
    // { code: 'fr', name: 'Français' },
    // { code: 'de', name: 'Deutsch' },
  ]
}

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect } from 'react'

/**
 * React hook for translations with reactivity
 *
 * @example
 * const { t, language, setLanguage } = useTranslation()
 * <button>{t('common.save')}</button>
 */
export function useTranslation() {
  const [language, setLanguageState] = useState(currentLanguage)

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    setLanguageState(lang)
  }

  useEffect(() => {
    initI18n()
    setLanguageState(currentLanguage)
  }, [])

  return {
    t,
    language,
    setLanguage: changeLanguage,
    availableLanguages: getAvailableLanguages(),
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { Language, TranslationKeys }
export { en } from './translations/en'
