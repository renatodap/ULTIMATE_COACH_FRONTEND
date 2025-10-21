'use client'

/**
 * Generate Plan Modal
 *
 * Modal for generating a new personalized fitness plan
 * Uses all profile data to create comprehensive training program
 *
 * Part of Phase 4: Plan Generation System
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2, CheckCircle, Calendar } from 'lucide-react'
import { generatePlan } from '@/lib/api/planning'
import { useRouter } from 'next/navigation'

interface GeneratePlanModalProps {
  isOpen: boolean
  onClose: () => void
  isRegeneration?: boolean  // true if regenerating existing plan
  currentPlanId?: string
  onSuccess?: () => void  // Called after successful plan generation
}

type GenerationState = 'confirm' | 'generating' | 'success' | 'error'

export function GeneratePlanModal({
  isOpen,
  onClose,
  isRegeneration = false,
  currentPlanId,
  onSuccess
}: GeneratePlanModalProps) {
  const router = useRouter()
  const [state, setState] = useState<GenerationState>('confirm')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [generatedPlanId, setGeneratedPlanId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Accessibility: Focus management
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Accessibility: Focus trap and restoration
  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus modal when opened
      modalRef.current?.focus()

      // Return focus on unmount
      return () => {
        previousActiveElement.current?.focus()
      }
    }
  }, [isOpen])

  // Accessibility: Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state !== 'generating' && isOpen) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isOpen])

  const steps = [
    { label: 'Analyzing your profile', duration: 1000 },
    { label: 'Calculating optimal frequency', duration: 1500 },
    { label: 'Selecting exercises', duration: 2000 },
    { label: 'Planning meal timing', duration: 1500 },
    { label: 'Optimizing progression', duration: 2000 },
    { label: 'Finalizing your plan', duration: 1000 }
  ]

  const handleGenerate = async () => {
    setState('generating')
    setProgress(0)
    setError(null)

    // Animate progress through steps
    let currentProgress = 0
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i].label)
      await new Promise(resolve => setTimeout(resolve, steps[i].duration))
      currentProgress = ((i + 1) / steps.length) * 100
      setProgress(currentProgress)
    }

    try {
      // Generate plan with forceRegenerate flag if regenerating
      const result = await generatePlan({
        forceRegenerate: isRegeneration
      })

      setGeneratedPlanId(result.program_id)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan')
      setState('error')
    }
  }

  const handleViewPlan = () => {
    if (onSuccess) {
      onSuccess()
    }
    router.push('/plan')
    onClose()
  }

  const handleClose = () => {
    if (state !== 'generating') {
      setState('confirm')
      setProgress(0)
      setCurrentStep('')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] flex items-center justify-center bg-iron-black/80 backdrop-blur-sm p-4"
        onClick={state !== 'generating' ? handleClose : undefined}
      >
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="generate-plan-modal-title"
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-iron-dark-gray border border-iron-gray rounded-xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-iron-gray flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-iron-orange" />
              <h2
                id="generate-plan-modal-title"
                className="text-xl font-heading text-iron-white uppercase tracking-wider"
              >
                {isRegeneration ? 'Regenerate Plan' : 'Generate Your Plan'}
              </h2>
            </div>
            {state !== 'generating' && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-iron-gray/20 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-iron-gray" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {state === 'confirm' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-iron-white">
                  {isRegeneration
                    ? 'This will create a new plan based on your updated profile. Your current plan will be archived.'
                    : 'We\'ll create a personalized fitness plan based on your profile, including:'
                  }
                </p>
                <ul className="space-y-2 text-sm text-iron-gray">
                  <li className="flex items-start gap-2">
                    <span className="text-iron-orange">•</span>
                    <span>Customized workout schedule matching your availability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-iron-orange">•</span>
                    <span>Exercise selection based on equipment and experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-iron-orange">•</span>
                    <span>Meal timing optimized around your training</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-iron-orange">•</span>
                    <span>Progressive overload strategy for your goals</span>
                  </li>
                </ul>
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 bg-iron-gray/20 text-iron-white rounded-lg hover:bg-iron-gray/40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="flex-1 px-4 py-3 bg-iron-orange text-iron-black font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </button>
                </div>
              </motion.div>
            )}

            {state === 'generating' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
                aria-live="polite"
                aria-busy="true"
              >
                {/* Progress bar */}
                <div>
                  <div
                    className="h-2 bg-iron-gray/20 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Plan generation progress"
                  >
                    <motion.div
                      className="h-full bg-iron-orange"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-iron-gray mt-2">{Math.round(progress)}%</p>
                </div>

                {/* Current step */}
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-iron-orange animate-spin" aria-hidden="true" />
                  <p className="text-iron-white">{currentStep}</p>
                </div>

                <p className="text-sm text-iron-gray">
                  This usually takes 10-15 seconds...
                </p>
              </motion.div>
            )}

            {state === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 text-center"
              >
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-xl font-heading text-iron-white uppercase">
                  Plan Generated!
                </h3>
                <p className="text-iron-gray">
                  Your personalized fitness plan is ready. Let&apos;s see what we&apos;ve prepared for you.
                </p>
                <button
                  onClick={handleViewPlan}
                  className="w-full px-4 py-3 bg-iron-orange text-iron-black font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  View My Plan
                </button>
              </motion.div>
            )}

            {state === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{error || 'Failed to generate plan. Please try again.'}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 bg-iron-gray/20 text-iron-white rounded-lg hover:bg-iron-gray/40 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setState('confirm')
                      setError(null)
                    }}
                    className="flex-1 px-4 py-3 bg-iron-orange text-iron-black font-medium rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
