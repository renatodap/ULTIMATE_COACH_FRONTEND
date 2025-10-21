'use client'

/**
 * Navigation Card Component
 *
 * Displayed by Coach when detecting navigation shortcuts
 * Provides clickable navigation to pages
 *
 * Part of Phase 3: Natural Language Navigation
 */

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import type { CoachShortcut } from '@/lib/utils/coach-shortcuts'

interface NavigationCardProps {
  shortcut: CoachShortcut
  context?: string  // Optional context from Coach
}

export function NavigationCard({ shortcut, context }: NavigationCardProps) {
  const router = useRouter()

  const handleNavigate = () => {
    router.push(shortcut.path)
  }

  return (
    <button
      onClick={handleNavigate}
      className="
        w-full text-left
        bg-iron-dark-gray border border-iron-orange
        rounded-lg p-4
        hover:bg-iron-gray/20
        active:scale-98
        transition-all duration-200
        group
      "
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          <div className="text-3xl">{shortcut.icon}</div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-iron-white font-heading text-base font-medium uppercase tracking-wider">
              {shortcut.title}
            </h3>
            <p className="text-sm text-iron-gray mt-1">
              {context || shortcut.description}
            </p>
          </div>
        </div>

        {/* Arrow */}
        <ArrowRight className="w-5 h-5 text-iron-orange group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  )
}

/**
 * Quick Actions Grid
 * Shows multiple shortcuts at once
 */
interface QuickActionsGridProps {
  shortcuts: CoachShortcut[]
}

export function QuickActionsGrid({ shortcuts }: QuickActionsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {shortcuts.map((shortcut) => (
        <QuickActionButton key={shortcut.path} shortcut={shortcut} />
      ))}
    </div>
  )
}

function QuickActionButton({ shortcut }: { shortcut: CoachShortcut }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(shortcut.path)}
      className="
        bg-iron-dark-gray border border-iron-gray
        rounded-lg p-3
        hover:border-iron-orange hover:bg-iron-gray/10
        active:scale-95
        transition-all duration-200
        flex flex-col items-center gap-2
      "
    >
      <span className="text-2xl">{shortcut.icon}</span>
      <span className="text-xs text-iron-white font-medium uppercase tracking-wider text-center">
        {shortcut.title}
      </span>
    </button>
  )
}
