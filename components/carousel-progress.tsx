/**
 * Real-time carousel generation progress component.
 *
 * Displays live progress updates via WebSocket connection.
 */
'use client'

import { useCarouselProgress } from '@/hooks/useCarouselProgress'

interface CarouselProgressProps {
  carouselId: string
  showCost?: boolean
  className?: string
}

export function CarouselProgress({ carouselId, showCost = true, className = '' }: CarouselProgressProps) {
  const { status, progress, currentStep, totalCost, isConnected, error } = useCarouselProgress(carouselId)

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  // Progress bar color
  const getProgressColor = (status: string) => {
    if (status === 'failed') return 'bg-red-500'
    if (status === 'completed') return 'bg-green-500'
    return 'bg-blue-500'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live updates' : 'Connecting...'}
          </span>
        </div>

        {/* Status badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{currentStep}</span>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor(status)}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {[
          { key: 'researching', label: 'Research', threshold: 20 },
          { key: 'writing', label: 'Writing', threshold: 50 },
          { key: 'designing', label: 'Visuals', threshold: 75 },
          { key: 'completed', label: 'Complete', threshold: 100 },
        ].map((step) => (
          <div key={step.key} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                progress >= step.threshold
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {progress >= step.threshold ? '✓' : step.threshold}
            </div>
            <span className="text-xs text-gray-600">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Cost display */}
      {showCost && totalCost > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Cost:</span>
            <span className="text-lg font-semibold text-gray-900">${totalCost.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Completion message */}
      {status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✨ Carousel generated successfully! ({progress}% complete)
          </p>
        </div>
      )}
    </div>
  )
}
