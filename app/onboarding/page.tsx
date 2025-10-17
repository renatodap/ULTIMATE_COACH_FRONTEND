'use client'

/**
 * Streamlined Onboarding Flow - 4 Screens
 * Groups related questions for faster completion
 */

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'
import { completeOnboarding, getTrainingModalities, type TrainingModality, type TrainingModalitySelection } from '@/lib/api/onboarding'
import { getCurrentUser } from '@/lib/api/users'
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

type Step =
  | 'language'
  | 'physical_stats'       // Screen 1: age, sex, height, weight, goal_weight
  | 'goals_experience'     // Screen 2: primary + secondary goal, experience, frequency, activity, sleep
  | 'training_modalities'  // Screen 3: training modalities selection (NEW)
  | 'diet_lifestyle'       // Screen 4: fitness notes, diet, allergies, meals, stress
  | 'calculating'
  | 'complete'

export default function OnboardingPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [step, setStep] = useState<Step>('language')

  const [data, setData] = useState({
    language: 'en' as SupportedLanguage,
    // Physical Stats (Screen 1)
    birth_date: '',
    biological_sex: '',
    height_cm: 0,
    current_weight_kg: 0,
    goal_weight_kg: 0,
    // Goals & Experience (Screen 2)
    primary_goal: '',
    secondary_goal: '' as '' | 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_performance',
    experience_level: '',
    workout_frequency: 0,
    activity_level: '',
    sleep_hours: 7,
    // Training Modalities (Screen 3)
    training_modalities: [] as TrainingModalitySelection[],
    // Diet & Lifestyle (Screen 4)
    fitness_notes: '',
    dietary_preference: 'none',
    food_allergies: [] as string[],
    meals_per_day: 3,
    stress_level: 'medium',
    cooks_regularly: true,
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
        console.error('[Onboarding] Failed to fetch training modalities:', error)
        // Continue without modalities - not critical
      }
    }
    fetchModalities()
  }, [])

  // Auto-detect browser language + timezone on mount
  useEffect(() => {
    const detectedLanguage = detectBrowserLanguage()
    setData(prev => ({ ...prev, language: detectedLanguage }))
  }, [])

  // Check if user already completed onboarding - redirect if yes
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const user = await getCurrentUser()

        // If onboarding already completed, redirect to dashboard
        if (user.onboarding_completed) {
          console.log('[Onboarding] User already completed onboarding, redirecting to dashboard')
          router.push('/dashboard')
          return
        }

        // User hasn't completed onboarding yet - allow access
        setCheckingOnboarding(false)
      } catch (error: any) {
        // If 401 (not authenticated), redirect to login
        if (error?.status === 401 || error?.message?.includes('401')) {
          console.log('[Onboarding] User not authenticated, redirecting to login')
          router.push('/login')
          return
        }

        // For other errors, allow access (better UX than blocking)
        console.error('[Onboarding] Error checking status:', error)
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

  // Validation functions
  const validatePhysicalStats = (): boolean => {
    const errors: {[key: string]: string} = {}

    if (!data.birth_date) {
      errors.birth_date = 'Birth date is required'
    } else {
      const bd = new Date(data.birth_date)
      const today = new Date()
      const age = Math.floor((today.getTime() - bd.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      if (age < 13 || age > 120) {
        errors.birth_date = 'Age must be between 13 and 120'
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

    // Goal weight must be within 50% of current weight
    if (data.current_weight_kg && data.goal_weight_kg) {
      const weightDiff = Math.abs(data.goal_weight_kg - data.current_weight_kg)
      if (weightDiff > data.current_weight_kg * 0.5) {
        errors.goal_weight = 'Goal weight must be within 50% of current weight'
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
        console.warn('Failed to detect timezone, using default:', e)
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
      }

      console.log('[Onboarding] Submitting payload')
      await completeOnboarding(payload)

      next('complete')
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: any) {
      console.error('[Onboarding] Submit error:', err)

      if (err?.message?.includes('Session expired') ||
          err?.message?.includes('Authentication required') ||
          err?.status === 401) {
        setError('Your session has expired. Please log in again.')
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      const detail = err?.detail || err?.message || (typeof err === 'string' ? err : '')
      setError(detail || 'Failed to complete onboarding. Please try again.')
      setLoading(false)
    }
  }

  // Show loading state while checking onboarding status
  if (checkingOnboarding) {
    return (
      <div className="min-h-screen bg-neutral-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-lg shadow-primary/50" />
          <p className="text-neutral-300 text-lg">Checking your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-black px-4 sm:px-6 md:px-8 py-8 sm:py-12 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {/* Language Selection */}
          {step === 'language' && (
            <motion.div
              key="language"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
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

          {/* Screen 1: Physical Stats */}
          {step === 'physical_stats' && (
            <motion.div
              key="physical_stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <Message text="Let's start with your physical stats" />

              <div className="space-y-6 bg-neutral-900/30 rounded-2xl p-8 border border-neutral-800">
                {/* Birth Date */}
                <div>
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">Birth Date</label>
                  <input
                    type="date"
                    value={data.birth_date}
                    onChange={(e) => updateData({ birth_date: e.target.value })}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-base sm:text-lg bg-neutral-900/50 text-neutral-white border-2 border-neutral-700 focus:border-primary focus:outline-none focus:bg-neutral-800/80 transition-all"
                  />
                  {validationErrors.birth_date && (
                    <p className="text-error text-sm mt-2">{validationErrors.birth_date}</p>
                  )}
                </div>

                {/* Biological Sex */}
                <div>
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">
                    Biological Sex <span className="text-neutral-500 text-xs sm:text-sm">(for accurate calorie calculation)</span>
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
                            ? 'bg-primary text-neutral-white shadow-lg shadow-primary/50'
                            : 'bg-neutral-900/50 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
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
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">Preferred Units</label>
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
                            ? 'bg-primary text-neutral-white shadow-lg shadow-primary/50'
                            : 'bg-neutral-900/50 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
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
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">
                    Height {data.unit_system === 'imperial' ? '(feet and inches)' : '(cm)'}
                  </label>
                  {data.unit_system === 'imperial' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="number"
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
                          className="w-full px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-neutral-white placeholder-neutral-500 border-2 border-neutral-700 focus:border-primary focus:outline-none focus:bg-neutral-800/80 transition-all"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-base font-medium">ft</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
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
                          className="w-full px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-neutral-white placeholder-neutral-500 border-2 border-neutral-700 focus:border-primary focus:outline-none focus:bg-neutral-800/80 transition-all"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-base font-medium">in</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        value={heightInput}
                        onChange={(e) => {
                          const val = e.target.value
                          setHeightInput(val)
                          const num = parseFloat(val)
                          if (!isNaN(num)) updateData({ height_cm: num })
                        }}
                        placeholder="e.g., 178"
                        className="w-full px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-neutral-white placeholder-neutral-500 border-2 border-neutral-700 focus:border-primary focus:outline-none focus:bg-neutral-800/80 transition-all"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-base font-medium">cm</span>
                    </div>
                  )}
                  {validationErrors.height && (
                    <p className="text-error text-sm mt-2">{validationErrors.height}</p>
                  )}
                </div>

                {/* Current Weight */}
                <div>
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">
                    Current Weight {data.unit_system === 'imperial' ? '(lbs)' : '(kg)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
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
                      className="w-full px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-neutral-white placeholder-neutral-500 border-2 border-neutral-700 focus:border-primary focus:outline-none focus:bg-neutral-800/80 transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-base font-medium">
                      {data.unit_system === 'imperial' ? 'lbs' : 'kg'}
                    </span>
                  </div>
                  {validationErrors.current_weight && (
                    <p className="text-error text-sm mt-2">{validationErrors.current_weight}</p>
                  )}
                </div>

                {/* Goal Weight */}
                <div>
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">
                    Goal Weight {data.unit_system === 'imperial' ? '(lbs)' : '(kg)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
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
                      className="w-full px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-neutral-white placeholder-neutral-500 border-2 border-neutral-700 focus:border-primary focus:outline-none focus:bg-neutral-800/80 transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-base font-medium">
                      {data.unit_system === 'imperial' ? 'lbs' : 'kg'}
                    </span>
                  </div>
                  {validationErrors.goal_weight && (
                    <p className="text-error text-sm mt-2">{validationErrors.goal_weight}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (validatePhysicalStats()) {
                    next('goals_experience')
                  }
                }}
                className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-primary text-neutral-white shadow-xl shadow-primary/50 hover:shadow-2xl hover:shadow-primary/60 transition-all"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* Screen 2: Goals & Experience */}
          {step === 'goals_experience' && (
            <motion.div
              key="goals_experience"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <Message text="Tell us about your goals and lifestyle" />

              <div className="space-y-8 bg-neutral-900/30 rounded-2xl p-8 border border-neutral-800">
                {/* Primary Goal */}
                <div>
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">What&apos;s your primary goal?</label>
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
                            ? 'bg-primary text-neutral-white shadow-lg shadow-primary/50'
                            : 'bg-neutral-900/50 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
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
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">
                    Secondary goal? <span className="text-neutral-500 text-xs sm:text-sm">(optional)</span>
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
                            ? 'bg-primary text-neutral-white shadow-lg shadow-primary/50'
                            : 'bg-neutral-900/50 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">Fitness experience level?</label>
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
                            ? 'bg-primary text-neutral-white shadow-lg shadow-primary/50'
                            : 'bg-neutral-900/50 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
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
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">How often can you train per week?</label>
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
                            ? 'bg-primary text-neutral-white shadow-lg shadow-primary/50'
                            : 'bg-neutral-900/50 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">Daily activity level (outside workouts)?</label>
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
                            ? 'bg-primary text-neutral-white shadow-lg shadow-primary/50'
                            : 'bg-neutral-900/50 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
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
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">Average nightly sleep?</label>
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
                            ? 'bg-primary text-neutral-white shadow-lg shadow-primary/50'
                            : 'bg-neutral-900/50 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
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
                  onClick={() => next('physical_stats')}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-neutral-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (validateGoalsExperience()) {
                      next('training_modalities')
                    }
                  }}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-primary text-neutral-white shadow-xl shadow-primary/50 hover:shadow-2xl hover:shadow-primary/60 transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Screen 3: Training Modalities (NEW) */}
          {step === 'training_modalities' && (
            <motion.div
              key="training_modalities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <Message text="What do you train?" />
              <p className="text-neutral-400 text-base -mt-4">Select all that apply</p>

              <div className="space-y-6 bg-neutral-900/30 rounded-2xl p-6 sm:p-8 border border-neutral-800">
                {/* Training Modalities Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {availableModalities.filter(m => m.name !== 'Other').map((modality) => {
                    const isSelected = data.training_modalities.some(tm => tm.modality_id === modality.id)
                    const selectedModality = data.training_modalities.find(tm => tm.modality_id === modality.id)

                    return (
                      <button
                        key={modality.id}
                        onClick={() => {
                          if (isSelected) {
                            // Deselect
                            updateData({
                              training_modalities: data.training_modalities.filter(tm => tm.modality_id !== modality.id)
                            })
                          } else {
                            // Select with default proficiency
                            updateData({
                              training_modalities: [...data.training_modalities, {
                                modality_id: modality.id,
                                proficiency_level: 'beginner',
                                is_primary: data.training_modalities.length === 0 // First one is primary by default
                              }]
                            })
                          }
                        }}
                        className={`min-h-[88px] px-4 py-3 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-primary/10 text-neutral-white border-2 border-primary shadow-lg shadow-primary/30'
                            : 'bg-neutral-900/50 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{modality.icon}</span>
                          <span className="text-base sm:text-lg font-medium">{modality.name}</span>
                        </div>
                        {isSelected && selectedModality && (
                          <select
                            value={selectedModality.proficiency_level}
                            onChange={(e) => {
                              e.stopPropagation()
                              updateData({
                                training_modalities: data.training_modalities.map(tm =>
                                  tm.modality_id === modality.id
                                    ? { ...tm, proficiency_level: e.target.value as any }
                                    : tm
                                )
                              })
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full mt-2 px-2 py-1 rounded-lg text-sm bg-neutral-800 text-neutral-white border border-neutral-700 focus:border-primary focus:outline-none"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Selected Modalities Summary */}
                {data.training_modalities.length > 0 && (
                  <div className="pt-4 border-t border-neutral-700">
                    <p className="text-neutral-400 text-sm mb-3">
                      {data.training_modalities.length} selected
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.training_modalities.map((tm) => {
                        const modality = availableModalities.find(m => m.id === tm.modality_id)
                        return (
                          <div
                            key={tm.modality_id}
                            className="px-3 py-1.5 rounded-lg bg-primary/20 text-neutral-white text-sm flex items-center gap-2"
                          >
                            {modality?.icon} {modality?.name}
                            {tm.is_primary && <span className="text-yellow-400">★</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={() => next('goals_experience')}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-neutral-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => next('diet_lifestyle')}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-primary text-neutral-white shadow-xl shadow-primary/50 hover:shadow-2xl hover:shadow-primary/60 transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Screen 3: Diet & Lifestyle */}
          {step === 'diet_lifestyle' && (
            <motion.div
              key="diet_lifestyle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <Message text="Final step - diet and lifestyle preferences" />

              <div className="space-y-8 bg-neutral-900/30 rounded-2xl p-8 border border-neutral-800">
                {/* Fitness Notes */}
                <div>
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">
                    Any fitness considerations? <span className="text-neutral-500 text-xs sm:text-sm">(optional)</span>
                  </label>
                  <textarea
                    value={data.fitness_notes}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.length <= 1000) {
                        updateData({ fitness_notes: value })
                      }
                    }}
                    placeholder="Any injuries, preferences, or fitness considerations we should know about?"
                    rows={4}
                    className="w-full px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-neutral-white placeholder-neutral-500 border-2 border-neutral-700 focus:border-primary focus:outline-none focus:bg-neutral-800/80 transition-all resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-neutral-500 text-xs sm:text-sm">
                      Share any relevant context that might help us personalize your experience
                    </p>
                    <p className={`text-xs sm:text-sm ${data.fitness_notes.length > 900 ? 'text-yellow-500' : 'text-neutral-500'}`}>
                      {1000 - data.fitness_notes.length} characters remaining
                    </p>
                  </div>
                </div>

                {/* Dietary Preference */}
                <div>
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">Any dietary restrictions?</label>
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
                            ? 'bg-primary text-neutral-white shadow-lg shadow-primary/50'
                            : 'bg-neutral-900/50 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Food Allergies */}
                <div>
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">
                    Food allergies? <span className="text-neutral-500 text-xs sm:text-sm">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && allergyInput.trim()) {
                          updateData({ food_allergies: [...data.food_allergies, allergyInput.trim()] })
                          setAllergyInput('')
                        }
                      }}
                      placeholder="e.g., Peanuts (press Enter to add)"
                      className="flex-1 px-6 py-4 rounded-xl text-lg bg-neutral-900/50 text-neutral-white placeholder-neutral-500 border-2 border-neutral-700 focus:border-primary focus:outline-none focus:bg-neutral-800/80 transition-all"
                    />
                    {allergyInput.trim() && (
                      <button
                        onClick={() => {
                          updateData({ food_allergies: [...data.food_allergies, allergyInput.trim()] })
                          setAllergyInput('')
                        }}
                        className="px-6 py-4 rounded-xl bg-primary text-neutral-white font-medium hover:bg-primary/90 transition-all"
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
                          className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 flex items-center gap-2"
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
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">Preferred meals per day?</label>
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
                            ? 'bg-primary text-neutral-white shadow-lg shadow-primary/50'
                            : 'bg-neutral-900/50 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stress Level */}
                <div>
                  <label className="block text-neutral-300 text-base sm:text-lg mb-2 sm:mb-3">Typical stress level?</label>
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
                            ? 'bg-primary text-neutral-white shadow-lg shadow-primary/50'
                            : 'bg-neutral-900/50 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
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
                  onClick={() => next('training_modalities')}
                  className="px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-neutral-800 text-neutral-white border-2 border-neutral-700 hover:bg-neutral-700 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    next('calculating')
                    setTimeout(submit, 300)
                  }}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-lg sm:text-xl font-bold bg-primary text-neutral-white shadow-xl shadow-primary/50 hover:shadow-2xl hover:shadow-primary/60 transition-all"
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
            >
              <Message text="Calculating your personalized targets..." />
              {loading && (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/50" />
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
