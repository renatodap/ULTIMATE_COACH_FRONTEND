/**
 * Hook for managing business profile
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { businessProfileApi } from '@/lib/api'
import type {
  BusinessProfileResponse,
  UpdateBusinessProfileRequest,
  ProfileCompletionStatusResponse,
} from '@/lib/types/onboarding'

export function useBusinessProfile() {
  const queryClient = useQueryClient()

  // Get business profile
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery<BusinessProfileResponse>({
    queryKey: ['businessProfile'],
    queryFn: businessProfileApi.get,
    retry: 1,
    staleTime: 60000, // 1 minute
  })

  // Get completion status
  const {
    data: completionStatus,
    isLoading: isLoadingStatus,
  } = useQuery<ProfileCompletionStatusResponse>({
    queryKey: ['businessProfile', 'completion'],
    queryFn: businessProfileApi.getCompletionStatus,
    retry: 1,
    staleTime: 60000,
  })

  // Update profile
  const updateProfile = useMutation({
    mutationFn: (data: UpdateBusinessProfileRequest) =>
      businessProfileApi.update(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['businessProfile'], data)
      queryClient.invalidateQueries({ queryKey: ['businessProfile', 'completion'] })
    },
  })

  // Delete profile
  const deleteProfile = useMutation({
    mutationFn: businessProfileApi.delete,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['businessProfile'] })
      queryClient.removeQueries({ queryKey: ['businessProfile', 'completion'] })
    },
  })

  return {
    // State
    profile,
    completionStatus,
    isLoading,
    isLoadingStatus,
    error,
    hasProfile: !!profile,
    isComplete: profile?.onboarding_completed || false,
    completionPercentage: profile?.completion_percentage || 0,

    // Actions
    updateProfile: updateProfile.mutate,
    deleteProfile: deleteProfile.mutate,
    refetch,

    // Mutation states
    isUpdating: updateProfile.isPending,
    isDeleting: deleteProfile.isPending,
    updateError: updateProfile.error,
    deleteError: deleteProfile.error,
  }
}
