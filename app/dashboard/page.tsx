'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { carouselApi } from '@/lib/api'
import { useBusinessProfile } from '@/hooks/useBusinessProfile'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Sparkles, Clock, CheckCircle, XCircle, BarChart3, User } from 'lucide-react'
import { DashboardSkeleton } from '@/components/skeletons'
import { CarouselProgress } from '@/components/carousel-progress'

export default function DashboardPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Check for business profile
  const { hasProfile, isLoading: isLoadingProfile, isComplete } = useBusinessProfile()

  // Redirect to onboarding if no profile
  useEffect(() => {
    if (!isLoadingProfile && !hasProfile) {
      router.push('/onboarding')
    }
  }, [isLoadingProfile, hasProfile, router])

  const { data: carouselsData, isLoading } = useQuery({
    queryKey: ['carousels', statusFilter],
    queryFn: () => carouselApi.list({ status_filter: statusFilter || undefined }),
  })

  const carousels = carouselsData?.carousels || []

  const statusConfig = {
    pending: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' },
    researching: { icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-100' },
    writing: { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-100' },
    designing: { icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
    failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
    published: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    awaiting_research_approval: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
    awaiting_outline_approval: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
    awaiting_copy_approval: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
    awaiting_hook_approval: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
    awaiting_visual_approval: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage your AI-generated carousels
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
              <Link
                href="/insights"
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                Insights
              </Link>
              <Link
                href="/create"
                className="px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Carousel
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === ''
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'completed'
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'published'
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Published
          </button>
        </div>

        {/* Carousels Grid */}
        {isLoading ? (
          <DashboardSkeleton />
        ) : carousels.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No carousels yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first AI-powered carousel to get started
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Carousel
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carousels.map((carousel: any) => {
              const StatusIcon =
                statusConfig[carousel.status as keyof typeof statusConfig]?.icon ||
                Clock
              const statusColor =
                statusConfig[carousel.status as keyof typeof statusConfig]
                  ?.color || 'text-gray-500'
              const statusBg =
                statusConfig[carousel.status as keyof typeof statusConfig]?.bg ||
                'bg-gray-100'

              const isInProgress = ['pending', 'researching', 'writing', 'designing'].includes(carousel.status)
              const isAwaitingApproval = carousel.status.includes('awaiting') && carousel.status.includes('approval')

              return (
                <div
                  key={carousel.id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-brand-300 hover:shadow-lg transition p-6"
                >
                  <Link href={`/carousel/${carousel.id}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`${statusBg} p-2 rounded-lg`}
                      >
                        <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                      </div>
                      <span className="text-sm text-gray-500">
                        {carousel.slide_count} slides
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      {carousel.topic}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <span className={`text-sm font-medium ${statusColor} capitalize`}>
                        {carousel.status}
                      </span>
                      {carousel.total_cost > 0 && (
                        <span className="text-sm text-gray-500">
                          · ${carousel.total_cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Show progress bar for in-progress carousels */}
                  {isInProgress ? (
                    <div className="mb-4">
                      <CarouselProgress carouselId={carousel.id} showCost={false} className="py-2" />
                    </div>
                  ) : isAwaitingApproval ? (
                    <div className="mb-4">
                      <Link href={`/carousel/${carousel.id}/approval`}>
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm font-semibold text-orange-700 mb-1">
                            ⏳ Approval Required
                          </p>
                          <p className="text-xs text-orange-600">
                            Click to review and approve variants
                          </p>
                        </div>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {carousel.caption || 'No caption yet'}
                    </p>
                  )}

                  <Link href={`/carousel/${carousel.id}`}>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {new Date(carousel.created_at).toLocaleDateString()}
                      </span>
                      {carousel.published_at && (
                        <span className="text-emerald-600 font-medium">
                          Published
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
