/**
 * useUserLanguage Hook
 *
 * React hook for managing user language preference
 * Fetches language from user profile and provides helper for localized food names
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCurrentUser } from '@/lib/api/users'
import { getLocalizedFoodName, getLocalizedBrandName, type SupportedLanguage } from '@/lib/utils/language'
import type { Food } from '@/lib/types/food'

export function useUserLanguage() {
  const [language, setLanguage] = useState<SupportedLanguage>('en')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserLanguage() {
      try {
        const user = await getCurrentUser()
        const userLang = user.language || 'en'

        // Validate that user's language is currently supported
        // If user has pt/es from before, default to en
        const supportedLanguages: SupportedLanguage[] = ['en', 'fr', 'de', 'it', 'ja', 'ko', 'zh']
        if (supportedLanguages.includes(userLang as SupportedLanguage)) {
          setLanguage(userLang as SupportedLanguage)
        } else {
          // User has unsupported language (pt/es) - default to en
          setLanguage('en')
        }
      } catch (error) {
        console.error('Failed to fetch user language:', error)
        // Fallback to browser language
        const browserLang = navigator.language.split('-')[0]
        const supportedLanguages: SupportedLanguage[] = ['en', 'fr', 'de', 'it', 'ja', 'ko', 'zh']
        if (supportedLanguages.includes(browserLang as SupportedLanguage)) {
          setLanguage(browserLang as SupportedLanguage)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserLanguage()
  }, [])

  const getFoodName = useCallback((food: Food) => {
    return getLocalizedFoodName(food, language)
  }, [language])

  const getBrandName = useCallback((food: Food) => {
    return getLocalizedBrandName(food, language)
  }, [language])

  return {
    language,
    loading,
    getFoodName,
    getBrandName,
  }
}
