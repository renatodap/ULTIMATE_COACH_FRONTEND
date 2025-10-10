/**
 * Hook for managing onboarding flow state and API interactions
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { onboardingApi } from '@/lib/api'
import type {
  OnboardingProgressResponse,
  UpdateOnboardingStepRequest,
  CompleteOnboardingRequest,
} from '@/lib/types/onboarding'

export function useOnboardingFlow() {
  const queryClient = useQueryClient()

  // Get onboarding progress
  const {
    data: progress,
    isLoading,
    error,
    refetch,
  } = useQuery<OnboardingProgressResponse>({
    queryKey: ['onboarding', 'progress'],
    queryFn: onboardingApi.getProgress,
    retry: 1,
    staleTime: 30000, // 30 seconds
  })

  // Start onboarding
  const startOnboarding = useMutation({
    mutationFn: onboardingApi.start,
    onSuccess: (data) => {
      queryClient.setQueryData(['onboarding', 'progress'], data)
    },
  })

  // Update step
  const updateStep = useMutation({
    mutationFn: (data: UpdateOnboardingStepRequest) =>
      onboardingApi.updateStep(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['onboarding', 'progress'], data)
    },
  })

  // Complete onboarding
  const completeOnboarding = useMutation({
    mutationFn: (data: CompleteOnboardingRequest) =>
      onboardingApi.complete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'progress'] })
      queryClient.invalidateQueries({ queryKey: ['businessProfile'] })
    },
  })

  return {
    // State
    progress,
    isLoading,
    error,
    currentStep: progress?.current_step || 1,
    totalSteps: progress?.total_steps || 5,
    completed: progress?.completed || false,
    partialData: progress?.partial_data || {},

    // Actions
    startOnboarding: startOnboarding.mutate,
    updateStep: updateStep.mutate,
    completeOnboarding: completeOnboarding.mutate,
    refetch,

    // Mutation states
    isStarting: startOnboarding.isPending,
    isUpdating: updateStep.isPending,
    isCompleting: completeOnboarding.isPending,
    startError: startOnboarding.error,
    updateError: updateStep.error,
    completeError: completeOnboarding.error,
  }
}
