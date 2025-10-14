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

  useEffect(() => {
    // Load dashboard regardless of onboarding status
    // Middleware already handles authentication
    // If onboarding not complete, user will be redirected by useOnboardingCheck
    if (!authLoading) {
      loadDashboard()
    }
  }, [authLoading])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDashboardSummary()
      setDashboardData(data)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError('Failed to load dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleWeightLogged = () => {
    // Refresh dashboard data after logging weight
    loadDashboard()
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
      />

      {/* Main Content */}
      <motion.div
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
