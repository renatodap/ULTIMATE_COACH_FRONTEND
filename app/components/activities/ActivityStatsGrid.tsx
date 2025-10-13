/**
 * Activity Stats Grid Component
 *
 * Displays activity metrics in a responsive grid layout
 * Dynamically shows category-specific stats (distance, HR, exercises, etc.)
 */

import type { ActivityCategory, ActivityMetrics, ActivityStat } from '@/lib/types/activities'

interface ActivityStatsGridProps {
  category: ActivityCategory
  calories: number
  mets: number
  metrics: ActivityMetrics
}

export default function ActivityStatsGrid({
  category,
  calories,
  mets,
  metrics
}: ActivityStatsGridProps) {

  // Build stats array based on category
  const stats: ActivityStat[] = [
    { icon: '🔥', label: 'Calories', value: calories, unit: 'kcal' },
    { icon: '⚡', label: 'Intensity', value: mets.toFixed(1), unit: 'METs' }
  ]

  // Add category-specific stats
  if (category === 'cardio_steady_state' || category === 'cardio_interval') {
    if (metrics.distance_km) {
      stats.push({
        icon: '📏',
        label: 'Distance',
        value: metrics.distance_km.toFixed(1),
        unit: 'km'
      })
    }
    if (metrics.avg_heart_rate) {
      stats.push({
        icon: '💓',
        label: 'Avg HR',
        value: metrics.avg_heart_rate,
        unit: 'bpm'
      })
    }
    if (metrics.avg_pace) {
      stats.push({
        icon: '⏱️',
        label: 'Pace',
        value: metrics.avg_pace,
        unit: ''
      })
    }
    if (metrics.elevation_gain_m) {
      stats.push({
        icon: '⛰️',
        label: 'Elevation',
        value: metrics.elevation_gain_m,
        unit: 'm'
      })
    }
  }

  if (category === 'strength_training') {
    if (metrics.exercises?.length) {
      stats.push({
        icon: '🏋️',
        label: 'Exercises',
        value: metrics.exercises.length,
        unit: ''
      })
    }
    if (metrics.total_volume_kg) {
      stats.push({
        icon: '📊',
        label: 'Volume',
        value: metrics.total_volume_kg,
        unit: 'kg'
      })
    }
  }

  if (category === 'sports') {
    if (metrics.sport_type) {
      stats.push({
        icon: '⚾',
        label: 'Sport',
        value: metrics.sport_type,
        unit: ''
      })
    }
    if (metrics.score) {
      stats.push({
        icon: '🏆',
        label: 'Score',
        value: metrics.score,
        unit: ''
      })
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center gap-2 p-2 bg-iron-black rounded-lg"
        >
          <span className="text-xl">{stat.icon}</span>
          <div className="flex flex-col">
            <p className="text-xs text-iron-gray">{stat.label}</p>
            <p className="text-sm font-semibold text-iron-white">
              {stat.value}{stat.unit ? ` ${stat.unit}` : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
