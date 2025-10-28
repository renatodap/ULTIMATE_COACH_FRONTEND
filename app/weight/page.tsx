'use client'

/**
 * Weight Tracking Page
 *
 * Displays user's weight history with chart visualization and daily entries.
 * Features: View weight history, visualize trends, delete with undo, log new weight
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO, differenceInDays } from 'date-fns'
import { getBodyMetrics, getWeightTrend, deleteBodyMetric } from '@/lib/api/body-metrics'
import type { BodyMetric, WeightTrend } from '@/lib/types/body-metrics'
import { Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import WeightLogModal from '@/app/components/dashboard/WeightLogModal'

export default function WeightPage() {
  const router = useRouter()

  // State
  const [metrics, setMetrics] = useState<BodyMetric[]>([])
  const [trend, setTrend] = useState<WeightTrend | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLogModal, setShowLogModal] = useState(false)

  // Delete state (with undo support)
  const [deletingMetricId, setDeletingMetricId] = useState<string | null>(null)
  const [undoState, setUndoState] = useState<{ metric: BodyMetric; timeoutId: NodeJS.Timeout } | null>(null)

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch metrics and trend in parallel
      const [metricsData, trendData] = await Promise.all([
        getBodyMetrics({ limit: 100 }),
        getWeightTrend({ days: 7 }).catch(() => null) // Trend may not exist for new users
      ])

      setMetrics(metricsData.metrics)
      setTrend(trendData)
    } catch (err) {
      console.error('Failed to fetch weight data:', err)
      setError('Failed to load weight data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Delete metric with undo
  const handleDelete = async (metricId: string) => {
    // Cancel any existing undo timeout
    if (undoState) {
      clearTimeout(undoState.timeoutId)
      setUndoState(null)
    }

    // Find metric to delete
    const metric = metrics.find(m => m.id === metricId)
    if (!metric) return

    // Optimistic update - remove from UI
    setMetrics(prev => prev.filter(m => m.id !== metricId))
    setDeletingMetricId(metricId)

    // Set up undo window (10 seconds)
    const timeoutId = setTimeout(async () => {
      // Actually delete after 10 seconds
      try {
        await deleteBodyMetric(metricId)
        setDeletingMetricId(null)
        setUndoState(null)

        // Refresh trend after actual delete
        const trendData = await getWeightTrend({ days: 7 }).catch(() => null)
        setTrend(trendData)
      } catch (err) {
        console.error('Failed to delete metric:', err)
        // Restore on error
        setMetrics(prev => [...prev, metric].sort((a, b) =>
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        ))
        setError('Failed to delete entry')
        setDeletingMetricId(null)
        setUndoState(null)
      }
    }, 10000)

    setUndoState({ metric, timeoutId })
  }

  // Undo delete
  const handleUndo = () => {
    if (!undoState) return

    clearTimeout(undoState.timeoutId)
    setMetrics(prev => [...prev, undoState.metric].sort((a, b) =>
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    ))
    setDeletingMetricId(null)
    setUndoState(null)
  }

  // Handle successful log
  const handleLogSuccess = () => {
    fetchData()
  }

  // Chart data preparation
  const chartData = metrics.slice(0, 30).reverse() // Last 30 entries, oldest first for chart
  const minWeight = chartData.length > 0 ? Math.min(...chartData.map(m => m.weight_kg)) : 0
  const maxWeight = chartData.length > 0 ? Math.max(...chartData.map(m => m.weight_kg)) : 100
  const weightRange = maxWeight - minWeight
  const chartPadding = weightRange * 0.1 || 5 // 10% padding or 5kg default

  // Trend icon and color
  const getTrendIcon = () => {
    if (!trend) return <Minus className="w-6 h-6" />
    if (trend.trend_direction === 'up') return <TrendingUp className="w-6 h-6" />
    if (trend.trend_direction === 'down') return <TrendingDown className="w-6 h-6" />
    return <Minus className="w-6 h-6" />
  }

  const getTrendColor = () => {
    if (!trend) return 'text-iron-gray'
    if (trend.trend_direction === 'up') return 'text-red-400'
    if (trend.trend_direction === 'down') return 'text-green-400'
    return 'text-iron-gray'
  }

  return (
    <div className="min-h-screen bg-iron-black text-iron-white pb-40">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-iron-black/95 backdrop-blur-sm border-b border-iron-gray/20">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Weight Tracking</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iron-orange" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-sm text-iron-orange hover:underline"
            >
              Try again
            </button>
          </div>
        ) : metrics.length === 0 ? (
          // Empty state
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚖️</div>
            <h2 className="text-xl font-bold mb-2">No Weight Logged Yet</h2>
            <p className="text-iron-gray mb-6">
              Start tracking your weight to see your progress
            </p>
            <button
              onClick={() => setShowLogModal(true)}
              className="px-6 py-3 bg-iron-orange text-iron-black font-semibold hover:bg-iron-orange/90 transition-colors"
            >
              Log First Weight
            </button>
          </div>
        ) : (
          <>
            {/* Current Weight & Trend Summary */}
            {trend && (
              <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray/30 mb-6">
                <h2 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-4">
                  Current Status
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Current Weight */}
                  <div>
                    <p className="text-xs text-iron-gray mb-1">Current</p>
                    <p className="text-3xl font-bold text-iron-white">
                      {trend.current_weight.toFixed(1)}
                    </p>
                    <p className="text-xs text-iron-gray">kg</p>
                  </div>

                  {/* 7-Day Change */}
                  <div>
                    <p className="text-xs text-iron-gray mb-1">7-Day Change</p>
                    <div className="flex items-center gap-2">
                      <div className={getTrendColor()}>
                        {getTrendIcon()}
                      </div>
                      <div>
                        <p className={`text-lg font-bold ${getTrendColor()}`}>
                          {trend.change_kg > 0 ? '+' : ''}{trend.change_kg.toFixed(1)} kg
                        </p>
                        <p className="text-xs text-iron-gray">
                          {trend.change_percentage > 0 ? '+' : ''}{trend.change_percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Average */}
                <div className="pt-4 border-t border-iron-gray/30">
                  <p className="text-xs text-iron-gray mb-1">Avg Weekly Change</p>
                  <p className="text-sm text-iron-white">
                    {trend.avg_change_per_week > 0 ? '+' : ''}{trend.avg_change_per_week.toFixed(2)} kg/week
                  </p>
                </div>
              </div>
            )}

            {/* Simple Line Chart */}
            {chartData.length >= 2 && (
              <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray/30 mb-6">
                <h2 className="text-sm font-medium text-iron-gray uppercase tracking-wider mb-4">
                  Weight History (Last 30 Entries)
                </h2>

                <div className="relative h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeWidth="0.2" className="text-iron-gray/30" />
                    <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="0.2" className="text-iron-gray/30" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.2" className="text-iron-gray/30" />
                    <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeWidth="0.2" className="text-iron-gray/30" />
                    <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" strokeWidth="0.2" className="text-iron-gray/30" />

                    {/* Line chart */}
                    <polyline
                      points={chartData.map((metric, index) => {
                        const x = (index / (chartData.length - 1)) * 100
                        const y = ((maxWeight + chartPadding - metric.weight_kg) / (weightRange + 2 * chartPadding)) * 100
                        return `${x},${y}`
                      }).join(' ')}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-iron-orange"
                    />

                    {/* Data points */}
                    {chartData.map((metric, index) => {
                      const x = (index / (chartData.length - 1)) * 100
                      const y = ((maxWeight + chartPadding - metric.weight_kg) / (weightRange + 2 * chartPadding)) * 100
                      return (
                        <circle
                          key={metric.id}
                          cx={x}
                          cy={y}
                          r="0.8"
                          fill="currentColor"
                          className="text-iron-orange"
                        />
                      )
                    })}
                  </svg>

                  {/* Y-axis labels */}
                  <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-iron-gray">
                    <span>{(maxWeight + chartPadding).toFixed(0)} kg</span>
                    <span>{(minWeight - chartPadding).toFixed(0)} kg</span>
                  </div>
                </div>
              </div>
            )}

            {/* Weight History List */}
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-iron-gray uppercase tracking-wider">
                All Entries
              </h2>

              {metrics.map(metric => (
                <div
                  key={metric.id}
                  className="bg-iron-dark-gray border border-iron-gray/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Date */}
                      <p className="text-sm text-iron-gray mb-1">
                        {format(parseISO(metric.recorded_at), 'MMMM d, yyyy')}
                      </p>

                      {/* Weight */}
                      <p className="text-2xl font-bold text-iron-white mb-1">
                        {metric.weight_kg.toFixed(1)} kg
                      </p>

                      {/* Additional metrics */}
                      <div className="flex gap-4 text-xs text-iron-gray">
                        {metric.height_cm && (
                          <span>Height: {metric.height_cm.toFixed(0)} cm</span>
                        )}
                        {metric.body_fat_percentage && (
                          <span>BF: {metric.body_fat_percentage.toFixed(1)}%</span>
                        )}
                      </div>

                      {/* Notes */}
                      {metric.notes && (
                        <p className="text-sm text-iron-gray mt-2 italic">
                          {metric.notes}
                        </p>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(metric.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Undo Toast */}
      {undoState && (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between bg-iron-dark-gray border border-iron-gray rounded-lg p-4 shadow-lg animate-slide-up">
          <p className="text-sm text-iron-white">Entry deleted</p>
          <button
            onClick={handleUndo}
            className="text-sm font-medium text-iron-orange hover:underline"
          >
            Undo
          </button>
        </div>
      )}

      {/* FAB - Log Weight */}
      <button
        onClick={() => setShowLogModal(true)}
        className="fixed bottom-32 right-6 z-50 w-14 h-14 bg-iron-orange text-iron-black rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
      >
        <span className="text-2xl font-light">+</span>
      </button>

      {/* Log Modal */}
      <WeightLogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSuccess={handleLogSuccess}
        defaultUnit="kg"
      />
    </div>
  )
}
