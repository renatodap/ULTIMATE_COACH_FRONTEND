/**
 * Step 4: Visual Identity
 */
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step4Schema, type Step4FormData } from '@/lib/validation/onboarding-schemas'
import { TagInput, Select } from '../form-components'
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow'
import { useEffect } from 'react'

const VISUAL_STYLES = [
  { value: 'Minimalist', label: 'Minimalist' },
  { value: 'Modern', label: 'Modern' },
  { value: 'Vibrant', label: 'Vibrant' },
  { value: 'Corporate', label: 'Corporate' },
  { value: 'Playful', label: 'Playful' },
  { value: 'Elegant', label: 'Elegant' },
  { value: 'Bold', label: 'Bold' },
]

export function Step4VisualIdentity() {
  const { partialData, updateStep, isUpdating } = useOnboardingFlow()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      preferred_colors: [],
      visual_style: '',
    },
  })

  // Load saved data
  useEffect(() => {
    if (partialData.step_4) {
      Object.entries(partialData.step_4).forEach(([key, value]) => {
        setValue(key as any, value)
      })
    }
  }, [partialData, setValue])

  const onSubmit = (data: Step4FormData) => {
    updateStep({
      step: 4,
      data: data,
    })
  }

  return (
    <form id="step-4-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Visual Identity</h2>
        <p className="text-gray-400">Optional: Define your visual preferences</p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-300">
            ℹ️ This step is optional. Visual customization features are coming soon, but
            providing this information helps us prepare personalized designs for you.
          </p>
        </div>

        <Controller
          name="preferred_colors"
          control={control}
          render={({ field }) => (
            <TagInput
              label="Preferred Brand Colors (Optional)"
              name="preferred_colors"
              placeholder="e.g., #6366f1 (press Enter)"
              value={field.value || []}
              onChange={field.onChange}
              error={errors.preferred_colors}
              maxTags={5}
              helpText="Enter hex color codes for your brand colors (e.g., #6366f1, #8b5cf6)"
            />
          )}
        />

        <Select
          label="Visual Style (Optional)"
          name="visual_style"
          options={VISUAL_STYLES}
          register={register}
          error={errors.visual_style}
          helpText="What visual style best represents your brand?"
        />

        {/* Visual examples */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { style: 'Minimalist', icon: '▫️', desc: 'Clean & simple' },
            { style: 'Vibrant', icon: '🎨', desc: 'Bold & colorful' },
            { style: 'Corporate', icon: '💼', desc: 'Professional' },
            { style: 'Playful', icon: '🎪', desc: 'Fun & energetic' },
          ].map((item) => (
            <div
              key={item.style}
              className="bg-gray-900 rounded-lg p-3 text-center border border-gray-700"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-xs font-semibold text-white">{item.style}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-semibold text-purple-400 mb-2">
            🎨 Coming Soon
          </h3>
          <p className="text-xs text-gray-400">
            We're building advanced visual customization features. Your preferences here will
            help us create carousel designs that match your brand perfectly.
          </p>
        </div>
      </div>

      {isUpdating && (
        <div className="text-center text-purple-400 text-sm">Saving...</div>
      )}
    </form>
  )
}
