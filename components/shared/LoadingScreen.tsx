/**
 * LoadingScreen - Standardized loading component
 *
 * Used across all pages for consistent loading experience
 * Two variants:
 * - full: Full-screen centered loading (for page loads)
 * - inline: Inline loading (for component-level loads)
 */

import { Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  variant?: 'full' | 'inline'
  showBottomNav?: boolean
}

export function LoadingScreen({
  message = 'Loading...',
  variant = 'full',
  showBottomNav = false
}: LoadingScreenProps) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-iron-orange animate-spin mx-auto mb-3" />
          <p className="text-iron-gray text-sm uppercase tracking-wider">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Top Progress Indicator */}
      <div className="top-progress-iron" />
      
      <div className={`min-h-screen bg-iron-black surface-elevated flex items-center justify-center ${showBottomNav ? 'pb-20' : ''}`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-iron-orange animate-spin mx-auto mb-4" />
          <p className="text-iron-gray uppercase tracking-wider">{message}</p>
        </div>
      </div>
    </>
  )
}

/**
 * SkeletonCard - Loading placeholder for content cards
 * Used for data loading states to show page structure
 */
export function SkeletonCard({ height = 'h-40' }: { height?: string }) {
  return (
    <div className={`${height} skeleton-iron border border-iron-gray/30`} />
  )
}

/**
 * SkeletonGrid - Multiple skeleton cards
 */
export function SkeletonGrid({ count = 5, height = 'h-40' }: { count?: number; height?: string }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} height={height} />
      ))}
    </div>
  )
}
