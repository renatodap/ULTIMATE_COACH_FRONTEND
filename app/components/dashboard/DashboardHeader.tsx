'use client'

/**
 * Dashboard Header Component - MOBILE-FIRST 2026/2027
 *
 * Intuitive: Clear greeting and refresh button
 * Mobile-first: Big tap targets, natural gestures
 * Easy to use: One tap to refresh all data
 */

import { motion } from 'framer-motion'
import { useTimezone } from '@/lib/context/TimezoneContext'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'

interface DashboardHeaderProps {
  displayName?: string | null
  date: string
  onRefresh?: () => void
  refreshing?: boolean
}

export default function DashboardHeader({ displayName, date, onRefresh, refreshing = false }: DashboardHeaderProps) {
  const { timezone } = useTimezone()

  // Format date: "Monday, Oct 13" in user's timezone
  // date is YYYY-MM-DD format from backend
  const dateObj = toZonedTime(new Date(date + 'T00:00:00'), timezone)
  const formattedDate = formatInTimeZone(dateObj, timezone, 'EEEE, MMM d')

  // Get greeting based on current time in user's timezone
  const currentTime = toZonedTime(new Date(), timezone)
  const hour = currentTime.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

  return (
    <header className="sticky top-0 z-[100] bg-iron-black border-b border-iron-gray/30 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-iron-white uppercase tracking-wider mb-1">
              {greeting}
              {displayName && <span className="text-iron-orange">, {displayName}</span>}
            </h1>
            <p className="text-sm text-iron-gray uppercase tracking-wider">
              {formattedDate}
            </p>
          </div>

          {/* Refresh Button - LARGE tap target */}
          <motion.button
            onClick={onRefresh}
            disabled={refreshing}
            className="bg-iron-dark-gray border border-iron-gray/30 px-4 py-3 min-w-[60px] min-h-[60px] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg
              className="w-6 h-6 text-iron-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </motion.svg>
          </motion.button>
        </div>
      </div>
    </header>
  )
}
