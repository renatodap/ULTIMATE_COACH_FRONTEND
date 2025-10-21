'use client'

/**
 * Enhanced Onboarding Flow - 12 Screens
 * Comprehensive data collection for personalized coaching
 */

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { completeOnboarding, getTrainingModalities, type TrainingModality, type TrainingModalitySelection } from '@/lib/api/onboarding'
import { getCurrentUser } from '@/lib/api/users'
import { ErrorLogger, ErrorCategory, ErrorSeverity } from '@/lib/logging/ErrorLogger'
import { getUserFriendlyErrorMessage } from '@/components/auth/AuthErrorMessage'
import {
  weightToKg,
  weightFromKg,
  heightToCm,
  heightFromCm,
  isValidHeight,
  type UnitSystem,
} from '@/lib/utils/units'
import { detectBrowserLanguage, type SupportedLanguage } from '@/lib/utils/language'
import { Message } from '@/components/onboarding/Message'
import { ButtonGroup } from '@/components/onboarding/ButtonGroup'
import { Input } from '@/components/onboarding/Input'

// Import new consultation components
import ModalitiesSearchSelector from '@/components/onboarding/ModalitiesSearchSelector'
import ExerciseSearchSelector from '@/components/onboarding/ExerciseSearchSelector'
import ScheduleCalendarGrid from '@/components/onboarding/ScheduleCalendarGrid'
import MealTimesSelector from '@/components/onboarding/MealTimesSelector'
import FoodSearchSelector from '@/components/onboarding/FoodSearchSelector'
import EventsSelector from '@/components/onboarding/EventsSelector'
import GoalsBuilder from '@/components/onboarding/GoalsBuilder'
import DifficultiesForm from '@/components/onboarding/DifficultiesForm'
import ConstraintsForm from '@/components/onboarding/ConstraintsForm'

// Import types
import type {
  ExerciseFamiliarityEntry,
  TrainingAvailabilitySlot,
  MealTimingPreference,
  TypicalFoodEntry,
  EventEntry,
  ImprovementGoalEntry,
  DifficultyEntry,
  NonNegotiableEntry,
} from '@/lib/api/onboarding'

type Step =
  | 'language'
  // Phase 1: Essentials (3 screens)
  | 'physical_stats'
  | 'goals_experience'
  // Phase 2: Training Background (3 screens)
  | 'training_modalities'
  | 'exercise_familiarity'
  | 'training_availability'
  // Phase 3: Nutrition Profile (3 screens)
  | 'diet_lifestyle'
  | 'meal_timing'
  | 'typical_foods'
  // Phase 4: Goals & Context (3 screens)
  | 'events'
  | 'improvement_goals'
  | 'difficulties_constraints'
  | 'calculating'
  | 'complete'

const STEP_ORDER: Step[] = [
  'language',
  'physical_stats',
  'goals_experience',
  'training_modalities',
  'exercise_familiarity',
  'training_availability',
  'diet_lifestyle',
  'meal_timing',
  'typical_foods',
  'events',
  'improvement_goals',
  'difficulties_constraints',
]

