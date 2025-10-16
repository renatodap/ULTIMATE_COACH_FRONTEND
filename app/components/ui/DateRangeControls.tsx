'use client'

import React from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTimezone } from '@/lib/context/TimezoneContext'
import { formatDateInTimezone, formatRelativeDate, addDaysInTimezone } from '@/lib/utils/timezone'

type Mode = 'day' | 'week'

interface DateRangeControlsProps {
  mode: Mode
  date: string // YYYY-MM-DD
  onChange: (newDate: string) => void
  className?: string
}

function toISODate(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getWeekRange(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDay() === 0 ? 7 : d.getDay()
  const start = new Date(d)
  start.setDate(d.getDate() - (day - 1))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start: toISODate(start), end: toISODate(end) }
}

function formatLabel(mode: Mode, dateStr: string, timezone: string) {
  if (mode === 'day') {
    // Use timezone-aware relative date formatting
    return formatRelativeDate(dateStr, timezone)
  }
  // For week mode, format start and end dates
  const { start, end } = getWeekRange(dateStr)
  const startFormatted = formatDateInTimezone(start, timezone)
  const endFormatted = formatDateInTimezone(end, timezone)
  return `${startFormatted} – ${endFormatted}`
}

export default function DateRangeControls({ mode, date, onChange, className }: DateRangeControlsProps) {
  const { timezone } = useTimezone()
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {/* Previous */}
      <button
        className="p-2 rounded-full border border-iron-gray text-iron-white hover:border-iron-orange/60"
        onClick={() => {
          const days = mode === 'week' ? 7 : 1
          const newDate = addDaysInTimezone(date, -days, timezone)
          onChange(newDate)
        }}
        aria-label={mode === 'week' ? 'Previous week' : 'Previous day'}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Label */}
      <div className="flex-1 text-center text-sm text-iron-white">
        {formatLabel(mode, date, timezone)}
      </div>

      {/* Next */}
      <button
        className="p-2 rounded-full border border-iron-gray text-iron-white hover:border-iron-orange/60"
        onClick={() => {
          const days = mode === 'week' ? 7 : 1
          const newDate = addDaysInTimezone(date, days, timezone)
          onChange(newDate)
        }}
        aria-label={mode === 'week' ? 'Next week' : 'Next day'}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Date picker */}
      <div className="ml-1">
        <label className="sr-only" htmlFor="date-range-input">Select date</label>
        <div className="flex items-center gap-1">
          <Calendar className="w-5 h-5 text-iron-white/70" />
          <input
            id="date-range-input"
            type="date"
            className="bg-iron-dark-gray border border-iron-gray rounded-lg px-2 py-1 text-iron-white text-sm focus:outline-none focus:border-iron-orange"
            value={date}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

