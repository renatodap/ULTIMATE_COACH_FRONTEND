/**
 * Activity Type Icon Component
 *
 * Maps activity categories to emoji icons for visual differentiation
 */

import type { ActivityCategory } from '@/lib/types/activities'
import { ACTIVITY_CATEGORIES } from '@/lib/types/activities'

interface ActivityTypeIconProps {
  category: ActivityCategory
  size?: 'sm' | 'md' | 'lg'
}

export default function ActivityTypeIcon({ category, size = 'md' }: ActivityTypeIconProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  const meta = ACTIVITY_CATEGORIES[category] || ACTIVITY_CATEGORIES.other

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
      {meta.icon}
    </div>
  )
}
