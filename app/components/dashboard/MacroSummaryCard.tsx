'use client'

/**
 * Macro Summary Card Component
 *
 * Shows today's macro progress with circular indicators
 * Sharp design, NO rounded corners, mobile-first
 */

import { useRouter } from 'next/navigation'
import type { TodayNutritionSummary } from '@/lib/types/dashboard'

interface MacroSummaryCardProps {
  nutrition: TodayNutritionSummary
}

export default function MacroSummaryCard({ nutrition }: MacroSummaryCardProps) {
  const router = useRouter()

  const calculatePercentage = (current: number, goal: number | null) => {
    if (!goal || goal === 0) return 0
    return Math.min((current / goal) * 100, 100)
  }

  const proteinPercent = calculatePercentage(Number(nutrition.protein_consumed), Number(nutrition.protein_goal))
  const carbsPercent = calculatePercentage(Number(nutrition.carbs_consumed), Number(nutrition.carbs_goal))
  const fatPercent = calculatePercentage(Number(nutrition.fat_consumed), Number(nutrition.fat_goal))

  // Circular progress constants
  const radius = 36
  const circumference = 2 * Math.PI * radius

  const getStrokeDashoffset = (percentage: number) => {
    return circumference - (percentage / 100) * circumference
  }

  return (
    <div className="card-glass border border-iron-gray/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-iron-gray text-xs uppercase tracking-wider">
          🎯 Today's Macros
        </p>
        <button
          onClick={() => router.push('/nutrition')}
          className="text-iron-orange text-xs uppercase tracking-wider hover:underline"
        >
          View All →
        </button>
      </div>

      {/* Macro Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Protein */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-2">
            <svg className="transform -rotate-90 w-24 h-24">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-green-900/30 fill-none"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-green-500 fill-none transition-all duration-500"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={getStrokeDashoffset(proteinPercent)}
                strokeLinecap="butt"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-bold text-green-500">
                {Math.round(Number(nutrition.protein_consumed))}
              </p>
              <p className="text-xs text-iron-gray">
                / {nutrition.protein_goal ? Math.round(Number(nutrition.protein_goal)) : '?'}g
              </p>
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider text-iron-white font-bold">Protein</p>
        </div>

        {/* Carbs */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-2">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-blue-900/30 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-blue-500 fill-none transition-all duration-500"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={getStrokeDashoffset(carbsPercent)}
                strokeLinecap="butt"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-bold text-blue-500">
                {Math.round(Number(nutrition.carbs_consumed))}
              </p>
              <p className="text-xs text-iron-gray">
                / {nutrition.carbs_goal ? Math.round(Number(nutrition.carbs_goal)) : '?'}g
              </p>
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider text-iron-white font-bold">Carbs</p>
        </div>

        {/* Fats */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-2">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-orange-900/30 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-orange-500 fill-none transition-all duration-500"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={getStrokeDashoffset(fatPercent)}
                strokeLinecap="butt"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-bold text-orange-500">
                {Math.round(Number(nutrition.fat_consumed))}
              </p>
              <p className="text-xs text-iron-gray">
                / {nutrition.fat_goal ? Math.round(Number(nutrition.fat_goal)) : '?'}g
              </p>
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider text-iron-white font-bold">Fats</p>
        </div>
      </div>
    </div>
  )
}
