/**
 * Skeleton loading state for carousel slides.
 *
 * Used in slide editor and detail views.
 */
'use client'

export function SlideSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      {/* Slide preview */}
      <div className="aspect-[9/16] bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
        <div className="text-gray-400">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Slide metadata */}
      <div className="space-y-3">
        {/* Position and purpose */}
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-24" />
          <div className="h-5 bg-gray-200 rounded-full w-16" />
        </div>

        {/* Headline */}
        <div className="h-6 bg-gray-200 rounded w-full" />

        {/* Body text lines */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>

        {/* Callouts */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-24" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        <div className="h-9 bg-gray-200 rounded flex-1" />
        <div className="h-9 bg-gray-200 rounded flex-1" />
      </div>
    </div>
  )
}

export function SlideListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SlideSkeleton key={i} />
      ))}
    </div>
  )
}
