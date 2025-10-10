/**
 * Step 1: Business Basics
 */
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step1Schema, type Step1FormData } from '@/lib/validation/onboarding-schemas'
import { TextInput, TextArea, TagInput, Select } from '../form-components'
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow'
import { useEffect } from 'react'

const AGE_RANGES = [
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55+', label: '55+' },
]

const INCOME_LEVELS = [
  { value: 'Low income', label: 'Low income' },
  { value: 'Middle class', label: 'Middle class' },
  { value: 'High earners', label: 'High earners' },
  { value: 'Mixed', label: 'Mixed' },
]

export function Step1BasicInfo() {
  const { partialData, updateStep, isUpdating } = useOnboardingFlow()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      business_name: '',
      industry: '',
      website_url: '',
      target_audience: '',
      audience_pain_points: [],
      audience_demographics: {
        age_range: '',
        location: '',
        income_level: '',
      },
    },
  })

  // Load saved data
  useEffect(() => {
    if (partialData.step_1) {
      Object.entries(partialData.step_1).forEach(([key, value]) => {
        setValue(key as any, value)
      })
    }
  }, [partialData, setValue])

  const onSubmit = (data: Step1FormData) => {
    updateStep({
      step: 1,
      data: data,
    })
  }

  return (
    <form id="step-1-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Business Basics</h2>
        <p className="text-gray-400">Tell us about your business and target audience</p>
      </div>

      <div className="space-y-4">
        <TextInput
          label="Business or Brand Name"
          name="business_name"
          placeholder="e.g., AI Productivity Co"
          register={register}
          error={errors.business_name}
          required
          helpText="Your business, personal brand, or project name"
        />

        <TextInput
          label="Industry or Niche"
          name="industry"
          placeholder="e.g., SaaS, Fitness, Finance"
          register={register}
          error={errors.industry}
          required
          helpText="What industry or niche do you operate in?"
        />

        <TextInput
          label="Website URL"
          name="website_url"
          placeholder="https://example.com"
          register={register}
          error={errors.website_url}
          helpText="Optional - helps us understand your brand better"
        />

        <TextArea
          label="Target Audience"
          name="target_audience"
          placeholder="e.g., Small business owners and solopreneurs aged 30-45"
          register={register}
          error={errors.target_audience}
          required
          rows={3}
          helpText="Describe who your ideal customer or audience is"
        />

        <Controller
          name="audience_pain_points"
          control={control}
          render={({ field }) => (
            <TagInput
              label="Audience Pain Points"
              name="audience_pain_points"
              placeholder="Type a pain point and press Enter"
              value={field.value}
              onChange={field.onChange}
              error={errors.audience_pain_points}
              required
              maxTags={10}
              helpText="What problems or challenges does your audience face? (Press Enter to add)"
            />
          )}
        />

        {/* Optional Demographics */}
        <div className="border-t border-gray-700 pt-4 mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            Audience Demographics (Optional)
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Select
              label="Age Range"
              name="audience_demographics.age_range"
              options={AGE_RANGES}
              register={register}
              error={errors.audience_demographics?.age_range}
            />

            <TextInput
              label="Location"
              name="audience_demographics.location"
              placeholder="e.g., United States, Global"
              register={register}
              error={errors.audience_demographics?.location}
            />

            <Select
              label="Income Level"
              name="audience_demographics.income_level"
              options={INCOME_LEVELS}
              register={register}
              error={errors.audience_demographics?.income_level}
            />
          </div>
        </div>
      </div>

      {isUpdating && (
        <div className="text-center text-purple-400 text-sm">Saving...</div>
      )}
    </form>
  )
}
