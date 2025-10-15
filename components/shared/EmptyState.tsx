'use client'

/**
 * Empty State Component - FIRST-TIME USER EXPERIENCE
 *
 * Intuitive: Clear guidance when no data exists
 * Mobile-first: Large icons, obvious CTA button
 * Easy to use: One button to fix the empty state
 *
 * Critical moment: Users abandon apps when confused
 * This component converts confusion → action
 */

import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: string // Emoji
  title: string
  subtitle?: string
  actionLabel: string
  onAction: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Large Icon */}
      <motion.div
        className="text-8xl mb-6"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-iron-white uppercase tracking-wider mb-3">
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-iron-gray text-base md:text-lg mb-8 max-w-md">
          {subtitle}
        </p>
      )}

      {/* Primary Action - BIG BUTTON */}
      <motion.button
        onClick={onAction}
        className="
          bg-iron-orange text-iron-black
          px-8 py-4 min-h-[60px] min-w-[200px]
          border-2 border-iron-black
          font-bold text-lg uppercase tracking-wider
          shadow-xl
          transition-all duration-200
          hover:bg-iron-orange/90
          tap-target focus-ring-iron
        "
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {actionLabel}
      </motion.button>

      {/* Secondary Action (optional) */}
      {secondaryActionLabel && onSecondaryAction && (
        <button
          onClick={onSecondaryAction}
          className="
            mt-4 text-iron-gray hover:text-iron-white
            text-sm uppercase tracking-wider
            transition-colors duration-200
            tap-target focus-ring-iron
          "
        >
          {secondaryActionLabel}
        </button>
      )}
    </motion.div>
  )
}
