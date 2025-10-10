/**
 * Step 3: Content Strategy
 */
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step3Schema, type Step3FormData } from '@/lib/validation/onboarding-schemas'
import { TextInput, TextArea, TagInput, MultiSelect } from '../form-components'
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow'
import { useEffect } from 'react'

const CONTENT_GOALS = [
  'Lead generation',
  'Brand awareness',
  'Education',
  'Engagement',
  'Sales',
  'Community building',
  'Thought leadership',
  'Product launches',
]

const POSTING_FREQUENCY_OPTIONS = [
  { value: 'Daily', label: 'Daily' },
  { value: '3x per week', label: '3x per week' },
  { value: '2x per week', label: '2x per week' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Bi-weekly', label: 'Bi-weekly' },
]

export function Step3ContentStrategy() {
  const { partialData, updateStep, isUpdating } = useOnboardingFlow()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      content_goals: [],
      key_topics: [],
      content_style_preferences: '',
      posting_frequency: '',
      best_performing_topics: [],
      example_copy_they_like: '',
      example_hooks: [],
    },
  })

  const contentGoals = watch('content_goals')

  // Load saved data
  useEffect(() => {
    if (partialData.step_3) {
      Object.entries(partialData.step_3).forEach(([key, value]) => {
        setValue(key as any, value)
      })
    }
  }, [partialData, setValue])

  const onSubmit = (data: Step3FormData) => {
    updateStep({
      step: 3,
      data: data,
    })
  }

  return (
    <form id="step-3-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Content Strategy</h2>
        <p className="text-gray-400">Define your content goals and topics</p>
      </div>

      <div className="space-y-4">
        <Controller
          name="content_goals"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Content Goals"
              name="content_goals"
              options={CONTENT_GOALS}
              value={field.value}
              onChange={field.onChange}
              error={errors.content_goals}
              required
              helpText="What do you want to achieve with your content?"
            />
          )}
        />

        <Controller
          name="key_topics"
          control={control}
          render={({ field }) => (
            <TagInput
              label="Key Topics"
              name="key_topics"
              placeholder="Type a topic and press Enter"
              value={field.value}
              onChange={field.onChange}
              error={errors.key_topics}
              required
              maxTags={20}
              helpText="What topics do you want to create content about? (e.g., AI automation, productivity tips)"
            />
          )}
        />

        <TextInput
          label="Content Style Preferences"
          name="content_style_preferences"
          placeholder="e.g., Data-driven with actionable tips"
          register={register}
          error={errors.content_style_preferences}
          helpText="Optional - Any specific style preferences for your content?"
        />

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Posting Frequency
            </label>
            <select
              {...register('posting_frequency')}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select frequency...</option>
              {POSTING_FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">How often do you plan to post?</p>
          </div>

          <Controller
            name="best_performing_topics"
            control={control}
            render={({ field }) => (
              <TagInput
                label="Best Performing Topics (Optional)"
                name="best_performing_topics"
                placeholder="Add topics..."
                value={field.value || []}
                onChange={field.onChange}
                maxTags={10}
                helpText="Topics that worked well for you before"
              />
            )}
          />
        </div>

        {/* Critical for quality */}
        <div className="border-t border-gray-700 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="text-yellow-500">⭐</span>
            Example Content (Highly Recommended)
          </h3>

          <TextArea
            label="Example Copy You Like"
            name="example_copy_they_like"
            placeholder="Paste an example of writing style you admire or want to emulate..."
            register={register}
            error={errors.example_copy_they_like}
            rows={4}
            helpText="This helps us match your preferred tone and style (min 50 characters)"
          />

          <div className="mt-4">
            <Controller
              name="example_hooks"
              control={control}
              render={({ field }) => (
                <TagInput
                  label="Example Hooks That Worked"
                  name="example_hooks"
                  placeholder="Type a hook and press Enter"
                  value={field.value || []}
                  onChange={field.onChange}
                  maxTags={10}
                  helpText="Share hooks or opening lines that got great engagement"
                />
              )}
            />
          </div>
        </div>

        {/* Info callout */}
        <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-purple-400 mb-2">
            💡 Quality Tip
          </h3>
          <p className="text-xs text-gray-400">
            The example content you provide directly improves AI personalization. The more context
            you give, the better we can match your style and create content that resonates with
            your audience.
          </p>
        </div>
      </div>

      {isUpdating && (
        <div className="text-center text-purple-400 text-sm">Saving...</div>
      )}
    </form>
  )
}
