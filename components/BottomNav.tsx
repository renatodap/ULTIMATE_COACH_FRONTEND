'use client'

/**
 * Bottom Navigation Component
 *
 * Fixed bottom navigation bar for mobile-first navigation.
 * Features:
 * - Glass morphism design with active state indicators
 * - Auto-hide on scroll down (reclaim 64px screen space)
 * - Show on scroll up or when near page top
 * - Smooth transitions for professional feel
 */

import { usePathname, useRouter } from 'next/navigation'
import { FEATURE_PLAN_IN_NAV } from '@/lib/constants/features'
import { useScrollDirection } from '@/hooks/useScrollDirection'

interface BottomNavProps {
  hideOnScroll?: boolean
}

export function BottomNav({ hideOnScroll = true }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const scrollDirection = useScrollDirection()

  // Week 1 MVP: Only Coach and Settings for ruthless scope cut
  const coachTab = {
    name: 'Coach',
    path: '/coach',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  }

  const settingsTab = {
    name: 'Settings',
    path: '/settings',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  }

  const tabs = [coachTab, settingsTab]

  const isActive = (path: string) => {
    return pathname?.startsWith(path)
  }

  // Determine if nav should be hidden
  const shouldHide = hideOnScroll && scrollDirection === 'down'

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-[300]
        bg-iron-black border-t border-iron-gray/30
        transition-transform duration-300 ease-in-out
        ${shouldHide ? 'translate-y-full' : 'translate-y-0'}
      `}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const active = isActive(tab.path)
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`
                  flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-0 flex-1
                  tap-target focus-ring-iron active-press
                  transition-all duration-200
                  ${active ? 'text-iron-white accent-edge' : 'text-iron-gray/60 hover:text-iron-white'}
                `}
              >
                {/* Icon */}
                <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  {tab.icon}
                </div>

                {/* Label */}
                <span className={`text-[11px] font-medium uppercase tracking-wider ${
                  active ? 'font-bold' : ''
                }`}>
                  {tab.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
