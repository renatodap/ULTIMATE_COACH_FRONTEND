'use client'

/**
 * Ask Coach Button
 *
 * Floating button that navigates to Coach from any page
 * Part of Phase 3: Natural Language Navigation
 *
 * Provides quick access to Coach for natural language queries
 * about the current page (nutrition, activities, etc.)
 */

import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'

interface AskCoachButtonProps {
  context?: string  // Optional context to pass to Coach
  position?: 'top-right' | 'bottom-right'
  variant?: 'minimal' | 'prominent'
}

export function AskCoachButton({
  context,
  position = 'top-right',
  variant = 'minimal'
}: AskCoachButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    // If context provided, could store it in localStorage or query params
    // for Coach to pick up and provide contextual help
    if (context) {
      localStorage.setItem('coach_context', context)
    }
    router.push('/coach')
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className={`
          fixed z-40
          ${position === 'top-right' ? 'top-20 right-4' : 'bottom-24 right-4'}
          flex items-center gap-2
          px-3 py-2
          bg-iron-dark-gray border border-iron-gray
          text-iron-gray hover:text-iron-orange hover:border-iron-orange
          rounded-lg
          transition-all duration-200
          active:scale-95
          text-sm font-medium
        `}
        aria-label="Ask Coach"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Ask Coach</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`
        fixed z-40
        ${position === 'top-right' ? 'top-20 right-4' : 'bottom-24 right-4'}
        flex items-center gap-2
        px-4 py-3
        bg-iron-orange text-iron-black
        hover:bg-orange-600
        rounded-lg
        transition-all duration-200
        active:scale-95
        font-medium uppercase tracking-wider text-sm
        shadow-lg
      `}
      aria-label="Ask Coach"
    >
      <MessageCircle className="w-5 h-5" />
      <span>Ask Coach</span>
    </button>
  )
}

/**
 * Inline Ask Coach Link
 * For use within page headers or content sections
 */
export function AskCoachLink() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/coach')}
      className="
        flex items-center gap-2
        text-iron-gray hover:text-iron-orange
        transition-colors
        text-sm
      "
    >
      <MessageCircle className="w-4 h-4" />
      <span>Ask Coach</span>
    </button>
  )
}
