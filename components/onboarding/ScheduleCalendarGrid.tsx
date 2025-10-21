'use client'

import { useState } from 'react'
import { Star, Clock } from 'lucide-react'
import { TrainingAvailabilitySlot } from '@/lib/api/onboarding'

interface ScheduleCalendarGridProps {
  availabilitySlots: TrainingAvailabilitySlot[]
  onChange: (slots: TrainingAvailabilitySlot[]) => void
}

const DAYS = [
  { value: 1, label: 'Mon', short: 'M' },
  { value: 2, label: 'Tue', short: 'T' },
  { value: 3, label: 'Wed', short: 'W' },
  { value: 4, label: 'Thu', short: 'T' },
  { value: 5, label: 'Fri', short: 'F' },
  { value: 6, label: 'Sat', short: 'S' },
  { value: 7, label: 'Sun', short: 'S' }
]

const TIME_SLOTS = [
  { value: 'early_morning', label: 'Early Morning', time: '5-7 AM' },
  { value: 'morning', label: 'Morning', time: '7-10 AM' },
  { value: 'midday', label: 'Midday', time: '10 AM-2 PM' },
  { value: 'afternoon', label: 'Afternoon', time: '2-5 PM' },
  { value: 'evening', label: 'Evening', time: '5-8 PM' },
  { value: 'night', label: 'Night', time: '8-11 PM' }
] as const

