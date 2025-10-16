'use client'

/**
 * DateNavigation Component
 *
 * Mobile-first date navigation for browsing nutrition data by day.
 * Features previous/next day buttons and current date display.
 *
 * Design Pattern:
 * [← Previous] | OCTOBER 13, 2025 | [Next →]
 *
 * TIMEZONE HANDLING:
 * - Uses user's timezone from context for all date operations
 * - Correctly handles date boundaries across timezones
 * - "Today" is relative to user's timezone, not UTC or browser time
 */

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTimezone } from '@/lib/context/TimezoneContext'
import {
  getTodayInTimezone,
  addDaysInTimezone,
  isToday,
  formatDateDisplay
} from '@/lib/utils/timezone'
import { toZonedTime } from 'date-fns-tz'

interface DateNavigationProps {
  selectedDate: string // ISO date string (YYYY-MM-DD)
  onDateChange: (newDate: string) => void
  className?: string
}

export default function DateNavigation({
  selectedDate,
  onDateChange,
  className = ''
}: DateNavigationProps) {
  const { timezone } = useTimezone()

  // Get today in user's timezone
  const todayStr = getTodayInTimezone(timezone)

  // Check if selected date is today in user's timezone
  const isTodaySelected = isToday(selectedDate, timezone)

  // Format date for display (with timezone awareness)
  const formatDateLabel = (): string => {
    const date = toZonedTime(new Date(selectedDate + 'T00:00:00'), timezone)
    const today = toZonedTime(new Date(), timezone)

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      timeZone: timezone
    }
    return date.toLocaleDateString('en-US', options).toUpperCase()
  }

  // Navigate to previous day (in user's timezone)
  const handlePreviousDay = () => {
    const previousDay = addDaysInTimezone(selectedDate, -1, timezone)
    onDateChange(previousDay)
  }

  // Navigate to next day (in user's timezone)
  const handleNextDay = () => {
    const nextDay = addDaysInTimezone(selectedDate, 1, timezone)
    onDateChange(nextDay)
  }

  // Navigate to today (in user's timezone)
  const handleToday = () => {
    onDateChange(todayStr)
  }

  // Check if next day would be in the future (in user's timezone)
  const isNextDayFuture = (): boolean => {
    const nextDay = addDaysInTimezone(selectedDate, 1, timezone)
    return nextDay > todayStr
  }

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      {/* Previous Day Button */}
      <motion.button
        onClick={handlePreviousDay}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-iron-gray hover:border-iron-orange hover:bg-iron-orange/10 transition-colors active:scale-95"
        aria-label="Previous day"
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft className="w-5 h-5 text-iron-white" />
      </motion.button>

      {/* Date Display */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-0">
        <motion.button
          onClick={handleToday}
          className="group flex flex-col items-center justify-center py-2 px-4 hover:bg-iron-gray/10 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-iron-gray group-hover:text-iron-orange transition-colors" />
            <span className="text-sm font-bold text-iron-white tracking-wider truncate">
              {formatDateLabel()}
            </span>
          </div>
          {!isTodaySelected && (
            <span className="text-xs text-iron-gray group-hover:text-iron-orange uppercase tracking-wider mt-0.5">
              Jump to Today
            </span>
          )}
        </motion.button>
      </div>

      {/* Next Day Button */}
      <motion.button
        onClick={handleNextDay}
        disabled={isNextDayFuture()}
        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center border transition-colors active:scale-95 ${
          isNextDayFuture()
            ? 'border-iron-gray/30 cursor-not-allowed opacity-40'
            : 'border-iron-gray hover:border-iron-orange hover:bg-iron-orange/10'
        }`}
        aria-label="Next day"
        whileTap={isNextDayFuture() ? {} : { scale: 0.9 }}
      >
        <ChevronRight className="w-5 h-5 text-iron-white" />
      </motion.button>
    </div>
  )
}
