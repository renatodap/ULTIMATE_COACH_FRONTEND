'use client'

/**
 * Cinematic Onboarding Flow - Framer Motion
 * Proper exit→enter transitions, no glitching, staggered animations
 */

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'
import { completeOnboarding } from '@/lib/api/onboarding'
import {
  weightToKg,
  weightFromKg,
  heightToCm,
  heightFromCm,
  isValidHeight,
  getHeightConstraints,
  type UnitSystem,
} from '@/lib/utils/units'
import { detectBrowserLanguage, type SupportedLanguage } from '@/lib/utils/language'
import { Message } from '@/components/onboarding/Message'
import { ButtonGroup } from '@/components/onboarding/ButtonGroup'
import { Input } from '@/components/onboarding/Input'

type Step =
  | 'language'
  | 'goal'
  | 'experience'
  | 'frequency'
  | 'units'
  | 'birth_date'
  | 'sex'
  | 'height'
  | 'weight'
  | 'goal_weight'
  | 'activity'
  | 'diet'
  | 'meals'
  | 'sleep'
  | 'stress'
  | 'calculating'
  | 'complete'

export default function OnboardingPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [step, setStep] = useState<Step>('language')

  const [data, setData] = useState({
    language: 'en' as SupportedLanguage,
    primary_goal: '',
    experience_level: '',
    workout_frequency: 0,
    unit_system: 'imperial' as UnitSystem,
    birth_date: '',
    biological_sex: '',
    height_cm: 0,
    current_weight_kg: 0,
    goal_weight_kg: 0,
    activity_level: '',
    dietary_preference: 'none',
    food_allergies: [] as string[],
    meals_per_day: 3,
    sleep_hours: 7,
    stress_level: 'medium',
    cooks_regularly: true,
  })

  // Auto-detect browser language on mount
  useEffect(() => {
    const detectedLanguage = detectBrowserLanguage()
    setData(prev => ({ ...prev, language: detectedLanguage }))
  }, [])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Local input mirrors so the field shows exactly what user types
  // Height inputs: metric uses single cm field; imperial uses dual fields
  const [heightInput, setHeightInput] = useState('')
  const [heightFeetInput, setHeightFeetInput] = useState('')
  const [heightInchesInput, setHeightInchesInput] = useState('')
  const [currentWeightInput, setCurrentWeightInput] = useState('')
  const [goalWeightInput, setGoalWeightInput] = useState('')

  const next = useCallback((stepName: Step) => {
    setStep(stepName)
  }, [])

  const updateAndNext = useCallback((field: string, value: any, nextStep: Step) => {
    setData(prev => ({ ...prev, [field]: value }))
    setTimeout(() => next(nextStep), 200) // Faster exit animation transition
  }, [next])

  // Prefill inputs when entering steps based on stored metric values
  useEffect(() => {
    if (step === 'height') {
      if (data.height_cm) {
        if (data.unit_system === 'imperial') {
          const h = heightFromCm(data.height_cm, 'imperial') as { feet: number; inches: number }
          setHeightFeetInput(String(h.feet))
          setHeightInchesInput(String(h.inches))
          setHeightInput('')
        } else {
          setHeightInput(String(Math.round(data.height_cm)))
          setHeightFeetInput('')
          setHeightInchesInput('')
        }
      } else {
        setHeightInput('')
        setHeightFeetInput('')
        setHeightInchesInput('')
      }
    }
    if (step === 'weight') {
      if (data.current_weight_kg) {
        const display = weightFromKg(data.current_weight_kg, data.unit_system)
        setCurrentWeightInput(String(display))
      } else {
        setCurrentWeightInput('')
      }
    }
    if (step === 'goal_weight') {
      if (data.goal_weight_kg) {
        const display = weightFromKg(data.goal_weight_kg, data.unit_system)
        setGoalWeightInput(String(display))
      } else {
        setGoalWeightInput('')
      }
    }
  }, [step, data.height_cm, data.current_weight_kg, data.goal_weight_kg, data.unit_system])

  const submit = async () => {
    setLoading(true)
    setError('')

    try {
      // Validate birth_date or derive age if provided
      let derivedAge: number | null = null
      if ((data as any).birth_date) {
        const bd = new Date((data as any).birth_date)
        const today = new Date()
        derivedAge = Math.floor((today.getTime() - bd.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        if (derivedAge < 13 || derivedAge > 120) {
          throw new Error('Please enter a valid birth date (age must be between 13 and 120)')
        }
      }

      // Validate required fields
      if (!data.primary_goal || !data.experience_level || !data.biological_sex || !data.activity_level) {
        throw new Error('Please complete all required fields')
      }

      // Get timezone with fallback
      let timezone = 'America/New_York'
      try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
      } catch (e) {
        console.warn('Failed to detect timezone, using default:', e)
      }

      // Safety check: goal weight must be within 50% of current weight (backend rule)
      const weightDiff = Math.abs(data.goal_weight_kg - data.current_weight_kg)
      if (data.current_weight_kg > 0 && weightDiff > data.current_weight_kg * 0.5) {
        throw new Error('Goal weight must be within 50% of current weight')
      }

      const payload = {
        primary_goal: data.primary_goal as any,
        experience_level: data.experience_level as any,
        workout_frequency: data.workout_frequency,
        ...(((data as any).birth_date) ? { birth_date: (data as any).birth_date } : {}),
        biological_sex: data.biological_sex as any,
        height_cm: data.height_cm,
        current_weight_kg: data.current_weight_kg,
        goal_weight_kg: data.goal_weight_kg,
        activity_level: data.activity_level as any,
        dietary_preference: data.dietary_preference as any,
        food_allergies: data.food_allergies,
        foods_to_avoid: [], // Backend expects this field
        meals_per_day: data.meals_per_day,
        sleep_hours: data.sleep_hours,
        stress_level: data.stress_level as any,
        cooks_regularly: data.cooks_regularly,
        unit_system: data.unit_system,
        timezone: timezone,
      }

      console.log('[Onboarding] Submitting payload:', {
        ...payload,
        // Log a summary without sensitive data
        birth_date: payload.birth_date ? 'provided' : 'not provided',
        height_cm: payload.height_cm,
        current_weight_kg: payload.current_weight_kg,
      })

      await completeOnboarding(payload)

      next('complete')
      setTimeout(() => router.push('/profile'), 2000)
    } catch (err: any) {
      console.error('[Onboarding] Submit error:', err)

      // Handle authentication errors specifically
      if (err?.message?.includes('Session expired') ||
          err?.message?.includes('Authentication required') ||
          err?.message?.includes('bearer token') ||
          err?.status === 401) {
        setError('Your session has expired. Please log in again.')
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      // Try to surface meaningful backend error details
      const detail = err?.detail || err?.message || (typeof err === 'string' ? err : '')
      setError(detail || 'Failed to complete onboarding. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-black px-6 py-12 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {step === 'language' && (
            <div key="language">
              <Message
                text="Welcome to SHARPENED 🎯"
                isWelcome={true}
              />
              <Message text="First, let's choose your language." />
              <ButtonGroup
                options={[
                  { label: 'English', value: 'en' },
                  { label: 'Português 🇧🇷', value: 'pt' },
                  { label: 'Español (Coming Soon)', value: 'es' },
                ]}
                onSelect={(val) => {
                  // Allow English and Portuguese, block others
                  if (val !== 'en' && val !== 'pt') return
                  updateAndNext('language', val as SupportedLanguage, 'goal')
                }}
              />
            </div>
          )}

          {step === 'goal' && (
            <div key="goal">
              <Message text="What's your primary goal?" />
              <ButtonGroup
                options={[
                  { label: t('onboarding.loseWeight'), value: 'lose_weight' },
                  { label: t('onboarding.buildMuscle'), value: 'build_muscle' },
                  { label: t('onboarding.maintain'), value: 'maintain' },
                  { label: t('onboarding.improvePerformance'), value: 'improve_performance' },
                ]}
                onSelect={(val) => updateAndNext('primary_goal', val, 'experience')}
              />
            </div>
          )}

          {step === 'experience' && (
            <div key="experience">
              <Message text="What's your fitness experience level?" />
              <ButtonGroup
                options={[
                  { label: t('onboarding.beginner'), value: 'beginner', description: '< 1 year' },
                  { label: t('onboarding.intermediate'), value: 'intermediate', description: '1-3 years' },
                  { label: t('onboarding.advanced'), value: 'advanced', description: '3+ years' },
                ]}
                onSelect={(val) => updateAndNext('experience_level', val, 'frequency')}
              />
            </div>
          )}

          {step === 'frequency' && (
            <div key="frequency">
              <Message text="How often do you workout per week?" />
              <ButtonGroup
                options={[
                  { label: '0-1 times', value: '0' },
                  { label: '2-3 times', value: '2' },
                  { label: '4-5 times', value: '4' },
                  { label: '6-7 times', value: '6' },
                ]}
                onSelect={(val) => updateAndNext('workout_frequency', parseInt(val), 'units')}
              />
            </div>
          )}

          {step === 'units' && (
            <div key="units">
              <Message text="Preferred unit system?" />
              <ButtonGroup
                options={[
                  { label: t('onboarding.imperial'), value: 'imperial', description: 'lbs, ft/in' },
                  { label: t('onboarding.metric'), value: 'metric', description: 'kg, cm' },
                ]}
                onSelect={(val) => updateAndNext('unit_system', val, 'birth_date')}
              />
            </div>
          )}

          {step === 'birth_date' && (
            <div key="birth_date">
              <Message text="What's your birth date?" />
              <Input
                type="date"
                placeholder="YYYY-MM-DD"
                value={(data as any).birth_date}
                onChange={(val) => setData(prev => ({ ...prev, birth_date: val }))}
                onSubmit={() => {
                  const bdStr = (data as any).birth_date as string
                  if (bdStr) {
                    const bd = new Date(bdStr)
                    const today = new Date()
                    const ageYears = Math.floor((today.getTime() - bd.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                    if (ageYears >= 13 && ageYears <= 120) {
                      next('sex')
                    }
                  }
                }}
              />
            </div>
          )}

          {step === 'sex' && (
            <div key="sex">
              <Message text="Biological sex? (Used for accurate calorie calculations)" />
              <ButtonGroup
                options={[
                  { label: t('onboarding.male'), value: 'male' },
                  { label: t('onboarding.female'), value: 'female' },
                ]}
                onSelect={(val) => updateAndNext('biological_sex', val, 'height')}
              />
            </div>
          )}

          {step === 'height' && (
            <div key="height">
              <Message text={`Height in ${data.unit_system === 'imperial' ? 'feet and inches' : 'cm'}?`} />
              {data.unit_system === 'imperial' ? (
                <div className="mb-12">
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
                          setData(prev => ({ ...prev, height_cm: cm }))
                        }}
                        placeholder="e.g., 5"
                        className="w-full px-6 py-6 rounded-xl text-xl bg-neutral-900/50 text-neutral-white placeholder-neutral-500 border-2 border-neutral-700 focus:border-primary focus:outline-none focus:bg-neutral-800/80 transition-all"
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
                          setData(prev => ({ ...prev, height_cm: cm }))
                        }}
                        placeholder="e.g., 10"
                        className="w-full px-6 py-6 rounded-xl text-xl bg-neutral-900/50 text-neutral-white placeholder-neutral-500 border-2 border-neutral-700 focus:border-primary focus:outline-none focus:bg-neutral-800/80 transition-all"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 text-base font-medium">in</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      disabled={!isValidHeight({ feet: parseInt(heightFeetInput || '0', 10), inches: parseInt(heightInchesInput || '0', 10) }, 'imperial')}
                      onClick={() => next('weight')}
                      className="w-full px-6 py-6 rounded-xl text-xl font-bold bg-primary text-neutral-white shadow-xl shadow-primary/50 hover:shadow-2xl hover:shadow-primary/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : (
                <Input
                  type="number"
                  placeholder={'e.g., 178'}
                  value={heightInput}
                  onChange={(val) => {
                    setHeightInput(val)
                    const num = parseFloat(val)
                    if (!isNaN(num)) {
                      const cm = num
                      setData(prev => ({ ...prev, height_cm: cm }))
                    }
                  }}
                  onSubmit={() => {
                    if (data.height_cm >= 100 && data.height_cm <= 300) {
                      next('weight')
                    }
                  }}
                  unit="cm"
                />
              )}
            </div>
          )}

          {step === 'weight' && (
            <div key="weight">
              <Message text={`Current weight in ${data.unit_system === 'imperial' ? 'lbs' : 'kg'}?`} />
              <Input
                type="number"
                placeholder={data.unit_system === 'imperial' ? 'e.g., 180' : 'e.g., 82'}
                value={currentWeightInput}
                onChange={(val) => {
                  setCurrentWeightInput(val)
                  const num = parseFloat(val)
                  if (!isNaN(num)) {
                    const kg = weightToKg(num, data.unit_system)
                    setData(prev => ({ ...prev, current_weight_kg: kg }))
                  }
                }}
                onSubmit={() => {
                  if (data.current_weight_kg >= 30 && data.current_weight_kg <= 300) {
                    next('goal_weight')
                  }
                }}
                unit={data.unit_system === 'imperial' ? 'lbs' : 'kg'}
                step={0.1}
              />
            </div>
          )}

          {step === 'goal_weight' && (
            <div key="goal_weight">
              <Message text={`Goal weight in ${data.unit_system === 'imperial' ? 'lbs' : 'kg'}?`} />
              <Input
                type="number"
                placeholder={data.unit_system === 'imperial' ? 'e.g., 170' : 'e.g., 77'}
                value={goalWeightInput}
                onChange={(val) => {
                  setGoalWeightInput(val)
                  const num = parseFloat(val)
                  if (!isNaN(num)) {
                    const kg = weightToKg(num, data.unit_system)
                    setData(prev => ({ ...prev, goal_weight_kg: kg }))
                  }
                }}
                onSubmit={() => {
                  if (data.goal_weight_kg >= 30 && data.goal_weight_kg <= 300) {
                    next('activity')
                  }
                }}
                unit={data.unit_system === 'imperial' ? 'lbs' : 'kg'}
                step={0.1}
              />
            </div>
          )}

          {step === 'activity' && (
            <div key="activity">
              <Message text="How active are you on a typical day?" />
              <ButtonGroup
                options={[
                  { label: t('onboarding.sedentary'), value: 'sedentary', description: t('onboarding.sedentaryDesc') },
                  { label: t('onboarding.lightlyActive'), value: 'lightly_active', description: t('onboarding.lightlyActiveDesc') },
                  { label: t('onboarding.moderatelyActive'), value: 'moderately_active', description: t('onboarding.moderatelyActiveDesc') },
                  { label: t('onboarding.veryActive'), value: 'very_active', description: t('onboarding.veryActiveDesc') },
                  { label: t('onboarding.extremelyActive'), value: 'extremely_active', description: t('onboarding.extremelyActiveDesc') },
                ]}
                onSelect={(val) => updateAndNext('activity_level', val, 'diet')}
              />
            </div>
          )}

          {step === 'diet' && (
            <div key="diet">
              <Message text="Any dietary preferences?" />
              <ButtonGroup
                options={[
                  { label: t('onboarding.none'), value: 'none' },
                  { label: t('onboarding.vegetarian'), value: 'vegetarian' },
                  { label: t('onboarding.vegan'), value: 'vegan' },
                  { label: t('onboarding.pescatarian'), value: 'pescatarian' },
                  { label: t('onboarding.keto'), value: 'keto' },
                  { label: t('onboarding.paleo'), value: 'paleo' },
                ]}
                onSelect={(val) => updateAndNext('dietary_preference', val, 'meals')}
              />
            </div>
          )}

          {step === 'meals' && (
            <div key="meals">
              <Message text="How many meals do you prefer per day?" />
              <ButtonGroup
                options={[
                  { label: '2 meals', value: '2' },
                  { label: '3 meals', value: '3' },
                  { label: '4-5 meals', value: '4' },
                  { label: '6+ meals', value: '6' },
                ]}
                onSelect={(val) => updateAndNext('meals_per_day', parseInt(val), 'sleep')}
              />
            </div>
          )}

          {step === 'sleep' && (
            <div key="sleep">
              <Message text="Average hours of sleep per night?" />
              <ButtonGroup
                options={[
                  { label: '< 6 hours', value: '5' },
                  { label: '6-7 hours', value: '6.5' },
                  { label: '7-8 hours', value: '7.5' },
                  { label: '8+ hours', value: '8.5' },
                ]}
                onSelect={(val) => updateAndNext('sleep_hours', parseFloat(val), 'stress')}
              />
            </div>
          )}

          {step === 'stress' && (
            <div key="stress">
              <Message text="Typical stress level?" />
              <ButtonGroup
                options={[
                  { label: t('onboarding.low'), value: 'low' },
                  { label: t('onboarding.medium'), value: 'medium' },
                  { label: t('onboarding.high'), value: 'high' },
                ]}
                onSelect={(val) => {
                  setData(prev => ({ ...prev, stress_level: val }))
                  setTimeout(() => {
                    next('calculating')
                    setTimeout(submit, 300)
                  }, 600)
                }}
              />
            </div>
          )}

          {step === 'calculating' && (
            <div key="calculating">
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
            </div>
          )}

          {step === 'complete' && (
            <div key="complete">
              <Message text="✅ All set!" />
              <Message text="Welcome to SHARPENED. Redirecting to your dashboard..." />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
