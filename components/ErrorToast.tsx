'use client'

/**
 * Error Toast Component
 *
 * Specialized toast for error messages
 * Auto-dismisses after 5 seconds, shows error details
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

interface ErrorToastProps {
  message: string
  details?: string
  onDismiss: () => void
  duration?: number
}

export function ErrorToast({
  message,
  details,
  onDismiss,
  duration = 5000
}: ErrorToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    // Auto-dismiss timer
    const dismissTimer = setTimeout(() => {
      onDismiss()
    }, duration)

    // Progress bar animation
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining === 0) {
        clearInterval(progressInterval)
      }
    }, 50)

    return () => {
      clearTimeout(dismissTimer)
      clearInterval(progressInterval)
    }
  }, [duration, onDismiss])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-24 left-4 right-4 z-[700] sm:left-auto sm:right-4 sm:w-96"
      >
        <div className="bg-iron-dark-gray/95 backdrop-blur border border-red-500/30 rounded-lg shadow-2xl overflow-hidden">
          {/* Content */}
          <div className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-iron-white font-medium">{message}</p>
                  {details && (
                    <p className="text-xs text-iron-gray mt-1">{details}</p>
                  )}
                </div>
              </div>

              {/* Dismiss button */}
              <button
                onClick={onDismiss}
                className="min-w-[32px] min-h-[32px] flex items-center justify-center text-iron-gray hover:text-iron-white transition-colors active-press"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-iron-gray/20">
            <motion.div
              className="h-full bg-red-500"
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.05, ease: 'linear' }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
