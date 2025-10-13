/**
 * Template Stats Page - Detailed usage analytics
 *
 * Shows:
 * - Overview cards (uses, duration, distance, consistency)
 * - Performance trends over time
 * - Recent activities using this template
 * - AI-generated insights
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getTemplate, getTemplateStats, getTemplateActivities } from '@/lib/api/templates'
import type { ActivityTemplate, TemplateStats } from '@/lib/types/templates'
import { ACTIVITY_TYPE_META, formatDistance, formatDuration } from '@/lib/types/templates'

export default function TemplateStatsPage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  const [template, setTemplate] = useState<ActivityTemplate | null>(null)
  const [stats, setStats] = useState<TemplateStats | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [templateId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load all data in parallel
      const [templateData, statsData, activitiesData] = await Promise.all([
        getTemplate(templateId),
        getTemplateStats(templateId),
        getTemplateActivities(templateId, { limit: 10 })
      ])

      setTemplate(templateData)
      setStats(statsData)
      setActivities(activitiesData)
    } catch (err: any) {
      console.error('Failed to load template stats:', err)
      setError('Failed to load template stats. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatTrend = (percent: number | null) => {
    if (percent === null || percent === undefined) return 'No data'
    if (percent === 0) return 'Steady'

    const abs = Math.abs(percent)
    const direction = percent > 0 ? 'slower' : 'faster'
    return `${abs.toFixed(1)}% ${direction}`
  }

  const getConsistencyLabel = (score: number | null) => {
    if (score === null || score === undefined) return 'No data'
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs improvement'
  }

  const getConsistencyColor = (score: number | null) => {
    if (score === null || score === undefined) return 'text-iron-gray'
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-iron-orange'
    if (score >= 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  const formatActivityDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-iron-black flex items-center justify-center">
        <div className="text-iron-white">Loading stats...</div>
      </div>
    )
  }

  if (error || !template || !stats) {
    return (
      <div className="min-h-screen bg-iron-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Template not found'}</p>
          <button
            onClick={() => router.back()}
            className="text-iron-orange hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  const activityMeta = ACTIVITY_TYPE_META[template.activity_type]
  const hasActivities = stats.total_uses > 0

  return (
    <div className="min-h-screen bg-iron-black pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-iron-black border-b border-iron-gray">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-iron-gray hover:text-iron-white transition mb-2"
          >
            ← Back
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{template.icon || activityMeta.icon}</div>
              <div>
                <h1 className="text-2xl font-bold text-iron-white">{template.template_name}</h1>
                <p className="text-sm text-iron-gray">{activityMeta.label} Template</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/activities/templates/${templateId}/edit`)}
              className="bg-iron-dark-gray text-iron-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-iron-gray transition"
            >
              Edit
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {!hasActivities ? (
          // No activities yet
          <div className="bg-iron-dark-gray rounded-xl p-12 border border-iron-gray text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-iron-white mb-2">
              No activities yet
            </h3>
            <p className="text-iron-gray mb-6">
              Use this template to log activities and see your stats here
            </p>
            <button
              onClick={() => router.push(`/activities/log?template=${templateId}`)}
              className="bg-iron-orange text-iron-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              Log Activity with Template
            </button>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Uses */}
              <div className="bg-iron-dark-gray rounded-xl p-4 border border-iron-gray">
                <p className="text-xs text-iron-gray mb-1">Total Uses</p>
                <p className="text-2xl font-bold text-iron-white">{stats.total_uses}</p>
              </div>

              {/* Average Duration */}
              {stats.avg_duration_minutes && (
                <div className="bg-iron-dark-gray rounded-xl p-4 border border-iron-gray">
                  <p className="text-xs text-iron-gray mb-1">Avg Duration</p>
                  <p className="text-2xl font-bold text-iron-white">
                    {Math.round(stats.avg_duration_minutes)}
                  </p>
                  <p className="text-xs text-iron-gray">minutes</p>
                </div>
              )}

              {/* Average Distance */}
              {stats.avg_distance_m && (
                <div className="bg-iron-dark-gray rounded-xl p-4 border border-iron-gray">
                  <p className="text-xs text-iron-gray mb-1">Avg Distance</p>
                  <p className="text-2xl font-bold text-iron-white">
                    {(stats.avg_distance_m / 1000).toFixed(1)}
                  </p>
                  <p className="text-xs text-iron-gray">km</p>
                </div>
              )}

              {/* Consistency Score */}
              {stats.trend_consistency_score !== null && (
                <div className="bg-iron-dark-gray rounded-xl p-4 border border-iron-gray">
                  <p className="text-xs text-iron-gray mb-1">Consistency</p>
                  <p className={`text-2xl font-bold ${getConsistencyColor(stats.trend_consistency_score)}`}>
                    {Math.round(stats.trend_consistency_score)}
                  </p>
                  <p className="text-xs text-iron-gray">{getConsistencyLabel(stats.trend_consistency_score)}</p>
                </div>
              )}
            </div>

            {/* Performance Insights */}
            <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray">
              <h2 className="text-lg font-semibold text-iron-white mb-4">Performance Insights</h2>
              <div className="space-y-3">
                {/* Pace Trend */}
                {stats.trend_pace_percent !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-iron-gray">Pace Trend</span>
                    <span className={`text-sm font-medium ${
                      stats.trend_pace_percent < 0 ? 'text-green-500' :
                      stats.trend_pace_percent > 0 ? 'text-red-500' :
                      'text-iron-gray'
                    }`}>
                      {formatTrend(stats.trend_pace_percent)}
                    </span>
                  </div>
                )}

                {/* Average Calories */}
                {stats.avg_calories && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-iron-gray">Avg Calories Burned</span>
                    <span className="text-sm font-medium text-iron-white">
                      {Math.round(stats.avg_calories)} kcal
                    </span>
                  </div>
                )}

                {/* Best Performance */}
                {stats.best_performance_metric && (
                  <div className="pt-3 border-t border-iron-gray">
                    <p className="text-xs text-iron-gray mb-1">Best Performance</p>
                    <p className="text-sm text-iron-white">{stats.best_performance_metric}</p>
                    {stats.best_performance_date && (
                      <p className="text-xs text-iron-gray mt-1">
                        {formatActivityDate(stats.best_performance_date)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            {activities.length > 0 && (
              <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-iron-white">Recent Activities</h2>
                  <span className="text-sm text-iron-gray">Last {activities.length}</span>
                </div>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-iron-black rounded-lg hover:bg-iron-gray/50 transition cursor-pointer"
                      onClick={() => router.push(`/activities/${activity.id}`)}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-iron-white">{activity.activity_name || activity.name}</p>
                        <p className="text-xs text-iron-gray">
                          {formatActivityDate(activity.start_time)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-iron-white">
                          {activity.duration_minutes} min
                        </p>
                        {activity.calories_burned && (
                          <p className="text-xs text-iron-gray">
                            {activity.calories_burned} kcal
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Timeline */}
            {stats.first_used && stats.last_used && (
              <div className="bg-iron-dark-gray rounded-xl p-6 border border-iron-gray">
                <h2 className="text-lg font-semibold text-iron-white mb-4">Usage Timeline</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-iron-gray">First Used</span>
                    <span className="text-iron-white">{formatActivityDate(stats.first_used)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-iron-gray">Last Used</span>
                    <span className="text-iron-white">{formatActivityDate(stats.last_used)}</span>
                  </div>
                  {stats.days_since_last_use !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-iron-gray">Days Since Last Use</span>
                      <span className="text-iron-white">{stats.days_since_last_use}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
