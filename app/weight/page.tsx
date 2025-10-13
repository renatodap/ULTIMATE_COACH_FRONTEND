'use client'

/**
 * Weight History Page
 *
 * Shows weight tracking history with trend visualization
 * Sharp design, NO rounded corners, mobile-first
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBodyMetrics, deleteBodyMetric } from '@/lib/api/body-metrics'
import type { BodyMetric } from '@/lib/types/body-metrics'
import { BottomNav } from '@/components/BottomNav'
import WeightLogModal from '@/app/components/dashboard/WeightLogModal'

export default function WeightHistoryPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<BodyMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weightModalOpen, setWeightModalOpen] = useState(false)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getBodyMetrics({ limit: 100 })
      setMetrics(response.metrics)
    } catch (err) {
      console.error('Failed to load weight history:', err)
      setError('Failed to load weight history. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this weight entry?')) return

    try {
      await deleteBodyMetric(id)
      await loadMetrics()
    } catch (err) {
      console.error('Failed to delete weight entry:', err)
      alert('Failed to delete weight entry. Please try again.')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-iron-black pb-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="h-16 bg-iron-dark-gray border border-iron-gray/30 mb-4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-iron-dark-gray border border-iron-gray/30 animate-pulse" />
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iron-black pb-20">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-iron-black border-b border-iron-gray/30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-iron-gray hover:text-iron-white transition mb-3 uppercase tracking-wider text-sm"
            aria-label="Back to dashboard"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-iron-white uppercase tracking-wider">Weight History</h1>
              <p className="text-sm text-iron-gray mt-1 uppercase tracking-wider">
                Track your progress over time
              </p>
            </div>
            <button
              onClick={() => setWeightModalOpen(true)}
              className="btn-primary px-4 py-2 text-sm"
            >
              + Log Weight
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 mb-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Weight History List */}
        {metrics.length === 0 ? (
          // Empty State
          <div className="card-glass border border-iron-gray/30 p-12 text-center">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-xl font-semibold text-iron-white mb-2 uppercase tracking-wider">
              No Weight Entries Yet
            </h3>
            <p className="text-iron-gray mb-6 max-w-md mx-auto">
              Start tracking your weight to see your progress over time
            </p>
            <button
              onClick={() => setWeightModalOpen(true)}
              className="btn-primary px-6 py-3"
            >
              Log Your First Weight
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.map((metric, index) => {
              // Calculate change from previous entry
              const prevMetric = metrics[index + 1]
              const change = prevMetric ? metric.weight_kg - prevMetric.weight_kg : null

              return (
                <div
                  key={metric.id}
                  className="card-glass border border-iron-gray/30 p-4 hover:border-iron-orange/50 transition"
                >
                  <div className="flex items-start justify-between">
                    {/* Weight Info */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-1">
                        <p className="text-3xl font-bold text-iron-white">
                          {metric.weight_kg.toFixed(1)}
                        </p>
                        <span className="text-sm text-iron-gray uppercase tracking-wider">kg</span>

                        {/* Change Indicator */}
                        {change !== null && (
                          <span
                            className={`text-sm font-medium ${
                              change > 0
                                ? 'text-red-500'
                                : change < 0
                                ? 'text-green-500'
                                : 'text-iron-gray'
                            }`}
                          >
                            {change > 0 ? '↑' : change < 0 ? '↓' : '='}{' '}
                            {Math.abs(change).toFixed(1)} kg
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-iron-gray uppercase tracking-wider">
                        <span>{formatDate(metric.recorded_at)}</span>
                        <span>•</span>
                        <span>{formatTime(metric.recorded_at)}</span>
                      </div>

                      {/* Notes */}
                      {metric.notes && (
                        <p className="text-sm text-iron-gray mt-2 italic">
                          "{metric.notes}"
                        </p>
                      )}

                      {/* Body Fat */}
                      {metric.body_fat_percentage && (
                        <p className="text-xs text-iron-gray mt-2 uppercase tracking-wider">
                          Body Fat: {metric.body_fat_percentage}%
                        </p>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(metric.id)}
                      className="text-iron-gray hover:text-red-500 transition ml-4"
                      aria-label="Delete entry"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary Stats */}
        {metrics.length > 1 && (
          <div className="card-glass border border-iron-gray/30 p-6 mt-6">
            <p className="text-iron-gray text-xs uppercase tracking-wider mb-4">
              Summary
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-iron-gray mb-1 uppercase tracking-wider">Total Entries</p>
                <p className="text-2xl font-bold text-iron-white">{metrics.length}</p>
              </div>
              <div>
                <p className="text-sm text-iron-gray mb-1 uppercase tracking-wider">Total Change</p>
                <p className={`text-2xl font-bold ${
                  metrics[0].weight_kg - metrics[metrics.length - 1].weight_kg < 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}>
                  {(metrics[0].weight_kg - metrics[metrics.length - 1].weight_kg).toFixed(1)} kg
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Weight Log Modal */}
      <WeightLogModal
        isOpen={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        onSuccess={loadMetrics}
      />
    </div>
  )
}
