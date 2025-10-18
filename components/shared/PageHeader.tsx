'use client'

/**
 * Page Header Component - CONSISTENT NAVIGATION
 *
 * Intuitive: Users always know where they are and how to leave
 * Mobile-first: 60px height, large tap targets
 * Easy to use: Predictable back/refresh buttons
 *
 * Reduces cognitive load, builds muscle memory
 */

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  showRefresh?: boolean
  onRefresh?: () => void
  refreshing?: boolean
  rightAction?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  showRefresh = false,
  onRefresh,
  refreshing = false,
  rightAction
}: PageHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-[100] bg-iron-black border-b border-iron-gray/30">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Back button or spacer */}
        <div className="w-12">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="w-12 h-12 flex items-center justify-center text-iron-white hover:text-iron-orange transition-colors active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Center: Title */}
        <div className="flex-1 text-center px-4">
          <h1 className="text-lg font-bold text-iron-white uppercase tracking-wider truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-iron-gray uppercase tracking-wider truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Refresh or custom action */}
        <div className="w-12">
          {showRefresh && onRefresh ? (
            <motion.button
              onClick={onRefresh}
              disabled={refreshing}
              className="w-12 h-12 flex items-center justify-center text-iron-white hover:text-iron-orange transition-colors disabled:opacity-50 active:scale-90"
              whileTap={{ scale: 0.9 }}
            >
              <motion.svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </motion.svg>
            </motion.button>
          ) : rightAction ? (
            rightAction
          ) : null}
        </div>
      </div>
    </header>
  )
}