export default function OnboardingPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [step, setStep] = useState<Step>('language')

  const [data, setData] = useState({
    language: 'en' as SupportedLanguage,
    // Physical Stats (Screen 2)
    birth_date: '',
    biological_sex: '',
    height_cm: 0,
    current_weight_kg: 0,
    goal_weight_kg: 0,
    // Goals & Experience (Screen 3)
    primary_goal: '',
    secondary_goal: '' as '' | 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_performance',
    experience_level: '',
    workout_frequency: 0,
    activity_level: '',
    sleep_hours: 7,
    // Training Modalities (Screen 4)
    training_modalities: [] as TrainingModalitySelection[],
    // Exercise Familiarity (Screen 5)
    exercise_familiarity: [] as ExerciseFamiliarityEntry[],
    // Training Availability (Screen 6)
    training_availability: [] as TrainingAvailabilitySlot[],
    // Diet & Lifestyle (Screen 7)
    fitness_notes: '',
    dietary_preference: 'none',
    food_allergies: [] as string[],
    meals_per_day: 3,
    stress_level: 'medium',
    cooks_regularly: true,
    // Meal Timing (Screen 8)
    meal_timing_preferences: [] as MealTimingPreference[],
    // Typical Foods (Screen 9)
    typical_foods: [] as TypicalFoodEntry[],
    // Events (Screen 10)
    upcoming_events: [] as EventEntry[],
    // Improvement Goals (Screen 11)
    improvement_goals: [] as ImprovementGoalEntry[],
    // Difficulties & Constraints (Screen 12)
    difficulties: [] as DifficultyEntry[],
    non_negotiables: [] as NonNegotiableEntry[],
    // Auto-detected
    unit_system: 'imperial' as UnitSystem,
  })

  // Fetch training modalities on mount
  const [availableModalities, setAvailableModalities] = useState<TrainingModality[]>([])
  useEffect(() => {
    async function fetchModalities() {
      try {
        const modalities = await getTrainingModalities()
        setAvailableModalities(modalities)
      } catch (error) {
        ErrorLogger.log({
          category: ErrorCategory.ONBOARDING_LOAD,
          severity: ErrorSeverity.WARNING,
          message: 'Failed to fetch training modalities',
          error,
          featureData: { note: 'Continuing without modalities - not critical' }
        })
      }
    }
    fetchModalities()
  }, [])

  // Auto-detect browser language + timezone on mount
  useEffect(() => {
    const detectedLanguage = detectBrowserLanguage()
    setData(prev => ({ ...prev, language: detectedLanguage }))
  }, [])

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('onboarding_progress')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setData(prev => ({ ...prev, ...parsed }))
        ErrorLogger.log({
          category: ErrorCategory.ONBOARDING_LOAD,
          severity: ErrorSeverity.INFO,
          message: 'Restored onboarding progress from localStorage'
        })
      } catch (error) {
        ErrorLogger.log({
          category: ErrorCategory.ONBOARDING_LOAD,
          severity: ErrorSeverity.WARNING,
          message: 'Failed to parse saved onboarding data',
          error
        })
      }
    }
  }, [])

  // Auto-save data to localStorage whenever it changes
  useEffect(() => {
    // Don't save if we're in the initial language selection
    if (step === 'language' && !data.birth_date) return

    try {
      localStorage.setItem('onboarding_progress', JSON.stringify(data))
    } catch (error) {
      ErrorLogger.log({
        category: ErrorCategory.ONBOARDING_LOAD,
        severity: ErrorSeverity.WARNING,
        message: 'Failed to save onboarding progress to localStorage',
        error
      })
    }
  }, [data, step])

  // Check if user already completed onboarding - redirect if yes
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const user = await getCurrentUser()

        if (user.onboarding_completed) {
          ErrorLogger.log({
            category: ErrorCategory.ONBOARDING_NAVIGATION,
            severity: ErrorSeverity.INFO,
            message: 'User already completed onboarding, redirecting to dashboard',
            userId: user.id,
            userEmail: user.email
          })
          router.push('/dashboard')
          return
        }

        setCheckingOnboarding(false)
      } catch (error: any) {
        if (error?.status === 401 || error?.message?.includes('401')) {
          ErrorLogger.log({
            category: ErrorCategory.ONBOARDING_NAVIGATION,
            severity: ErrorSeverity.WARNING,
            message: 'User not authenticated, redirecting to login',
            statusCode: 401
          })
          router.push('/login')
          return
        }

        ErrorLogger.log({
          category: ErrorCategory.ONBOARDING_LOAD,
          severity: ErrorSeverity.ERROR,
          message: 'Error checking onboarding status',
          error,
          featureData: { note: 'Allowing access anyway for better UX' }
        })
        setCheckingOnboarding(false)
      }
    }

    checkOnboardingStatus()
  }, [router])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  // Local input states
  const [heightInput, setHeightInput] = useState('')
  const [heightFeetInput, setHeightFeetInput] = useState('')
  const [heightInchesInput, setHeightInchesInput] = useState('')
  const [currentWeightInput, setCurrentWeightInput] = useState('')
  const [goalWeightInput, setGoalWeightInput] = useState('')
  const [allergyInput, setAllergyInput] = useState('')

  const next = useCallback((stepName: Step) => {
    setStep(stepName)
    setValidationErrors({})
  }, [])

  const updateData = useCallback((updates: Partial<typeof data>) => {
    setData(prev => ({ ...prev, ...updates }))
  }, [])

  // Progress calculation
  const currentStepIndex = STEP_ORDER.indexOf(step)
  const totalSteps = STEP_ORDER.length
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100

  // Navigation helpers
  const goBack = () => {
    const currentIndex = STEP_ORDER.indexOf(step)
    if (currentIndex > 0) {
      next(STEP_ORDER[currentIndex - 1])
    }
  }

  const goNext = (validationFn?: () => boolean) => {
    if (validationFn && !validationFn()) return

    const currentIndex = STEP_ORDER.indexOf(step)
    if (currentIndex < STEP_ORDER.length - 1) {
      next(STEP_ORDER[currentIndex + 1])
    }
  }

  // Validation functions
  const validatePhysicalStats = (): boolean => {
    const errors: {[key: string]: string} = {}

    if (!data.birth_date) {
      errors.birth_date = 'Please enter your birth date to continue'
    } else {
      const bd = new Date(data.birth_date)
      const today = new Date()
      const age = Math.floor((today.getTime() - bd.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      if (age < 13) {
        errors.birth_date = 'You must be at least 13 years old to use this app'
      } else if (age > 120) {
        errors.birth_date = 'Please check your birth date - the year seems incorrect'
      }
    }

    if (!data.biological_sex) {
      errors.biological_sex = 'Biological sex is required'
    }

    if (!data.height_cm || data.height_cm < 100 || data.height_cm > 300) {
      errors.height = 'Height must be between 100-300 cm (3\'3" - 9\'10")'
    }

    if (!data.current_weight_kg || data.current_weight_kg < 30 || data.current_weight_kg > 300) {
      errors.current_weight = 'Weight must be between 30-300 kg (66-661 lbs)'
    }

    if (!data.goal_weight_kg || data.goal_weight_kg < 30 || data.goal_weight_kg > 300) {
      errors.goal_weight = 'Goal weight must be between 30-300 kg (66-661 lbs)'
    }

    // Goal-specific weight validation
    if (data.current_weight_kg && data.goal_weight_kg && data.primary_goal) {
      const weightDiff = Math.abs(data.goal_weight_kg - data.current_weight_kg)

      if (weightDiff > data.current_weight_kg * 0.5) {
        errors.goal_weight = 'Goal weight must be within 50% of current weight for safety'
      }

      if (data.primary_goal === 'lose_weight' && data.goal_weight_kg >= data.current_weight_kg) {
        errors.goal_weight = 'Goal weight should be less than current weight for weight loss'
      } else if (data.primary_goal === 'build_muscle' && data.goal_weight_kg <= data.current_weight_kg) {
        errors.goal_weight = 'Goal weight should be greater than current weight for muscle building'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateGoalsExperience = (): boolean => {
    const errors: {[key: string]: string} = {}

    if (!data.primary_goal) errors.primary_goal = 'Primary goal is required'
    if (!data.experience_level) errors.experience_level = 'Experience level is required'
    if (!data.activity_level) errors.activity_level = 'Activity level is required'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submit = async () => {
    setLoading(true)
    setError('')

    try {
      // Get timezone with fallback
      let timezone = 'America/New_York'
      try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
      } catch (e) {
        ErrorLogger.log({
          category: ErrorCategory.ONBOARDING_LOAD,
          severity: ErrorSeverity.WARNING,
          message: 'Failed to detect timezone, using default',
          error: e,
          featureData: { defaultTimezone: 'America/New_York' }
        })
      }

      const payload = {
        primary_goal: data.primary_goal as any,
        secondary_goal: (data.secondary_goal === '' ? undefined : data.secondary_goal) as 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_performance' | undefined,
        experience_level: data.experience_level as any,
        workout_frequency: data.workout_frequency,
        training_modalities: data.training_modalities.length > 0 ? data.training_modalities : undefined,
        fitness_notes: data.fitness_notes || undefined,
        birth_date: data.birth_date,
        biological_sex: data.biological_sex as any,
        height_cm: data.height_cm,
        current_weight_kg: data.current_weight_kg,
        goal_weight_kg: data.goal_weight_kg,
        activity_level: data.activity_level as any,
        dietary_preference: data.dietary_preference as any,
        food_allergies: data.food_allergies,
        foods_to_avoid: [],
        meals_per_day: data.meals_per_day,
        sleep_hours: data.sleep_hours,
        stress_level: data.stress_level as any,
        cooks_regularly: data.cooks_regularly,
        unit_system: data.unit_system,
        timezone: timezone,
        // Phase 2: Training Background
        exercise_familiarity: data.exercise_familiarity.length > 0 ? data.exercise_familiarity : undefined,
        training_availability: data.training_availability.length > 0 ? data.training_availability : undefined,
        // Phase 3: Nutrition Profile
        meal_timing_preferences: data.meal_timing_preferences.length > 0 ? data.meal_timing_preferences : undefined,
        typical_foods: data.typical_foods.length > 0 ? data.typical_foods : undefined,
        // Phase 4: Goals & Context
        upcoming_events: data.upcoming_events.length > 0 ? data.upcoming_events : undefined,
        improvement_goals: data.improvement_goals.length > 0 ? data.improvement_goals : undefined,
        difficulties: data.difficulties.length > 0 ? data.difficulties : undefined,
        non_negotiables: data.non_negotiables.length > 0 ? data.non_negotiables : undefined,
      }

      ErrorLogger.log({
        category: ErrorCategory.ONBOARDING_SUBMIT,
        severity: ErrorSeverity.INFO,
        message: 'Submitting comprehensive onboarding data',
        featureData: {
          primary_goal: payload.primary_goal,
          experience_level: payload.experience_level,
          activity_level: payload.activity_level,
          has_training_modalities: !!payload.training_modalities,
          has_exercise_familiarity: !!payload.exercise_familiarity,
          has_training_availability: !!payload.training_availability,
          has_meal_timing: !!payload.meal_timing_preferences,
          has_typical_foods: !!payload.typical_foods,
          has_events: !!payload.upcoming_events,
          has_goals: !!payload.improvement_goals,
          has_difficulties: !!payload.difficulties,
          has_non_negotiables: !!payload.non_negotiables,
        }
      })
      await completeOnboarding(payload)

      // Clear saved progress from localStorage
      try {
        localStorage.removeItem('onboarding_progress')
      } catch (error) {
        // Ignore localStorage errors
      }

      // Immediate redirect with full page reload to ensure fresh app state
      window.location.href = '/dashboard'
    } catch (err: any) {
      ErrorLogger.log({
        category: ErrorCategory.ONBOARDING_SUBMIT,
        severity: ErrorSeverity.ERROR,
        message: 'Onboarding submission failed',
        error: err,
        statusCode: err?.status,
        featureData: {
          errorMessage: err?.message
        }
      })

      if (err?.message?.includes('Session expired') ||
          err?.message?.includes('Authentication required') ||
          err?.status === 401) {
        window.location.href = '/login'
        return
      }

      const friendlyError = getUserFriendlyErrorMessage(err)
      setError(friendlyError || 'Failed to complete onboarding. Please try again.')
      setLoading(false)
    }
  }

  // Show loading state while checking onboarding status
  if (checkingOnboarding) {
    return (
      <div className="min-h-screen bg-iron-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-iron-orange border-t-transparent animate-spin mx-auto mb-4 shadow-lg shadow-iron-orange/50" />
          <p className="text-iron-gray text-lg">Checking your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iron-black px-4 sm:px-6 md:px-8 py-8 sm:py-12 flex flex-col">
      {/* Progress Indicator */}
      {step !== 'language' && step !== 'calculating' && step !== 'complete' && (
        <div className="max-w-4xl w-full mx-auto mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-iron-gray">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="text-sm text-iron-gray">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <div className="w-full h-2 bg-iron-dark-gray rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-iron-orange"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full mx-auto flex-1 flex items-center">
        <AnimatePresence mode="wait">
          {/* Language Selection */}
          {step === 'language' && (
            <motion.div
              key="language"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Message text="Welcome to SHARPENED 🎯" isWelcome={true} />
              <Message text="First, let's choose your language." />
              <ButtonGroup
                options={[
                  { label: 'English', value: 'en' },
                  { label: 'Português 🇧🇷', value: 'pt' },
                  { label: 'Español (Coming Soon)', value: 'es' },
                ]}
                onSelect={(val) => {
                  if (val !== 'en' && val !== 'pt') return
                  updateData({ language: val as SupportedLanguage })
                  setTimeout(() => next('physical_stats'), 200)
                }}
              />
            </motion.div>
          )}

          {/* Screen 2: Physical Stats */}
          {step === 'physical_stats' && (
            <motion.div
              key="physical_stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-8"
            >
              <Message text="Let's start with your physical stats" />

              <div className="space-y-6 bg-neutral-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                {/* Birth Date */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">Birth Date</label>
                  <input
                    type="date"
                    name="birth_date"
                    autoComplete="bday"
                    value={data.birth_date}
                    onChange={(e) => updateData({ birth_date: e.target.value })}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-base sm:text-lg bg-neutral-900/50 text-iron-white border-2 border-neutral-700 focus:border-iron-orange focus:outline-none focus:bg-neutral-800/80 transition-all"
                  />
                  {validationErrors.birth_date && (
                    <p className="text-error text-sm mt-2">{validationErrors.birth_date}</p>
                  )}
                </div>

                {/* Biological Sex */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">
                    Biological Sex <span className="text-iron-gray text-xs sm:text-sm">(for accurate calorie calculation)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: t('onboarding.male'), value: 'male' },
                      { label: t('onboarding.female'), value: 'female' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData({ biological_sex: option.value })}
                        className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                          data.biological_sex === option.value
                            ? 'bg-iron-orange text-iron-white shadow-lg shadow-iron-orange/50'
                            : 'bg-neutral-900/50 text-iron-gray border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {validationErrors.biological_sex && (
                    <p className="text-error text-sm mt-2">{validationErrors.biological_sex}</p>
                  )}
                </div>

                {/* Unit System Toggle */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">Preferred Units</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: t('onboarding.imperial'), value: 'imperial', desc: 'lbs, ft/in' },
                      { label: t('onboarding.metric'), value: 'metric', desc: 'kg, cm' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData({ unit_system: option.value as UnitSystem })}
                        className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                          data.unit_system === option.value
                            ? 'bg-iron-orange text-iron-white shadow-lg shadow-iron-orange/50'
                            : 'bg-neutral-900/50 text-iron-gray border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        <div>{option.label}</div>
                        <div className="text-sm opacity-70">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Height */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">
                    Height {data.unit_system === 'imperial' ? '(feet and inches)' : '(cm)'}
                  </label>
                  {data.unit_system === 'imperial' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          name="height_feet"
                          value={heightFeetInput}
                          onChange={(e) => {
                            const val = e.target.value
                            setHeightFeetInput(val)
                            const feet = parseInt(val || '0', 10)
                            const inches = parseInt(heightInchesInput || '0', 10)
                            const cm = heightToCm({ feet, inches }, 'imperial')
                            updateData({ height_cm: cm })
                          }}
                          placeholder="e.g., 5"
                          className="w-full px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-iron-white placeholder-iron-gray border-2 border-neutral-700 focus:border-iron-orange focus:outline-none focus:bg-neutral-800/80 transition-all"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-iron-gray text-base font-medium">ft</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          name="height_inches"
                          value={heightInchesInput}
                          onChange={(e) => {
                            const val = e.target.value
                            setHeightInchesInput(val)
                            const feet = parseInt(heightFeetInput || '0', 10)
                            const inches = parseInt(val || '0', 10)
                            const cm = heightToCm({ feet, inches }, 'imperial')
                            updateData({ height_cm: cm })
                          }}
                          placeholder="e.g., 10"
                          className="w-full px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-iron-white placeholder-iron-gray border-2 border-neutral-700 focus:border-iron-orange focus:outline-none focus:bg-neutral-800/80 transition-all"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-iron-gray text-base font-medium">in</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        name="height_cm"
                        value={heightInput}
                        onChange={(e) => {
                          const val = e.target.value
                          setHeightInput(val)
                          const num = parseFloat(val)
                          if (!isNaN(num)) updateData({ height_cm: num })
                        }}
                        placeholder="e.g., 178"
                        className="w-full px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-iron-white placeholder-iron-gray border-2 border-neutral-700 focus:border-iron-orange focus:outline-none focus:bg-neutral-800/80 transition-all"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-iron-gray text-base font-medium">cm</span>
                    </div>
                  )}
                  {validationErrors.height && (
                    <p className="text-error text-sm mt-2">{validationErrors.height}</p>
                  )}
                </div>

                {/* Current Weight */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">
                    Current Weight {data.unit_system === 'imperial' ? '(lbs)' : '(kg)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      name="current_weight"
                      step="0.1"
                      value={currentWeightInput}
                      onChange={(e) => {
                        const val = e.target.value
                        setCurrentWeightInput(val)
                        const num = parseFloat(val)
                        if (!isNaN(num)) {
                          const kg = weightToKg(num, data.unit_system)
                          updateData({ current_weight_kg: kg })
                        }
                      }}
                      placeholder={data.unit_system === 'imperial' ? 'e.g., 180' : 'e.g., 82'}
                      className="w-full px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-iron-white placeholder-iron-gray border-2 border-neutral-700 focus:border-iron-orange focus:outline-none focus:bg-neutral-800/80 transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-iron-gray text-base font-medium">
                      {data.unit_system === 'imperial' ? 'lbs' : 'kg'}
                    </span>
                  </div>
                  {validationErrors.current_weight && (
                    <p className="text-error text-sm mt-2">{validationErrors.current_weight}</p>
                  )}
                </div>

                {/* Goal Weight */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">
                    Goal Weight {data.unit_system === 'imperial' ? '(lbs)' : '(kg)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      name="goal_weight"
                      step="0.1"
                      value={goalWeightInput}
                      onChange={(e) => {
                        const val = e.target.value
                        setGoalWeightInput(val)
                        const num = parseFloat(val)
                        if (!isNaN(num)) {
                          const kg = weightToKg(num, data.unit_system)
                          updateData({ goal_weight_kg: kg })
                        }
                      }}
                      placeholder={data.unit_system === 'imperial' ? 'e.g., 170' : 'e.g., 77'}
                      className="w-full px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-iron-white placeholder-iron-gray border-2 border-neutral-700 focus:border-iron-orange focus:outline-none focus:bg-neutral-800/80 transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-iron-gray text-base font-medium">
                      {data.unit_system === 'imperial' ? 'lbs' : 'kg'}
                    </span>
                  </div>
                  {validationErrors.goal_weight && (
                    <p className="text-error text-sm mt-2">{validationErrors.goal_weight}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => goNext(validatePhysicalStats)}
                className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-iron-orange text-iron-white shadow-xl shadow-iron-orange/50 hover:shadow-2xl hover:shadow-iron-orange/60 transition-all"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* Screen 3: Goals & Experience */}
          {step === 'goals_experience' && (
            <motion.div
              key="goals_experience"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-8"
            >
              <Message text="Tell us about your goals and lifestyle" />

              <div className="space-y-8 bg-neutral-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                {/* Primary Goal */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">What&apos;s your primary goal?</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: t('onboarding.loseWeight'), value: 'lose_weight' },
                      { label: t('onboarding.buildMuscle'), value: 'build_muscle' },
                      { label: t('onboarding.maintain'), value: 'maintain' },
                      { label: t('onboarding.improvePerformance'), value: 'improve_performance' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData({ primary_goal: option.value })}
                        className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                          data.primary_goal === option.value
                            ? 'bg-iron-orange text-iron-white shadow-lg shadow-iron-orange/50'
                            : 'bg-neutral-900/50 text-iron-gray border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {validationErrors.primary_goal && (
                    <p className="text-error text-sm mt-2">{validationErrors.primary_goal}</p>
                  )}
                </div>

                {/* Secondary Goal (Optional) */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">
                    Secondary goal? <span className="text-iron-gray text-xs sm:text-sm">(optional)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'None', value: '' },
                      ...([
                        { label: t('onboarding.loseWeight'), value: 'lose_weight' },
                        { label: t('onboarding.buildMuscle'), value: 'build_muscle' },
                        { label: t('onboarding.maintain'), value: 'maintain' },
                        { label: t('onboarding.improvePerformance'), value: 'improve_performance' },
                      ].filter(opt => opt.value !== data.primary_goal))
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData({ secondary_goal: option.value as '' | 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_performance' })}
                        className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                          data.secondary_goal === option.value
                            ? 'bg-iron-orange text-iron-white shadow-lg shadow-iron-orange/50'
                            : 'bg-neutral-900/50 text-iron-gray border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">Fitness experience level?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { label: t('onboarding.beginner'), value: 'beginner', desc: '< 1 year' },
                      { label: t('onboarding.intermediate'), value: 'intermediate', desc: '1-3 years' },
                      { label: t('onboarding.advanced'), value: 'advanced', desc: '3+ years' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData({ experience_level: option.value })}
                        className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                          data.experience_level === option.value
                            ? 'bg-iron-orange text-iron-white shadow-lg shadow-iron-orange/50'
                            : 'bg-neutral-900/50 text-iron-gray border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        <div>{option.label}</div>
                        <div className="text-sm opacity-70">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                  {validationErrors.experience_level && (
                    <p className="text-error text-sm mt-2">{validationErrors.experience_level}</p>
                  )}
                </div>

                {/* Workout Frequency */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">How often can you train per week?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { label: '0-1', value: 0 },
                      { label: '2-3', value: 2 },
                      { label: '4-5', value: 4 },
                      { label: '6-7', value: 6 },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData({ workout_frequency: option.value })}
                        className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                          data.workout_frequency === option.value
                            ? 'bg-iron-orange text-iron-white shadow-lg shadow-iron-orange/50'
                            : 'bg-neutral-900/50 text-iron-gray border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">Daily activity level (outside workouts)?</label>
                  <div className="space-y-3">
                    {[
                      { label: t('onboarding.sedentary'), value: 'sedentary', desc: t('onboarding.sedentaryDesc') },
                      { label: t('onboarding.lightlyActive'), value: 'lightly_active', desc: t('onboarding.lightlyActiveDesc') },
                      { label: t('onboarding.moderatelyActive'), value: 'moderately_active', desc: t('onboarding.moderatelyActiveDesc') },
                      { label: t('onboarding.veryActive'), value: 'very_active', desc: t('onboarding.veryActiveDesc') },
                      { label: t('onboarding.extremelyActive'), value: 'extremely_active', desc: t('onboarding.extremelyActiveDesc') },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData({ activity_level: option.value })}
                        className={`w-full px-6 py-4 rounded-xl text-left transition-all ${
                          data.activity_level === option.value
                            ? 'bg-iron-orange text-iron-white shadow-lg shadow-iron-orange/50'
                            : 'bg-neutral-900/50 text-iron-gray border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        <div className="font-medium text-lg">{option.label}</div>
                        <div className="text-sm opacity-70">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                  {validationErrors.activity_level && (
                    <p className="text-error text-sm mt-2">{validationErrors.activity_level}</p>
                  )}
                </div>

                {/* Sleep Hours */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">Average nightly sleep?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { label: '< 6 hrs', value: 5 },
                      { label: '6-7 hrs', value: 6.5 },
                      { label: '7-8 hrs', value: 7.5 },
                      { label: '8+ hrs', value: 8.5 },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData({ sleep_hours: option.value })}
                        className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                          data.sleep_hours === option.value
                            ? 'bg-iron-orange text-iron-white shadow-lg shadow-iron-orange/50'
                            : 'bg-neutral-900/50 text-iron-gray border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={goBack}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-iron-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => goNext(validateGoalsExperience)}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-iron-orange text-iron-white shadow-xl shadow-iron-orange/50 hover:shadow-2xl hover:shadow-iron-orange/60 transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Screen 4: Training Modalities */}
          {step === 'training_modalities' && (
            <motion.div
              key="training_modalities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-8"
            >
              <Message text="What do you train?" />
              <p className="text-iron-gray text-base -mt-4">Select all that apply (optional)</p>

              <div className="bg-neutral-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                <ModalitiesSearchSelector
                  selectedModalities={data.training_modalities}
                  onChange={(modalities) => updateData({ training_modalities: modalities })}
                />
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={goBack}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-iron-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => goNext()}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-iron-orange text-iron-white shadow-xl shadow-iron-orange/50 hover:shadow-2xl hover:shadow-iron-orange/60 transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Screen 5: Exercise Familiarity */}
          {step === 'exercise_familiarity' && (
            <motion.div
              key="exercise_familiarity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-8"
            >
              <Message text="Which exercises are you familiar with?" />
              <p className="text-iron-gray text-base -mt-4">This helps us match your experience (optional)</p>

              <div className="bg-neutral-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                <ExerciseSearchSelector
                  selectedExercises={data.exercise_familiarity}
                  onChange={(exercises) => updateData({ exercise_familiarity: exercises })}
                />
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={goBack}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-iron-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => goNext()}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-iron-orange text-iron-white shadow-xl shadow-iron-orange/50 hover:shadow-2xl hover:shadow-iron-orange/60 transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Screen 6: Training Availability */}
          {step === 'training_availability' && (
            <motion.div
              key="training_availability"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-8"
            >
              <Message text="When are you available to train?" />
              <p className="text-iron-gray text-base -mt-4">Select your typical weekly schedule (optional)</p>

              <div className="bg-neutral-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                <ScheduleCalendarGrid
                  availabilitySlots={data.training_availability}
                  onChange={(slots) => updateData({ training_availability: slots })}
                />
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={goBack}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-iron-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => goNext()}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-iron-orange text-iron-white shadow-xl shadow-iron-orange/50 hover:shadow-2xl hover:shadow-iron-orange/60 transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Screen 7: Diet & Lifestyle */}
          {step === 'diet_lifestyle' && (
            <motion.div
              key="diet_lifestyle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-8"
            >
              <Message text="Let's talk about your nutrition habits" />

              <div className="space-y-8 bg-neutral-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                {/* Fitness Notes */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">
                    Tell us about your fitness journey <span className="text-iron-gray text-xs sm:text-sm">(optional)</span>
                  </label>
                  <textarea
                    name="fitness_notes"
                    value={data.fitness_notes}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.length <= 1000) {
                        updateData({ fitness_notes: value })
                      }
                    }}
                    placeholder="Share your fitness goals, injuries, limitations, or anything else that will help us personalize your experience..."
                    rows={6}
                    className="w-full px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-iron-white placeholder-iron-gray border-2 border-neutral-700 focus:border-iron-orange focus:outline-none focus:bg-neutral-800/80 transition-all resize-none"
                  />
                  <p className={`text-xs sm:text-sm mt-2 ${data.fitness_notes.length > 900 ? 'text-yellow-500' : 'text-iron-gray'}`}>
                    {1000 - data.fitness_notes.length} characters remaining
                  </p>
                </div>

                {/* Dietary Preference */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">Any dietary restrictions?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { label: t('onboarding.none'), value: 'none' },
                      { label: t('onboarding.vegetarian'), value: 'vegetarian' },
                      { label: t('onboarding.vegan'), value: 'vegan' },
                      { label: t('onboarding.pescatarian'), value: 'pescatarian' },
                      { label: t('onboarding.keto'), value: 'keto' },
                      { label: t('onboarding.paleo'), value: 'paleo' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData({ dietary_preference: option.value })}
                        className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                          data.dietary_preference === option.value
                            ? 'bg-iron-orange text-iron-white shadow-lg shadow-iron-orange/50'
                            : 'bg-neutral-900/50 text-iron-gray border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Food Allergies */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">
                    Food allergies? <span className="text-iron-gray text-xs sm:text-sm">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="food_allergy"
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && allergyInput.trim()) {
                          updateData({ food_allergies: [...data.food_allergies, allergyInput.trim()] })
                          setAllergyInput('')
                        }
                      }}
                      placeholder="e.g., Peanuts (press Enter to add)"
                      className="flex-1 px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-iron-white placeholder-iron-gray border-2 border-neutral-700 focus:border-iron-orange focus:outline-none focus:bg-neutral-800/80 transition-all"
                    />
                    {allergyInput.trim() && (
                      <button
                        onClick={() => {
                          updateData({ food_allergies: [...data.food_allergies, allergyInput.trim()] })
                          setAllergyInput('')
                        }}
                        className="px-6 py-4 rounded-xl bg-iron-orange text-iron-white font-medium hover:bg-iron-orange/90 transition-all"
                      >
                        Add
                      </button>
                    )}
                  </div>
                  {data.food_allergies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {data.food_allergies.map((allergy, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 rounded-lg bg-neutral-800 text-iron-gray flex items-center gap-2"
                        >
                          {allergy}
                          <button
                            onClick={() => {
                              updateData({
                                food_allergies: data.food_allergies.filter((_, i) => i !== idx)
                              })
                            }}
                            className="text-error hover:text-error/80"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Meals Per Day */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">Preferred meals per day?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { label: '2 meals', value: 2 },
                      { label: '3 meals', value: 3 },
                      { label: '4 meals', value: 4 },
                      { label: '5+ meals', value: 5 },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData({ meals_per_day: option.value })}
                        className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                          data.meals_per_day === option.value
                            ? 'bg-iron-orange text-iron-white shadow-lg shadow-iron-orange/50'
                            : 'bg-neutral-900/50 text-iron-gray border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stress Level */}
                <div>
                  <label className="block text-iron-gray text-base sm:text-lg mb-2 sm:mb-3">Typical stress level?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { label: t('onboarding.low'), value: 'low' },
                      { label: t('onboarding.medium'), value: 'medium' },
                      { label: t('onboarding.high'), value: 'high' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData({ stress_level: option.value })}
                        className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                          data.stress_level === option.value
                            ? 'bg-iron-orange text-iron-white shadow-lg shadow-iron-orange/50'
                            : 'bg-neutral-900/50 text-iron-gray border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={goBack}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-iron-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => goNext()}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-iron-orange text-iron-white shadow-xl shadow-iron-orange/50 hover:shadow-2xl hover:shadow-iron-orange/60 transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Screen 8: Meal Timing */}
          {step === 'meal_timing' && (
            <motion.div
              key="meal_timing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-8"
            >
              <Message text="When do you typically eat?" />
              <p className="text-iron-gray text-base -mt-4">This helps us plan meal timing (optional)</p>

              <div className="bg-neutral-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                <MealTimesSelector
                  mealTimes={data.meal_timing_preferences}
                  onChange={(mealTimes) => updateData({ meal_timing_preferences: mealTimes })}
                />
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={goBack}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-iron-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => goNext()}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-iron-orange text-iron-white shadow-xl shadow-iron-orange/50 hover:shadow-2xl hover:shadow-iron-orange/60 transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Screen 9: Typical Foods */}
          {step === 'typical_foods' && (
            <motion.div
              key="typical_foods"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-8"
            >
              <Message text="What do you typically eat?" />
              <p className="text-iron-gray text-base -mt-4">This helps us personalize meal plans (optional)</p>

              <div className="bg-neutral-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                <FoodSearchSelector
                  selectedFoods={data.typical_foods}
                  onChange={(foods) => updateData({ typical_foods: foods })}
                />
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={goBack}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-iron-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => goNext()}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-iron-orange text-iron-white shadow-xl shadow-iron-orange/50 hover:shadow-2xl hover:shadow-iron-orange/60 transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Screen 10: Upcoming Events */}
          {step === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-8"
            >
              <Message text="Any upcoming events or competitions?" />
              <p className="text-iron-gray text-base -mt-4">This helps us plan around important dates (optional)</p>

              <div className="bg-neutral-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                <EventsSelector
                  events={data.upcoming_events}
                  onChange={(events) => updateData({ upcoming_events: events })}
                />
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={goBack}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-iron-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => goNext()}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-iron-orange text-iron-white shadow-xl shadow-iron-orange/50 hover:shadow-2xl hover:shadow-iron-orange/60 transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Screen 11: Improvement Goals */}
          {step === 'improvement_goals' && (
            <motion.div
              key="improvement_goals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-8"
            >
              <Message text="What specific improvements do you want to make?" />
              <p className="text-iron-gray text-base -mt-4">Set trackable goals for your progress (optional)</p>

              <div className="bg-neutral-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                <GoalsBuilder
                  goals={data.improvement_goals}
                  onChange={(goals) => updateData({ improvement_goals: goals })}
                />
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={goBack}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-iron-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => goNext()}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-iron-orange text-iron-white shadow-xl shadow-iron-orange/50 hover:shadow-2xl hover:shadow-iron-orange/60 transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Screen 12: Difficulties & Constraints */}
          {step === 'difficulties_constraints' && (
            <motion.div
              key="difficulties_constraints"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-8"
            >
              <Message text="Finally, let's talk about challenges and boundaries" />
              <p className="text-iron-gray text-base -mt-4">This helps us create a realistic, sustainable plan (optional)</p>

              <div className="space-y-6">
                {/* Difficulties */}
                <div className="bg-neutral-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                  <h3 className="text-iron-white text-xl font-bold mb-4">Challenges You're Facing</h3>
                  <DifficultiesForm
                    difficulties={data.difficulties}
                    onChange={(difficulties) => updateData({ difficulties })}
                  />
                </div>

                {/* Constraints */}
                <div className="bg-neutral-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                  <h3 className="text-iron-white text-xl font-bold mb-4">Non-Negotiables</h3>
                  <ConstraintsForm
                    constraints={data.non_negotiables}
                    onChange={(constraints) => updateData({ non_negotiables: constraints })}
                  />
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={goBack}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-iron-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => {
                    next('calculating')
                    setTimeout(submit, 300)
                  }}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-iron-orange text-iron-white shadow-xl shadow-iron-orange/50 hover:shadow-2xl hover:shadow-iron-orange/60 transition-all"
                >
                  Complete Onboarding
                </button>
              </div>
            </motion.div>
          )}

          {/* Calculating */}
          {step === 'calculating' && (
            <motion.div
              key="calculating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <Message text="Creating your personalized profile..." />
              {loading && (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-iron-orange border-t-transparent rounded-full animate-spin shadow-lg shadow-iron-orange/50" />
                </div>
              )}
              {error && (
                <div className="p-6 rounded-xl bg-error/10 border-2 border-error text-error text-center">
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <Message text="✅ Profile created!" />
              <Message text="Taking you to your dashboard..." />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
