/**
 * Onboarding page - multi-step wizard for business profile setup
 */
'use client'

import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow'
import { Step1BasicInfo } from '@/components/onboarding/steps/step1-basic-info'
import { Step2BrandVoice } from '@/components/onboarding/steps/step2-brand-voice'
import { Step3ContentStrategy } from '@/components/onboarding/steps/step3-content-strategy'
import { Step4VisualIdentity } from '@/components/onboarding/steps/step4-visual-identity'
import { Step5Review } from '@/components/onboarding/steps/step5-review'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const { currentStep } = useOnboardingFlow()

  const handleComplete = () => {
    router.push('/dashboard')
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo />
      case 2:
        return <Step2BrandVoice />
      case 3:
        return <Step3ContentStrategy />
      case 4:
        return <Step4VisualIdentity />
      case 5:
        return <Step5Review />
      default:
        return <Step1BasicInfo />
    }
  }

  return (
    <OnboardingWizard onComplete={handleComplete}>
      {renderCurrentStep()}
    </OnboardingWizard>
  )
}
