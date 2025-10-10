/**
 * Step 5: Review & Complete
 */
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step5Schema, type Step5FormData } from '@/lib/validation/onboarding-schemas'
import { TagInput, NumberInput } from '../form-components'
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow'
import { BusinessProfileData } from '@/lib/types/onboarding'
import { useEffect, useState } from 'react'

export function Step5Review() {
  const { partialData, completeOnboarding, isCompleting, updateStep, isUpdating } =
    useOnboardingFlow()

  const [isReady, setIsReady] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      competitors: [],
      unique_selling_points: [],
      current_follower_count: undefined,
    },
  })

  // Load saved data
  useEffect(() => {
    if (partialData.step_5) {
      Object.entries(partialData.step_5).forEach(([key, value]) => {
        setValue(key as any, value)
      })
    }
  }, [partialData, setValue])

  const onSubmit = async (data: Step5FormData) => {
    // Merge all step data into complete profile
    const completeProfile: BusinessProfileData = {
      // Step 1
      ...(partialData.step_1 || {}),
      // Step 2
      ...(partialData.step_2 || {}),
      // Step 3
      ...(partialData.step_3 || {}),
      // Step 4
      ...(partialData.step_4 || {}),
      // Step 5
      ...data,
    } as BusinessProfileData

    // Complete onboarding with full profile
    completeOnboarding({
      profile_data: completeProfile,
    })
  }

  return (
    <form id="step-5-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Almost Done!</h2>
        <p className="text-gray-400">
          Final details to complete your personalized profile
        </p>
      </div>

      <div className="space-y-4">
        <Controller
          name="unique_selling_points"
          control={control}
          render={({ field }) => (
            <TagInput
              label="Unique Selling Points"
              name="unique_selling_points"
              placeholder="Type a USP and press Enter"
              value={field.value}
              onChange={field.onChange}
              error={errors.unique_selling_points}
              required
              maxTags={10}
              helpText="What makes you different from competitors? What's your edge?"
            />
          )}
        />

        <Controller
          name="competitors"
          control={control}
          render={({ field }) => (
            <TagInput
              label="Main Competitors (Optional)"
              name="competitors"
              placeholder="Add competitor name..."
              value={field.value || []}
              onChange={field.onChange}
              maxTags={10}
              helpText="Who are your main competitors? This helps us understand your market position."
            />
          )}
        />

        <NumberInput
          label="Current Instagram Followers (Optional)"
          name="current_follower_count"
          placeholder="e.g., 1500"
          register={register}
          error={errors.current_follower_count}
          min={0}
          helpText="Helps us tailor recommendations to your current reach"
        />

        {/* Profile Summary */}
        <div className="border-t border-gray-700 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Your Profile Summary</h3>
          <div className="space-y-3">
            {partialData.step_1?.business_name && (
              <div className="bg-gray-900 rounded-lg p-3">
                <span className="text-xs text-gray-400">Business:</span>
                <p className="text-sm text-white font-medium">
                  {partialData.step_1.business_name}
                </p>
              </div>
            )}

            {partialData.step_1?.industry && (
              <div className="bg-gray-900 rounded-lg p-3">
                <span className="text-xs text-gray-400">Industry:</span>
                <p className="text-sm text-white font-medium">
                  {partialData.step_1.industry}
                </p>
              </div>
            )}

            {partialData.step_2?.brand_voice && (
              <div className="bg-gray-900 rounded-lg p-3">
                <span className="text-xs text-gray-400">Brand Voice:</span>
                <p className="text-sm text-white font-medium">
                  {partialData.step_2.brand_voice}
                </p>
              </div>
            )}

            {partialData.step_3?.content_goals && (
              <div className="bg-gray-900 rounded-lg p-3">
                <span className="text-xs text-gray-400">Content Goals:</span>
                <p className="text-sm text-white font-medium">
                  {partialData.step_3.content_goals.join(', ')}
                </p>
              </div>
            )}

            {partialData.step_3?.key_topics && (
              <div className="bg-gray-900 rounded-lg p-3">
                <span className="text-xs text-gray-400">Key Topics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {partialData.step_3.key_topics.slice(0, 5).map((topic: string) => (
                    <span
                      key={topic}
                      className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                  {partialData.step_3.key_topics.length > 5 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{partialData.step_3.key_topics.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success message */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            🎉 You're All Set!
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            Your profile will be used to personalize carousel generation, including:
          </p>
          <ul className="text-xs text-gray-400 space-y-1 ml-4">
            <li>✓ Matching your brand voice and tone</li>
            <li>✓ Focusing on your key topics and audience</li>
            <li>✓ Learning from your preferences over time</li>
            <li>✓ Generating content that resonates with your goals</li>
          </ul>
        </div>

        {/* Privacy note */}
        <div className="text-xs text-gray-500 text-center">
          <p>
            Your data is encrypted and stored securely. You can update your profile anytime
            from settings.
          </p>
        </div>
      </div>

      {(isCompleting || isUpdating) && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2" />
          <p className="text-purple-400 text-sm">
            Creating your personalized profile...
          </p>
        </div>
      )}
    </form>
  )
}
