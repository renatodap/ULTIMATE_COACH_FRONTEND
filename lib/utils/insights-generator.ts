/**
 * AI Insights Generator
 *
 * Analyzes dashboard data to generate contextual insights
 * Provides personalized feedback, patterns, and suggestions
 *
 * Part of Phase 5: AI-First UX Transformation
 */

import type { Insight } from '@/app/components/dashboard/InsightCard'
import type { DashboardSummary } from '@/lib/types/dashboard'

/**
 * Generate insights from dashboard data
 * Returns array of insights sorted by importance
 */
export function generateInsights(data: DashboardSummary): Insight[] {
  const insights: Insight[] = []

  // Progress Insights
  if (data.weight?.current_weight_kg && data.weight?.goal_weight_kg) {
    const current = data.weight.current_weight_kg
    const goal = data.weight.goal_weight_kg
    const diff = Math.abs(current - goal)
    const progressPercent = data.weight.progress_percent || 0

    if (progressPercent > 0 && progressPercent < 100) {
      insights.push({
        id: 'weight-progress',
        type: 'progress',
        title: 'Weight Progress',
        message: `You're ${progressPercent.toFixed(0)}% of the way to your goal! ${diff.toFixed(1)}kg to go.`,
        importance: 'high',
      })
    } else if (progressPercent >= 100) {
      insights.push({
        id: 'goal-achieved',
        type: 'achievement',
        title: 'Goal Achieved!',
        message: 'Congratulations! You\'ve reached your goal weight. Time to set a new challenge?',
        action: {
          label: 'Update Goals',
          path: '/profile',
        },
        importance: 'high',
      })
    }
  }

  // Net Calories Pattern
  const netCal = data.net_calories || 0
  if (netCal < -500) {
    insights.push({
      id: 'large-deficit',
      type: 'alert',
      title: 'Large Calorie Deficit',
      message: 'You have a significant calorie deficit today. Make sure you\'re fueling your body adequately.',
      importance: 'medium',
    })
  } else if (Math.abs(netCal) < 100) {
    insights.push({
      id: 'balanced-nutrition',
      type: 'achievement',
      title: 'Perfectly Balanced',
      message: 'Your calories are right on track today. Great job maintaining balance!',
      importance: 'low',
    })
  }

  // Activity Insights
  if (data.activity?.total_calories_burned > 0) {
    const calories = data.activity.total_calories_burned
    const workouts = data.activity.activity_count

    if (calories >= 500) {
      insights.push({
        id: 'great-burn',
        type: 'encouragement',
        title: 'Amazing Workout!',
        message: `You burned ${calories} calories today! Keep up the great work.`,
        importance: 'medium',
      })
    }

    if (workouts >= 2) {
      insights.push({
        id: 'multi-workout',
        type: 'achievement',
        title: 'Double Workout Day',
        message: `${workouts} workouts today! Your dedication is impressive.`,
        importance: 'medium',
      })
    }
  } else if (new Date().getHours() >= 18) {
    // Evening and no activity
    insights.push({
      id: 'no-activity-today',
      type: 'suggestion',
      title: 'Move Today?',
      message: 'Haven\'t logged activity yet. Even a short walk counts!',
      action: {
        label: 'Log Activity',
        path: '/activities/log',
      },
      importance: 'low',
    })
  }

  // Nutrition Insights
  const proteinPercent = data.nutrition.protein_goal
    ? (Number(data.nutrition.protein_consumed) / Number(data.nutrition.protein_goal)) * 100
    : 0

  if (proteinPercent >= 90) {
    insights.push({
      id: 'protein-goal',
      type: 'achievement',
      title: 'Protein Target Hit',
      message: `You've hit ${proteinPercent.toFixed(0)}% of your protein goal. Muscle recovery on point!`,
      importance: 'low',
    })
  } else if (proteinPercent < 50 && new Date().getHours() >= 14) {
    insights.push({
      id: 'protein-low',
      type: 'suggestion',
      title: 'Protein Intake Low',
      message: 'You\'re behind on protein today. Consider a protein-rich snack or meal.',
      action: {
        label: 'Log Meal',
        path: '/nutrition/log',
      },
      importance: 'medium',
    })
  }

  // Weekly Pattern (if data available)
  if (data.weekly?.days_logged > 0) {
    const daysLogged = data.weekly.days_logged
    const streak = data.weekly.current_streak || 0

    if (streak >= 7) {
      insights.push({
        id: 'week-streak',
        type: 'encouragement',
        title: 'Week Streak!',
        message: `${streak} days of consistent logging. You're building great habits!`,
        importance: 'high',
      })
    } else if (daysLogged >= 5) {
      insights.push({
        id: 'consistent-logging',
        type: 'pattern',
        title: 'Strong Consistency',
        message: `${daysLogged} days logged this week. Keep the momentum going!`,
        importance: 'medium',
      })
    }
  }

  // Coach Suggestion (always show one)
  if (insights.length < 3) {
    insights.push({
      id: 'ask-coach',
      type: 'suggestion',
      title: 'Ask Coach',
      message: 'Have questions about your plan or progress? Coach is here to help!',
      action: {
        label: 'Open Coach',
        path: '/coach',
      },
      importance: 'low',
    })
  }

  // Sort by importance: high > medium > low
  const importanceOrder = { high: 3, medium: 2, low: 1 }
  insights.sort((a, b) => importanceOrder[b.importance] - importanceOrder[a.importance])

  // Return top 4 insights
  return insights.slice(0, 4)
}

/**
 * Generate time-based greeting
 */
export function getTimeBasedGreeting(displayName?: string): string {
  const hour = new Date().getHours()
  const name = displayName || 'there'

  if (hour >= 5 && hour < 12) {
    return `Good morning, ${name}!`
  } else if (hour >= 12 && hour < 17) {
    return `Good afternoon, ${name}!`
  } else if (hour >= 17 && hour < 22) {
    return `Good evening, ${name}!`
  } else {
    return `Welcome back, ${name}!`
  }
}

/**
 * Generate contextual greeting with insight
 */
export function getContextualGreeting(data: DashboardSummary, displayName?: string): string {
  const baseGreeting = getTimeBasedGreeting(displayName)
  const hour = new Date().getHours()

  // Weight progress context
  if (data.weight?.progress_percent && data.weight.progress_percent > 0) {
    const percent = data.weight.progress_percent
    if (percent >= 75) {
      return `${baseGreeting} You're almost there - ${percent.toFixed(0)}% to your goal!`
    } else if (percent >= 50) {
      return `${baseGreeting} Halfway to your goal - keep pushing!`
    } else if (percent >= 25) {
      return `${baseGreeting} Great progress - ${percent.toFixed(0)}% complete!`
    }
  }

  // Activity context
  if (data.activity?.total_calories_burned > 500) {
    return `${baseGreeting} Amazing workout today!`
  }

  // Streak context
  if (data.weekly?.current_streak && data.weekly.current_streak >= 7) {
    return `${baseGreeting} ${data.weekly.current_streak} day streak - unstoppable!`
  }

  // Time-based defaults
  if (hour >= 5 && hour < 12) {
    return `${baseGreeting} Ready to crush today?`
  } else if (hour >= 12 && hour < 17) {
    return `${baseGreeting} How's your day going?`
  } else {
    return `${baseGreeting} Let's see how today went.`
  }
}
