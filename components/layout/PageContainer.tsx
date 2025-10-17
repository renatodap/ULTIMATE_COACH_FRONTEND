'use client'

/**
 * PageContainer Component
 *
 * Centralized page layout wrapper with mobile-first optimizations.
 * Ensures consistent spacing, bottom nav integration, and scroll behavior.
 *
 * Features:
 * - Flexible bottom spacing presets (none, minimal, default, generous)
 * - Optional auto-hide bottom nav on scroll
 * - Ensures content doesn't get hidden behind nav
 * - Mobile-optimized padding and safe areas
 *
 * Usage:
 * ```tsx
 * <PageContainer bottomSpacing="generous" hideNavOnScroll={true}>
 *   <YourPageContent />
 * </PageContainer>
 * ```
 */

import { ReactNode } from 'react'
import { BottomNav } from '@/components/BottomNav'

interface PageContainerProps {
  children: ReactNode
  /**
   * Bottom spacing presets:
   * - none: 0px (use when page has fixed bottom elements)
   * - minimal: 80px (standard nav height + small gap)
   * - default: 128px (nav height + comfortable gap)
   * - generous: 160px (nav height + over-scroll space) - Recommended for lists
   */
  bottomSpacing?: 'none' | 'minimal' | 'default' | 'generous'
  /**
   * Enable auto-hide bottom nav on scroll.
   * Set to false on pages with fixed bottom inputs (e.g., Coach page).
   */
  hideNavOnScroll?: boolean
  /**
   * Additional className for the container.
   */
  className?: string
}

export function PageContainer({
  children,
  bottomSpacing = 'default',
  hideNavOnScroll = true,
  className = '',
}: PageContainerProps) {
  const spacingClasses = {
    none: 'pb-0',       // 0px - No bottom padding
    minimal: 'pb-20',   // 80px - Nav height (64px) + 16px
    default: 'pb-32',   // 128px - Nav height + 64px gap
    generous: 'pb-40',  // 160px - Nav height + 96px over-scroll
  }

  return (
    <div className={`min-h-screen bg-iron-black ${spacingClasses[bottomSpacing]} ${className}`}>
      {children}
      <BottomNav hideOnScroll={hideNavOnScroll} />
    </div>
  )
}

/**
 * Page Layout Guidelines (Mobile-First):
 *
 * List Pages (Activities, Nutrition, Weight, Profile):
 * - Use bottomSpacing="generous" (160px)
 * - Allows comfortable over-scroll past last item
 * - User can bring last item to thumb zone
 *
 * Dashboard:
 * - Use bottomSpacing="generous" (160px)
 * - Multiple cards benefit from over-scroll space
 *
 * Coach Chat:
 * - Use bottomSpacing="minimal" (80px)
 * - Input handles spacing, not container
 * - Set hideNavOnScroll={false} (input always needs nav visible)
 *
 * Log/Form Pages (Nutrition Log, Activity Log):
 * - Use bottomSpacing="generous" (160px)
 * - Forms often have multiple inputs
 * - Sticky submit button above nav
 *
 * Full-Screen Modals:
 * - Use bottomSpacing="none" (0px)
 * - Modal controls its own padding
 */
