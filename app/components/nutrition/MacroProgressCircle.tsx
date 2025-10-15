'use client'

import React from 'react'

/**
 * MacroProgressCircle Component
 *
 * Displays a circular progress indicator for macronutrient tracking.
 * Used in the daily summary card to show protein/carbs/fats progress.
 *
 * Features:
 * - Circular SVG progress ring
 * - Color-coded by macro type (protein=green, carbs=blue, fats=orange)
 * - Shows current/target values
 * - Responsive text sizing
 */

import type { MacroProgressCircleProps } from '@/lib/types/nutrition'
import { calculatePercentage } from '@/lib/utils/macro-calculator'

const colorMap = {
  success: {
    ring: 'stroke-green-500',
    text: 'text-green-500',
    bg: 'stroke-green-900/30',
  },
  info: {
    ring: 'stroke-blue-500',
    text: 'text-blue-500',
    bg: 'stroke-blue-900/30',
  },
  warning: {
    ring: 'stroke-orange-500',
    text: 'text-orange-500',
    bg: 'stroke-orange-900/30',
  },
}

export default function MacroProgressCircle({
  label,
  current,
  target,
  color,
}: MacroProgressCircleProps) {
  const percentage = calculatePercentage(current, target)
  const circumference = 2 * Math.PI * 36 // radius = 36
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const colors = colorMap[color]
  const isOver = current > target

  return (
    <div className="flex flex-col items-center">
      {/* SVG Circle */}
      <div className="relative w-24 h-24">
        <svg className="transform -rotate-90 w-24 h-24">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r="36"
            className={`${colors.bg} fill-none`}
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r="36"
            className={`${colors.ring} fill-none transition-all duration-500 ease-out`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className={`text-xl font-bold ${colors.text}`}>
            {Math.round(current)}
          </p>
          <p className="text-xs text-iron-gray">
            / {Math.round(target)}g
          </p>
        </div>
      </div>

      {/* Label */}
      <p className="text-sm text-iron-white font-medium mt-2 uppercase tracking-wider">
        {label}
      </p>

      {/* Percentage or Over Indicator */}
      <p className={`text-xs mt-1 ${isOver ? 'text-red-500' : 'text-iron-gray'}`}>
        {isOver ? `+${Math.round(current - target)}g` : `${percentage}%`}
      </p>
    </div>
  )
}
