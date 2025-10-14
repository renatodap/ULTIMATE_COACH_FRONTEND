'use client'

/**
 * Dashboard Page
 *
 * Main dashboard with unified summary view
 * Mobile-first, sharp design, NO rounded corners
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useOnboardingCheck } from '@/lib/hooks/useOnboardingCheck'
import { getDashboardSummary } from '@/lib/api/dashboard'
import type { DashboardSummary } from '@/lib/types/dashboard'

// Components
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen, SkeletonCard, SkeletonGrid } from '@/components/shared/LoadingScreen'
import DashboardHeader from '@/app/components/dashboard/DashboardHeader'
import TodayOverviewCard from '@/app/components/dashboard/TodayOverviewCard'
import WeightProgressCard from '@/app/components/dashboard/WeightProgressCard'
import MacroSummaryCard from '@/app/components/dashboard/MacroSummaryCard'
import ActivitySummaryCard from '@/app/components/dashboard/ActivitySummaryCard'
import QuickActionsGrid from '@/app/components/dashboard/QuickActionsGrid'
import WeeklyStatsCard from '@/app/components/dashboard/WeeklyStatsCard'
import RecentActivityFeed from '@/app/components/dashboard/RecentActivityFeed'
import WeightLogModal from '@/app/components/dashboard/WeightLogModal'
import TimePeriodSelector, { TimePeriod } from '@/app/components/dashboard/TimePeriodSelector'
import SwipeableContent from '@/app/components/dashboard/SwipeableContent'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
}

export default function DashboardPage() {
  const { loading: authLoading, onboardingComplete } = useOnboardingCheck()
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weightModalOpen, setWeightModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today')

  useEffect(() => {
    // Load dashboard regardless of onboarding status
    // Middleware already handles authentication
    // If onboarding not complete, user will be redirected by useOnboardingCheck
    if (!authLoading) {
      loadDashboard()
    }
  }, [authLoading])

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      const data = await getDashboardSummary()
      setDashboardData(data)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError('Failed to load dashboard. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleWeightLogged = () => {
    // Refresh dashboard data after logging weight
    loadDashboard()
  }

  const handleRefresh = () => {
    loadDashboard(true)
  }

  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period)
    // TODO: Fetch data for the selected period
    // For now, just update the UI
  }

  const handleSwipeLeft = () => {
    // Swipe left = next period (today -> week -> month)
    const periods: TimePeriod[] = ['today', 'week', 'month']
    const currentIndex = periods.indexOf(timePeriod)
    if (currentIndex < periods.length - 1) {
      setTimePeriod(periods[currentIndex + 1])
    }
  }

  const handleSwipeRight = () => {
    // Swipe right = previous period (month -> week -> today)
    const periods: TimePeriod[] = ['today', 'week', 'month']
    const currentIndex = periods.indexOf(timePeriod)
    if (currentIndex > 0) {
      setTimePeriod(periods[currentIndex - 1])
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingScreen message="Loading your profile..." />
  }

  // Don't render if onboarding not complete (hook will redirect)
  if (!onboardingComplete) {
    return null
  }

  // Loading dashboard data
  if (loading) {
    return (
      <div className="min-h-screen bg-iron-black pb-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <SkeletonCard height="h-16" />
          <div className="mt-4">
            <SkeletonGrid count={5} height="h-40" />
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  // Error state
  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-iron-black pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card-glass border border-red-500/50 p-8 text-center">
            <p className="text-4xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold text-iron-white uppercase tracking-wider mb-2">
              Unable to Load Dashboard
            </h2>
            <p className="text-iron-gray mb-6">
              {error || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={loadDashboard}
              className="btn-primary px-6 py-3"
            >
              Retry
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iron-black pb-20">
      {/* Header */}
      <DashboardHeader
        displayName={dashboardData.display_name}
        date={dashboardData.date}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Time Period Selector with Swipe */}
      <div className="max-w-4xl mx-auto px-4 pt-2">
        <TimePeriodSelector
          currentPeriod={timePeriod}
          onChange={handleTimePeriodChange}
        />
      </div>

      {/* Swipeable Main Content */}
      <SwipeableContent
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      >
        <motion.div
          key={timePeriod} // Re-animate when period changes
          className="max-w-4xl mx-auto px-4 py-6 space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
        {/* Today's Overview */}
        <motion.div variants={cardVariants}>
          <TodayOverviewCard
            nutrition={dashboardData.nutrition}
            activity={dashboardData.activity}
            netCalories={dashboardData.net_calories}
          />
        </motion.div>

        {/* Weight & Macros - Side by side on tablet+ */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={cardVariants}>
          <WeightProgressCard
            weight={dashboardData.weight}
            onLogWeight={() => setWeightModalOpen(true)}
          />
          <MacroSummaryCard nutrition={dashboardData.nutrition} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={cardVariants}>
          <QuickActionsGrid onLogWeight={() => setWeightModalOpen(true)} />
        </motion.div>

        {/* Activity Summary */}
        <motion.div variants={cardVariants}>
          <ActivitySummaryCard activity={dashboardData.activity} />
        </motion.div>

        {/* Weekly Stats */}
        <motion.div variants={cardVariants}>
          <WeeklyStatsCard weekly={dashboardData.weekly} />
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div variants={cardVariants}>
          <RecentActivityFeed />
        </motion.div>
        </motion.div>
      </SwipeableContent>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Weight Log Modal */}
      <WeightLogModal
        isOpen={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        onSuccess={handleWeightLogged}
      />
    </div>
  )
}
