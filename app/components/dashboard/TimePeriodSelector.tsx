'use client'

/**
 * Time Period Selector - SWIPE NAVIGATION
 *
 * Intuitive: Swipe left/right to change time period
 * Mobile-first: Natural gesture everyone knows
 * Easy to use: Visual dots show current period
 *
 * Periods: Today → This Week → This Month
 */

import { motion } from 'framer-motion'

export type TimePeriod = 'today' | 'week' | 'month'

interface TimePeriodSelectorProps {
  currentPeriod: TimePeriod
  onChange: (period: TimePeriod) => void
}

export default function TimePeriodSelector({ currentPeriod, onChange }: TimePeriodSelectorProps) {
  const periods: { value: TimePeriod; label: string; emoji: string }[] = [
    { value: 'today', label: 'Today', emoji: '📅' },
    { value: 'week', label: 'This Week', emoji: '📊' },
    { value: 'month', label: 'This Month', emoji: '📈' },
  ]

  const currentIndex = periods.findIndex(p => p.value === currentPeriod)

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {/* Period Tabs */}
      <div className="flex items-center gap-2 bg-iron-dark-gray border border-iron-gray/30 p-1">
        {periods.map((period, index) => {
          const isActive = period.value === currentPeriod
          return (
            <button
              key={period.value}
              onClick={() => onChange(period.value)}
              className={`
                relative px-4 py-2 sm:px-6 sm:py-3
                min-w-[100px] sm:min-w-[120px]
                transition-all duration-200
                ${isActive ? 'text-iron-white' : 'text-iron-gray hover:text-iron-white'}
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-iron-orange"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <span className="text-xl">{period.emoji}</span>
                <span className="text-xs uppercase tracking-wider font-bold">
                  {period.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
