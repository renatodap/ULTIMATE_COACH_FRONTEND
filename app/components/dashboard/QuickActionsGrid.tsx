'use client'

/**
 * Quick Actions Grid Component
 *
 * Large touch-friendly buttons for main actions
 * Sharp design, NO rounded corners, mobile-first
 */

import { useRouter } from 'next/navigation'

interface QuickActionsGridProps {
  onLogWeight: () => void
}

export default function QuickActionsGrid({ onLogWeight }: QuickActionsGridProps) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Log Meal */}
      <button
        onClick={() => router.push('/nutrition/log')}
        className="card-glass border border-iron-gray/30 p-6 hover:border-iron-orange transition-colors active:scale-95 min-h-[100px] flex flex-col items-center justify-center gap-2"
      >
        <div className="text-3xl">🍽️</div>
        <p className="text-xs uppercase tracking-wider text-iron-white font-bold text-center">
          Log Meal
        </p>
      </button>

      {/* Log Activity */}
      <button
        onClick={() => router.push('/activities/log')}
        className="card-glass border border-iron-gray/30 p-6 hover:border-iron-orange transition-colors active:scale-95 min-h-[100px] flex flex-col items-center justify-center gap-2"
      >
        <div className="text-3xl">💪</div>
        <p className="text-xs uppercase tracking-wider text-iron-white font-bold text-center">
          Log Activity
        </p>
      </button>

      {/* Log Weight */}
      <button
        onClick={onLogWeight}
        className="card-glass border border-iron-gray/30 p-6 hover:border-iron-orange transition-colors active:scale-95 min-h-[100px] flex flex-col items-center justify-center gap-2"
      >
        <div className="text-3xl">⚖️</div>
        <p className="text-xs uppercase tracking-wider text-iron-white font-bold text-center">
          Log Weight
        </p>
      </button>
    </div>
  )
}
