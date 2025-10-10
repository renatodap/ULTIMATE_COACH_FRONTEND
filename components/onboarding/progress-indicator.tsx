/**
 * Progress indicator for onboarding wizard
 */
'use client'

interface Step {
  number: number
  title: string
  description: string
}

const steps: Step[] = [
  { number: 1, title: 'Business Basics', description: 'Tell us about your business' },
  { number: 2, title: 'Brand Voice', description: 'Define your brand identity' },
  { number: 3, title: 'Content Strategy', description: 'Set your content goals' },
  { number: 4, title: 'Visual Identity', description: 'Choose your style' },
  { number: 5, title: 'Review', description: 'Finalize your profile' },
]

interface ProgressIndicatorProps {
  currentStep: number
  onStepClick?: (step: number) => void
  completedSteps?: number[]
}

export function ProgressIndicator({
  currentStep,
  onStepClick,
  completedSteps = [],
}: ProgressIndicatorProps) {
  return (
    <div className="w-full py-6">
      {/* Mobile: Compact Progress Bar */}
      <div className="md:hidden">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-center text-white mt-3 font-medium">
          {steps[currentStep - 1]?.title}
        </p>
      </div>

      {/* Desktop: Full Step Indicator */}
      <div className="hidden md:block">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const isComplete = completedSteps.includes(step.number)
            const isCurrent = step.number === currentStep
            const isPast = step.number < currentStep

            return (
              <div key={step.number} className="flex flex-col items-center flex-1">
                {/* Connector Line */}
                {index > 0 && (
                  <div
                    className={`absolute h-0.5 w-full -ml-1/2 -z-10 ${
                      isPast || isComplete ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                    style={{
                      width: '100%',
                      transform: `translateX(-50%)`,
                      left: `${((index) / steps.length) * 100}%`,
                    }}
                  />
                )}

                {/* Step Circle */}
                <button
                  type="button"
                  onClick={() => onStepClick?.(step.number)}
                  disabled={!isPast && !isCurrent}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    transition-all duration-200 relative z-10 mb-2
                    ${
                      isCurrent
                        ? 'bg-purple-600 text-white ring-4 ring-purple-600/30'
                        : isComplete || isPast
                        ? 'bg-purple-700 text-white cursor-pointer hover:bg-purple-600'
                        : 'bg-gray-800 text-gray-500 border-2 border-gray-700'
                    }
                  `}
                >
                  {isComplete ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </button>

                {/* Step Label */}
                <div className="text-center">
                  <p
                    className={`text-xs font-medium ${
                      isCurrent ? 'text-purple-400' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
