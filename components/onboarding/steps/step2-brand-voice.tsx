/**
 * Step 2: Brand Voice & Identity
 */
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step2Schema, type Step2FormData } from '@/lib/validation/onboarding-schemas'
import { TextInput, TextArea, TagInput } from '../form-components'
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow'
import { useEffect } from 'react'

const VOICE_SUGGESTIONS = [
  'Professional yet approachable',
  'Friendly and conversational',
  'Bold and authoritative',
  'Warm and empathetic',
  'Witty and humorous',
  'Technical and precise',
]

export function Step2BrandVoice() {
  const { partialData, updateStep, isUpdating } = useOnboardingFlow()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      brand_voice: '',
      brand_personality: '',
      brand_values: [],
    },
  })

  const brandVoice = watch('brand_voice')

  // Load saved data
  useEffect(() => {
    if (partialData.step_2) {
      Object.entries(partialData.step_2).forEach(([key, value]) => {
        setValue(key as any, value)
      })
    }
  }, [partialData, setValue])

  const onSubmit = (data: Step2FormData) => {
    updateStep({
      step: 2,
      data: data,
    })
  }

  const handleVoiceSuggestion = (suggestion: string) => {
    setValue('brand_voice', suggestion)
  }

  return (
    <form id="step-2-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Brand Voice & Identity</h2>
        <p className="text-gray-400">Define how your brand communicates</p>
      </div>

      <div className="space-y-4">
        <div>
          <TextInput
            label="Brand Voice"
            name="brand_voice"
            placeholder="e.g., Professional yet approachable"
            register={register}
            error={errors.brand_voice}
            required
            helpText="How would you describe your brand's communication style?"
          />

          {/* Voice suggestions */}
          {!brandVoice && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {VOICE_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleVoiceSuggestion(suggestion)}
                    className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded-full hover:bg-purple-600 hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <TextArea
          label="Brand Personality"
          name="brand_personality"
          placeholder="e.g., Helpful expert that empowers people to achieve more"
          register={register}
          error={errors.brand_personality}
          required
          rows={3}
          helpText="If your brand were a person, how would you describe them?"
        />

        <Controller
          name="brand_values"
          control={control}
          render={({ field }) => (
            <TagInput
              label="Core Brand Values"
              name="brand_values"
              placeholder="Type a value and press Enter"
              value={field.value}
              onChange={field.onChange}
              error={errors.brand_values}
              required
              maxTags={10}
              helpText="What principles guide your business? (e.g., Innovation, Transparency, Quality)"
            />
          )}
        />

        {/* Examples section */}
        <div className="bg-gray-900 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-semibold text-purple-400 mb-2">
            💡 Why This Matters
          </h3>
          <p className="text-xs text-gray-400">
            Your brand voice and values help us create content that sounds authentically like you.
            This ensures your audience recognizes and connects with your message.
          </p>
        </div>
      </div>

      {isUpdating && (
        <div className="text-center text-purple-400 text-sm">Saving...</div>
      )}
    </form>
  )
}
