'use client'

import React from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

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

function formatLabel(mode: Mode, dateStr: string) {
  const d = new Date(dateStr)
  if (mode === 'day') {
    const today = new Date()
    const yest = new Date()
    yest.setDate(today.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yest.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  const { start, end } = getWeekRange(dateStr)
  const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${s} – ${e}`
}

export default function DateRangeControls({ mode, date, onChange, className }: DateRangeControlsProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {/* Previous */}
      <button
        className="p-2 rounded-full border border-iron-gray text-iron-white hover:border-iron-orange/60"
        onClick={() => {
          const d = new Date(date)
          d.setDate(d.getDate() - (mode === 'week' ? 7 : 1))
          onChange(toISODate(d))
        }}
        aria-label={mode === 'week' ? 'Previous week' : 'Previous day'}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Label */}
      <div className="flex-1 text-center text-sm text-iron-white">
        {formatLabel(mode, date)}
      </div>

      {/* Next */}
      <button
        className="p-2 rounded-full border border-iron-gray text-iron-white hover:border-iron-orange/60"
        onClick={() => {
          const d = new Date(date)
          d.setDate(d.getDate() + (mode === 'week' ? 7 : 1))
          onChange(toISODate(d))
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

