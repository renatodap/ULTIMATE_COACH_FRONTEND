'use client'

/**
 * Undo Toast Component
 *
 * Specialized toast for delete actions with undo functionality
 * Auto-dismisses after 10 seconds, calls onUndo if user clicks undo
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface UndoToastProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
  duration?: number
}

export function UndoToast({
  message,
  onUndo,
  onDismiss,
  duration = 10000
}: UndoToastProps) {
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

  const handleUndo = () => {
    onUndo()
    onDismiss()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-24 left-4 right-4 z-[700] sm:left-auto sm:right-4 sm:w-96"
      >
        <div className="bg-iron-dark-gray/95 backdrop-blur border border-iron-orange/30 rounded-lg shadow-2xl overflow-hidden">
          {/* Content */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-iron-orange flex-shrink-0" />
                <p className="text-sm text-iron-white">{message}</p>
              </div>

              {/* Undo button */}
              <button
                onClick={handleUndo}
                className="flex items-center gap-2 px-3 py-1.5 bg-iron-orange text-iron-black rounded-lg font-medium text-sm hover:bg-iron-orange/90 transition-colors active-press"
              >
                <RotateCcw className="w-4 h-4" />
                <span>UNDO</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-iron-gray/20">
            <motion.div
              className="h-full bg-iron-orange"
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
