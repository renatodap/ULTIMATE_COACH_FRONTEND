'use client'

/**
 * Cinematic Onboarding Flow
 *
 * Conversation-style onboarding that feels like a movie dialogue
 * Messages appear sequentially with slight offsets, buttons slide in
 * All data collected through natural conversation flow
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n'
import { completeOnboarding } from '@/lib/api/onboarding'
import { weightToKg, heightToCm, type UnitSystem } from '@/lib/utils/units'
import { Message } from '@/components/onboarding/Message'
import { ButtonGroup } from '@/components/onboarding/ButtonGroup'
import { Input } from '@/components/onboarding/Input'

type Step =
  | 'language'
  | 'goal'
  | 'experience'
  | 'frequency'
  | 'units'
  | 'age'
  | 'sex'
  | 'height'
  | 'weight'
  | 'goal_weight'
  | 'activity'
  | 'diet'
  | 'allergies'
  | 'meals'
  | 'sleep'
  | 'stress'
  | 'calculating'
  | 'complete'

export default function OnboardingPage() {
  const { t } = useTranslation()
  const router = useRouter()

  // Current step
  const [step, setStep] = useState<Step>('language')
  const [messageIndex, setMessageIndex] = useState(0)

  // Form data
  const [data, setData] = useState({
    primary_goal: '',
    experience_level: '',
    workout_frequency: 0,
    unit_system: 'imperial' as UnitSystem,
    age: '',
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

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Advance to next step
  const next = useCallback((stepName: Step) => {
    setStep(stepName)
    setMessageIndex(0)
  }, [])

  // Update data and advance
  const updateAndNext = useCallback((field: string, value: any, nextStep: Step) => {
    setData(prev => ({ ...prev, [field]: value }))
    setTimeout(() => next(nextStep), 300)
  }, [next])

  // Submit onboarding
  const submit = async () => {
    setLoading(true)
    setError('')

    try {
      await completeOnboarding({
        primary_goal: data.primary_goal as any,
        experience_level: data.experience_level as any,
        workout_frequency: data.workout_frequency,
        age: parseInt(data.age),
        biological_sex: data.biological_sex as any,
        height_cm: data.height_cm,
        current_weight_kg: data.current_weight_kg,
        goal_weight_kg: data.goal_weight_kg,
        activity_level: data.activity_level as any,
        dietary_preference: data.dietary_preference as any,
        food_allergies: data.food_allergies,
        meals_per_day: data.meals_per_day,
        sleep_hours: data.sleep_hours,
        stress_level: data.stress_level as any,
        cooks_regularly: data.cooks_regularly,
        unit_system: data.unit_system,
      })

      next('complete')
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-black px-4 py-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="mb-8 flex justify-center">
          <div className="text-sm text-neutral-500">
            {step !== 'language' && step !== 'complete' && (
              <span>Setting up your profile...</span>
            )}
          </div>
        </div>

        {/* Conversation flow */}
        <div className="space-y-2">
          {/* LANGUAGE SELECT */}
          {step === 'language' && (
            <>
              <Message
                text="Welcome to SHARPENED 🎯"
                delay={0}
                onComplete={() => setMessageIndex(1)}
              />
              {messageIndex >= 1 && (
                <>
                  <Message text="First, let's choose your language." delay={400} offset={20} onComplete={() => setMessageIndex(2)} />
                  {messageIndex >= 2 && (
                    <ButtonGroup
                      delay={800}
                      options={[
                        { label: 'English', value: 'en' },
                        { label: 'Español (Coming Soon)', value: 'es' },
                        { label: 'Português (Coming Soon)', value: 'pt' },
                      ]}
                      onSelect={(val) => {
                        if (val !== 'en') return
                        updateAndNext('language', val, 'goal')
                      }}
                      selected={step !== 'language' ? 'en' : undefined}
                    />
                  )}
                </>
              )}
            </>
          )}

          {/* GOAL */}
          {step === 'goal' && (
            <>
              <Message text="What's your primary goal?" delay={0} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <ButtonGroup
                  delay={400}
                  options={[
                    { label: t('onboarding.loseWeight'), value: 'lose_weight' },
                    { label: t('onboarding.buildMuscle'), value: 'build_muscle' },
                    { label: t('onboarding.maintain'), value: 'maintain' },
                    { label: t('onboarding.improvePerformance'), value: 'improve_performance' },
                  ]}
                  onSelect={(val) => updateAndNext('primary_goal', val, 'experience')}
                />
              )}
            </>
          )}

          {/* EXPERIENCE */}
          {step === 'experience' && (
            <>
              <Message text="What's your fitness experience level?" delay={0} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <ButtonGroup
                  delay={400}
                  options={[
                    { label: t('onboarding.beginner'), value: 'beginner', description: '< 1 year' },
                    { label: t('onboarding.intermediate'), value: 'intermediate', description: '1-3 years' },
                    { label: t('onboarding.advanced'), value: 'advanced', description: '3+ years' },
                  ]}
                  onSelect={(val) => updateAndNext('experience_level', val, 'frequency')}
                />
              )}
            </>
          )}

          {/* WORKOUT FREQUENCY */}
          {step === 'frequency' && (
            <>
              <Message text="How often do you workout per week?" delay={0} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <ButtonGroup
                  delay={400}
                  options={[
                    { label: '0-1 times', value: '0' },
                    { label: '2-3 times', value: '2' },
                    { label: '4-5 times', value: '4' },
                    { label: '6-7 times', value: '6' },
                  ]}
                  onSelect={(val) => updateAndNext('workout_frequency', parseInt(val), 'units')}
                />
              )}
            </>
          )}

          {/* UNIT SYSTEM */}
          {step === 'units' && (
            <>
              <Message text="Preferred unit system?" delay={0} offset={10} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <ButtonGroup
                  delay={400}
                  options={[
                    { label: t('onboarding.imperial'), value: 'imperial', description: 'lbs, ft/in' },
                    { label: t('onboarding.metric'), value: 'metric', description: 'kg, cm' },
                  ]}
                  onSelect={(val) => updateAndNext('unit_system', val, 'age')}
                />
              )}
            </>
          )}

          {/* AGE */}
          {step === 'age' && (
            <>
              <Message text="How old are you?" delay={0} offset={15} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <Input
                  type="number"
                  delay={400}
                  placeholder="Age"
                  value={data.age}
                  onChange={(val) => setData(prev => ({ ...prev, age: val }))}
                  onSubmit={() => {
                    if (parseInt(data.age) >= 13 && parseInt(data.age) <= 120) {
                      next('sex')
                    }
                  }}
                  min={13}
                  max={120}
                  unit="years"
                />
              )}
            </>
          )}

          {/* SEX */}
          {step === 'sex' && (
            <>
              <Message text="Biological sex? (Used for accurate calorie calculations)" delay={0} offset={8} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <ButtonGroup
                  delay={400}
                  options={[
                    { label: t('onboarding.male'), value: 'male' },
                    { label: t('onboarding.female'), value: 'female' },
                  ]}
                  onSelect={(val) => updateAndNext('biological_sex', val, 'height')}
                />
              )}
            </>
          )}

          {/* HEIGHT */}
          {step === 'height' && (
            <>
              <Message
                text={`Height in ${data.unit_system === 'imperial' ? 'inches' : 'cm'}?`}
                delay={0}
                offset={12}
                onComplete={() => setMessageIndex(1)}
              />
              {messageIndex >= 1 && (
                <Input
                  type="number"
                  delay={400}
                  placeholder={data.unit_system === 'imperial' ? 'e.g., 70' : 'e.g., 178'}
                  value={data.height_cm ? data.height_cm.toString() : ''}
                  onChange={(val) => {
                    const num = parseFloat(val)
                    if (!isNaN(num)) {
                      // Convert to cm if imperial
                      const cm = data.unit_system === 'imperial' ? num * 2.54 : num
                      setData(prev => ({ ...prev, height_cm: cm }))
                    }
                  }}
                  onSubmit={() => {
                    if (data.height_cm >= 100 && data.height_cm <= 300) {
                      next('weight')
                    }
                  }}
                  unit={data.unit_system === 'imperial' ? 'inches' : 'cm'}
                />
              )}
            </>
          )}

          {/* CURRENT WEIGHT */}
          {step === 'weight' && (
            <>
              <Message
                text={`Current weight in ${data.unit_system === 'imperial' ? 'lbs' : 'kg'}?`}
                delay={0}
                offset={18}
                onComplete={() => setMessageIndex(1)}
              />
              {messageIndex >= 1 && (
                <Input
                  type="number"
                  delay={400}
                  placeholder={data.unit_system === 'imperial' ? 'e.g., 180' : 'e.g., 82'}
                  value={data.current_weight_kg ? (data.unit_system === 'imperial' ? Math.round(data.current_weight_kg * 2.20462) : data.current_weight_kg).toString() : ''}
                  onChange={(val) => {
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
              )}
            </>
          )}

          {/* GOAL WEIGHT */}
          {step === 'goal_weight' && (
            <>
              <Message
                text={`Goal weight in ${data.unit_system === 'imperial' ? 'lbs' : 'kg'}?`}
                delay={0}
                offset={22}
                onComplete={() => setMessageIndex(1)}
              />
              {messageIndex >= 1 && (
                <Input
                  type="number"
                  delay={400}
                  placeholder={data.unit_system === 'imperial' ? 'e.g., 170' : 'e.g., 77'}
                  value={data.goal_weight_kg ? (data.unit_system === 'imperial' ? Math.round(data.goal_weight_kg * 2.20462) : data.goal_weight_kg).toString() : ''}
                  onChange={(val) => {
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
              )}
            </>
          )}

          {/* ACTIVITY LEVEL */}
          {step === 'activity' && (
            <>
              <Message text="How active are you on a typical day?" delay={0} offset={5} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <ButtonGroup
                  delay={400}
                  options={[
                    { label: t('onboarding.sedentary'), value: 'sedentary', description: t('onboarding.sedentaryDesc') },
                    { label: t('onboarding.lightlyActive'), value: 'lightly_active', description: t('onboarding.lightlyActiveDesc') },
                    { label: t('onboarding.moderatelyActive'), value: 'moderately_active', description: t('onboarding.moderatelyActiveDesc') },
                    { label: t('onboarding.veryActive'), value: 'very_active', description: t('onboarding.veryActiveDesc') },
                    { label: t('onboarding.extremelyActive'), value: 'extremely_active', description: t('onboarding.extremelyActiveDesc') },
                  ]}
                  onSelect={(val) => updateAndNext('activity_level', val, 'diet')}
                />
              )}
            </>
          )}

          {/* DIETARY PREFERENCE */}
          {step === 'diet' && (
            <>
              <Message text="Any dietary preferences?" delay={0} offset={14} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <ButtonGroup
                  delay={400}
                  options={[
                    { label: t('onboarding.none'), value: 'none' },
                    { label: t('onboarding.vegetarian'), value: 'vegetarian' },
                    { label: t('onboarding.vegan'), value: 'vegan' },
                    { label: t('onboarding.pescatarian'), value: 'pescatarian' },
                    { label: t('onboarding.keto'), value: 'keto' },
                    { label: t('onboarding.paleo'), value: 'paleo' },
                  ]}
                  onSelect={(val) => updateAndNext('dietary_preference', val, 'allergies')}
                />
              )}
            </>
          )}

          {/* FOOD ALLERGIES */}
          {step === 'allergies' && (
            <>
              <Message text="Any food allergies? (We'll skip this for now)" delay={0} offset={9} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <ButtonGroup
                  delay={600}
                  options={[{ label: 'Continue', value: 'none' }]}
                  onSelect={() => next('meals')}
                />
              )}
            </>
          )}

          {/* MEALS PER DAY */}
          {step === 'meals' && (
            <>
              <Message text="How many meals do you prefer per day?" delay={0} offset={16} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <ButtonGroup
                  delay={400}
                  options={[
                    { label: '2 meals', value: '2' },
                    { label: '3 meals', value: '3' },
                    { label: '4-5 meals', value: '4' },
                    { label: '6+ meals', value: '6' },
                  ]}
                  onSelect={(val) => updateAndNext('meals_per_day', parseInt(val), 'sleep')}
                />
              )}
            </>
          )}

          {/* SLEEP */}
          {step === 'sleep' && (
            <>
              <Message text="Average hours of sleep per night?" delay={0} offset={11} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <ButtonGroup
                  delay={400}
                  options={[
                    { label: '< 6 hours', value: '5' },
                    { label: '6-7 hours', value: '6.5' },
                    { label: '7-8 hours', value: '7.5' },
                    { label: '8+ hours', value: '8.5' },
                  ]}
                  onSelect={(val) => updateAndNext('sleep_hours', parseFloat(val), 'stress')}
                />
              )}
            </>
          )}

          {/* STRESS LEVEL */}
          {step === 'stress' && (
            <>
              <Message text="Typical stress level?" delay={0} offset={7} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <>
                  <ButtonGroup
                    delay={400}
                    options={[
                      { label: t('onboarding.low'), value: 'low' },
                      { label: t('onboarding.medium'), value: 'medium' },
                      { label: t('onboarding.high'), value: 'high' },
                    ]}
                    onSelect={(val) => {
                      updateAndNext('stress_level', val, 'calculating')
                      setTimeout(submit, 800)
                    }}
                  />
                </>
              )}
            </>
          )}

          {/* CALCULATING */}
          {step === 'calculating' && (
            <>
              <Message text="Calculating your personalized targets..." delay={0} />
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {error && (
                <div className="p-4 rounded-lg bg-error/10 border border-error text-error">
                  {error}
                </div>
              )}
            </>
          )}

          {/* COMPLETE */}
          {step === 'complete' && (
            <>
              <Message text="✅ All set!" delay={0} onComplete={() => setMessageIndex(1)} />
              {messageIndex >= 1 && (
                <Message text="Welcome to SHARPENED. Redirecting to your dashboard..." delay={600} offset={20} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