export default function ScheduleCalendarGrid({
  availabilitySlots,
  onChange
}: ScheduleCalendarGridProps) {
  const [selectedSlot, setSelectedSlot] = useState<{day: number; time: typeof TIME_SLOTS[number]['value']} | null>(null)
  const [showDetailsFor, setShowDetailsFor] = useState<string | null>(null)

  // Check if a slot exists
  const getSlot = (day: number, time: typeof TIME_SLOTS[number]['value']) => {
    return availabilitySlots.find(
      s => s.day_of_week === day && s.time_of_day === time
    )
  }

  // Toggle slot selection
  const handleToggleSlot = (day: number, time: typeof TIME_SLOTS[number]['value']) => {
    const existing = getSlot(day, time)

    if (existing) {
      // Remove slot
      onChange(availabilitySlots.filter(s => !(s.day_of_week === day && s.time_of_day === time)))
      setShowDetailsFor(null)
    } else {
      // Add new slot with defaults
      const newSlot: TrainingAvailabilitySlot = {
        day_of_week: day,
        time_of_day: time,
        typical_duration_minutes: 60,
        location_type: 'gym',
        is_preferred: false
      }
      onChange([...availabilitySlots, newSlot])
      setSelectedSlot({ day, time })
      setShowDetailsFor(`${day}-${time}`)
    }
  }

  // Update slot details
  const handleUpdateSlot = (
    day: number,
    time: typeof TIME_SLOTS[number]['value'],
    updates: Partial<TrainingAvailabilitySlot>
  ) => {
    onChange(
      availabilitySlots.map(s =>
        s.day_of_week === day && s.time_of_day === time
          ? { ...s, ...updates }
          : s
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header - Days */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-xs text-iron-gray font-medium">{/* Empty corner */}</div>
            {DAYS.map(day => (
              <div key={day.value} className="text-center">
                <div className="text-iron-white font-medium hidden sm:block">{day.label}</div>
                <div className="text-iron-white font-medium sm:hidden">{day.short}</div>
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          {TIME_SLOTS.map(timeSlot => (
            <div key={timeSlot.value} className="grid grid-cols-8 gap-2 mb-2">
              {/* Time Label */}
              <div className="flex items-center">
                <div className="text-xs text-iron-gray">
                  <div className="hidden sm:block">{timeSlot.label}</div>
                  <div className="sm:hidden text-[10px]">{timeSlot.time}</div>
                </div>
              </div>

              {/* Day Cells */}
              {DAYS.map(day => {
                const slot = getSlot(day.value, timeSlot.value)
                const isSelected = slot !== undefined
                const isShowingDetails = showDetailsFor === `${day.value}-${timeSlot.value}`

                return (
                  <button
                    key={`${day.value}-${timeSlot.value}`}
                    onClick={() => handleToggleSlot(day.value, timeSlot.value)}
                    className={`relative h-12 sm:h-14 rounded-lg transition-all ${
                      isSelected
                        ? isShowingDetails
                          ? 'bg-iron-orange text-iron-black ring-2 ring-iron-orange'
                          : 'bg-iron-orange/80 text-iron-black hover:bg-iron-orange'
                        : 'bg-iron-dark-gray hover:bg-iron-gray/40 text-iron-gray'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {slot?.is_preferred && (
                          <Star className="w-4 h-4 fill-current" />
                        )}
                        {!slot?.is_preferred && (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Slot Details */}
      {selectedSlot && getSlot(selectedSlot.day, selectedSlot.time) && (
        <div className="p-4 bg-iron-dark-gray border border-iron-orange rounded-lg space-y-4">
          <h3 className="text-iron-white font-medium flex items-center gap-2">
            <Clock className="w-5 h-5 text-iron-orange" />
            {DAYS.find(d => d.value === selectedSlot.day)?.label}{' '}
            {TIME_SLOTS.find(t => t.value === selectedSlot.time)?.label}
          </h3>

          {/* Duration */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">
              Typical Duration (minutes)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map(duration => {
                const slot = getSlot(selectedSlot.day, selectedSlot.time)
                return (
                  <button
                    key={duration}
                    onClick={() =>
                      handleUpdateSlot(selectedSlot.day, selectedSlot.time, {
                        typical_duration_minutes: duration
                      })
                    }
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      slot?.typical_duration_minutes === duration
                        ? 'bg-iron-orange text-iron-black'
                        : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                    }`}
                  >
                    {duration}m
                  </button>
                )
              })}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm text-iron-gray mb-2">Location</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['home', 'gym', 'outdoor', 'flexible'] as const).map(location => {
                const slot = getSlot(selectedSlot.day, selectedSlot.time)
                return (
                  <button
                    key={location}
                    onClick={() =>
                      handleUpdateSlot(selectedSlot.day, selectedSlot.time, {
                        location_type: location
                      })
                    }
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      slot?.location_type === location
                        ? 'bg-iron-orange text-iron-black'
                        : 'bg-iron-gray/20 text-iron-white hover:bg-iron-gray/40'
                    }`}
                  >
                    {location.charAt(0).toUpperCase() + location.slice(1)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preferred Slot */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={getSlot(selectedSlot.day, selectedSlot.time)?.is_preferred || false}
                onChange={(e) =>
                  handleUpdateSlot(selectedSlot.day, selectedSlot.time, {
                    is_preferred: e.target.checked
                  })
                }
                className="w-5 h-5 rounded border-iron-gray bg-iron-black text-iron-orange focus:ring-2 focus:ring-iron-orange focus:ring-offset-2 focus:ring-offset-iron-dark-gray"
              />
              <span className="text-sm text-iron-white flex items-center gap-1">
                <Star className="w-4 h-4" />
                Mark as preferred time
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-iron-gray">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-iron-orange rounded flex items-center justify-center">
            <Star className="w-4 h-4 text-iron-black fill-current" />
          </div>
          <span>Preferred time</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-iron-orange/80 rounded flex items-center justify-center">
            <Clock className="w-4 h-4 text-iron-black" />
          </div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-iron-dark-gray rounded"></div>
          <span>Not available</span>
        </div>
      </div>

      {/* Summary */}
      {availabilitySlots.length > 0 && (
        <div className="p-4 bg-iron-dark-gray/50 rounded-lg">
          <p className="text-sm text-iron-gray">
            <span className="text-iron-white font-medium">{availabilitySlots.length}</span>{' '}
            time slots selected
            {availabilitySlots.filter(s => s.is_preferred).length > 0 && (
              <span>
                {' '}
                • <span className="text-iron-orange">{availabilitySlots.filter(s => s.is_preferred).length}</span> preferred
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
