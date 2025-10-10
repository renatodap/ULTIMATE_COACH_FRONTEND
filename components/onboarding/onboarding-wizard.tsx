/**
 * Main onboarding wizard container with navigation and step management
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressIndicator } from './progress-indicator'
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow'

interface OnboardingWizardProps {
  children: React.ReactNode
  onComplete?: () => void
}

export function OnboardingWizard({ children, onComplete }: OnboardingWizardProps) {
  const router = useRouter()
  const {
    currentStep,
    totalSteps,
    completed,
    isLoading,
    error,
    startOnboarding,
    isStarting,
  } = useOnboardingFlow()

  const [localStep, setLocalStep] = useState(1)

  // Initialize onboarding if not started
  useEffect(() => {
    if (!isLoading && !completed && currentStep === 1 && !isStarting) {
      startOnboarding()
    }
  }, [isLoading, completed, currentStep, startOnboarding, isStarting])

  // Sync local step with server step
  useEffect(() => {
    if (currentStep) {
      setLocalStep(currentStep)
    }
  }, [currentStep])

  // Handle completion
  useEffect(() => {
    if (completed) {
      onComplete?.()
      router.push('/dashboard')
    }
  }, [completed, router, onComplete])

  const handleStepChange = (step: number) => {
    // Only allow navigation to previous steps or current step
    if (step <= currentStep) {
      setLocalStep(step)
    }
  }

  const handleNext = () => {
    if (localStep < totalSteps) {
      setLocalStep(localStep + 1)
    }
  }

  const handlePrevious = () => {
    if (localStep > 1) {
      setLocalStep(localStep - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading onboarding...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Error Loading Onboarding
          </h2>
          <p className="text-gray-400 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Completed state (handled by useEffect redirect, but show briefly)
  if (completed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Onboarding Complete!
          </h2>
          <p className="text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Carousel Agent
          </h1>
          <p className="text-gray-400">
            Let's personalize your carousel generation experience
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={localStep}
          onStepClick={handleStepChange}
          completedSteps={Array.from({ length: currentStep - 1 }, (_, i) => i + 1)}
        />

        {/* Step Content */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 mt-8">
          {children}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={localStep === 1}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          
          <button
            type="submit"
            form={`step-${localStep}-form`}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            {localStep === totalSteps ? 'Complete' : 'Next →'}
          </button>
        </div>

        {/* Helper Text */}
        <div className="text-center mt-4 text-sm text-gray-500">
          You can always update your profile later in settings
        </div>
      </div>
    </div>
  )
}

// Export navigation context for child components
export function useWizardNavigation() {
  return {
    // This would be provided via context in production
    // For now, steps handle their own navigation via form submission
  }
}
