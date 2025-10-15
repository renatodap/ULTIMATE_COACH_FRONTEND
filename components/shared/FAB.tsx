'use client'

/**
 * Floating Action Button (FAB) - UNIVERSAL PRIMARY ACTION
 *
 * Intuitive: ONE button users always see for main action
 * Mobile-first: 60px circle, thumb-friendly position
 * Easy to use: Context-aware, changes per page
 *
 * Industry standard: Gmail, WhatsApp, Instagram all use FAB
 * Apple HIG: 44pt minimum, we use 60px (exceeds standard)
 */

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface FABProps {
  icon?: React.ReactNode
  label?: string
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'save'
  className?: string
}

export function FAB({
  icon,
  label,
  onClick,
  href,
  variant = 'primary',
  className = ''
}: FABProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    }
  }

  const variantStyles = {
    primary: 'bg-iron-orange hover:bg-iron-orange/90 text-iron-black',
    save: 'bg-green-500 hover:bg-green-600 text-iron-white',
  }

  return (
    <motion.button
      onClick={handleClick}
      className={`
        fixed bottom-24 right-6 z-[200]
        w-[60px] h-[60px]
        ${variantStyles[variant]}
        border-2 border-iron-black
        shadow-2xl
        flex items-center justify-center
        transition-all duration-200
        tap-target focus-ring-iron
        ${className}
      `}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {icon || (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      )}

      {label && (
        <motion.span
          className="absolute -left-2 -translate-x-full bg-iron-dark-gray text-iron-white px-3 py-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap border border-iron-gray/30"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {label}
        </motion.span>
      )}
    </motion.button>
  )
}

/**
 * FAB with full-width variant for form submission
 * Used in /log pages
 */
export function FABFullWidth({
  label,
  icon,
  onClick,
  disabled = false,
  variant = 'primary'
}: {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'save'
}) {
  const variantStyles = {
    primary: 'bg-iron-orange hover:bg-iron-orange/90 disabled:bg-iron-gray',
    save: 'bg-green-500 hover:bg-green-600 disabled:bg-iron-gray',
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        fixed bottom-20 left-4 right-4 z-[200]
        h-[60px]
        ${variantStyles[variant]}
        text-iron-white
        border-2 border-iron-black
        shadow-2xl
        flex items-center justify-center gap-3
        transition-all duration-200
        tap-target focus-ring-iron
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {icon}
      <span className="text-lg font-bold uppercase tracking-wider">
        {label}
      </span>
    </motion.button>
  )
}
