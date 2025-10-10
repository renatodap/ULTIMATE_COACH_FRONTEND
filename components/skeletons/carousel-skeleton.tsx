/**
 * Skeleton loading state for carousel cards.
 *
 * Provides visual feedback while carousel data is loading.
 */
'use client'

export function CarouselCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Topic title */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
          {/* Metadata row */}
          <div className="flex items-center gap-4">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        </div>
        {/* Status badge */}
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>

      {/* Preview images skeleton */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[9/16] bg-gray-200 rounded" />
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {/* Cost indicator */}
          <div className="h-4 bg-gray-200 rounded w-16" />
          {/* Date */}
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
        {/* Action buttons */}
        <div className="flex gap-2">
          <div className="h-9 bg-gray-200 rounded w-20" />
          <div className="h-9 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

export function CarouselListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CarouselCardSkeleton key={i} />
      ))}
    </div>
  )
}
