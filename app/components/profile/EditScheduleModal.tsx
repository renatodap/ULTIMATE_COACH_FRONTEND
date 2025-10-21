'use client'

/**
 * Edit Training Schedule Modal
 *
 * Allows users to update their weekly training availability
 */

import { useState } from 'react'
import { X, Loader2, Calendar } from 'lucide-react'
import { updateFullUserProfile, type FullUserProfile } from '@/lib/api/profile'

interface EditScheduleModalProps {
  profile: FullUserProfile
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedProfile: FullUserProfile) => void
  onError: (error: string) => void
}

type TimeBlock = 'early_morning' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night'

const DAYS = [
  { num: 1, name: 'Monday', short: 'Mon' },
  { num: 2, name: 'Tuesday', short: 'Tue' },
  { num: 3, name: 'Wednesday', short: 'Wed' },
  { num: 4, name: 'Thursday', short: 'Thu' },
  { num: 5, name: 'Friday', short: 'Fri' },
  { num: 6, name: 'Saturday', short: 'Sat' },
  { num: 7, name: 'Sunday', short: 'Sun' },
]

const TIME_BLOCKS: { value: TimeBlock; label: string; time: string }[] = [
  { value: 'early_morning', label: 'Early Morning', time: '5-7 AM' },
  { value: 'morning', label: 'Morning', time: '7-10 AM' },
  { value: 'midday', label: 'Midday', time: '10 AM-2 PM' },
  { value: 'afternoon', label: 'Afternoon', time: '2-5 PM' },
  { value: 'evening', label: 'Evening', time: '5-8 PM' },
  { value: 'night', label: 'Night', time: '8-11 PM' },
]

interface ScheduleSlot {
  day: number
  time_block: string
  duration_minutes?: number
  location_type?: string
}

export default function EditScheduleModal({
  profile,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: EditScheduleModalProps) {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(profile.weekly_schedule || [])
  const [isSaving, setIsSaving] = useState(false)

  const isSlotSelected = (day: number, timeBlock: TimeBlock) => {
    return schedule.some(s => s.day === day && s.time_block === timeBlock)
  }

  const handleToggleSlot = (day: number, timeBlock: TimeBlock) => {
    if (isSlotSelected(day, timeBlock)) {
      // Remove slot
      setSchedule(schedule.filter(s => !(s.day === day && s.time_block === timeBlock)))
    } else {
      // Add slot
      setSchedule([...schedule, {
        day,
        time_block: timeBlock,
        duration_minutes: 60,
        location_type: 'flexible'
      }])
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updated = await updateFullUserProfile({ weekly_schedule: schedule })
      onSuccess(updated)
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update schedule'
      onError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-iron-black/80 backdrop-blur-sm p-4">
      <div className="bg-iron-dark-gray border border-iron-gray rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-iron-dark-gray border-b border-iron-gray p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-iron-orange" />
            <h2 className="text-xl font-heading text-iron-white uppercase tracking-wider">Training Schedule</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-iron-gray/20 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-iron-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          <p className="text-sm text-iron-gray">
            Select the times you&apos;re typically available to train. We&apos;ll use this to schedule your workouts.
          </p>

          {/* Schedule Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-1 mb-1">
                <div className="text-xs text-iron-gray font-medium p-2">Time</div>
                {DAYS.map(day => (
                  <div key={day.num} className="text-xs text-iron-gray font-medium text-center p-2">
                    <span className="hidden sm:inline">{day.name}</span>
                    <span className="sm:hidden">{day.short}</span>
                  </div>
                ))}
              </div>

              {/* Time Block Rows */}
              {TIME_BLOCKS.map(timeBlock => (
                <div key={timeBlock.value} className="grid grid-cols-8 gap-1 mb-1">
                  <div className="text-xs text-iron-white p-2 flex flex-col">
                    <span className="font-medium">{timeBlock.label}</span>
                    <span className="text-iron-gray text-[10px]">{timeBlock.time}</span>
                  </div>
                  {DAYS.map(day => (
                    <button
                      key={`${day.num}-${timeBlock.value}`}
                      onClick={() => handleToggleSlot(day.num, timeBlock.value)}
                      className={`p-3 rounded-lg transition-colors ${
                        isSlotSelected(day.num, timeBlock.value)
                          ? 'bg-iron-orange hover:bg-orange-600'
                          : 'bg-iron-gray/20 hover:bg-iron-gray/40'
                      }`}
                      aria-label={`${day.name} ${timeBlock.label}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-iron-orange" />
              <span className="text-iron-gray">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-iron-gray/20" />
              <span className="text-iron-gray">Not Available</span>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-iron-black/50 rounded-lg text-sm text-iron-gray">
            <span className="text-iron-white font-medium">{schedule.length}</span> training slot{schedule.length !== 1 ? 's' : ''} selected
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-iron-dark-gray border-t border-iron-gray p-4 sm:p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-iron-gray/20 text-iron-white rounded-lg hover:bg-iron-gray/40 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-iron-orange text-iron-black font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
