/**
 * Skeleton loading state for dashboard page.
 *
 * Shows loading state for stats cards and carousel list.
 */
'use client'

import { CarouselListSkeleton } from './carousel-skeleton'

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      {/* Label */}
      <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
      {/* Value */}
      <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
      {/* Trend indicator */}
      <div className="h-3 bg-gray-200 rounded w-20" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
        <div className="h-10 bg-gray-200 rounded w-40 animate-pulse" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Filters and tabs skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 bg-gray-200 rounded w-24 animate-pulse" />
          ))}
        </div>
        <div className="h-9 bg-gray-200 rounded w-48 animate-pulse" />
      </div>

      {/* Carousel list skeleton */}
      <CarouselListSkeleton count={3} />

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="h-9 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-9 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-9 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
    </div>
  )
}
