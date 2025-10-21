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
import { useDashboardData } from '@/lib/hooks/useDashboardData'
import { getCurrentProgram } from '@/lib/api/planning'

// Components
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen, SkeletonCard, SkeletonGrid } from '@/components/shared/LoadingScreen'
import DashboardHeader from '@/app/components/dashboard/DashboardHeader'
import HeroCard from '@/app/components/dashboard/HeroCard'
import ProgressTrackerCard from '@/app/components/dashboard/ProgressTrackerCard'
import SmartActionsGrid from '@/app/components/dashboard/SmartActionsGrid'
import WeightLogModal from '@/app/components/dashboard/WeightLogModal'
import { GeneratePlanModal } from '@/app/components/dashboard/GeneratePlanModal'
import GeneratePlanCard from '@/app/components/dashboard/GeneratePlanCard'
import { InsightCardsGrid } from '@/app/components/dashboard/InsightCard'
import { generateInsights } from '@/lib/utils/insights-generator'

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
    transition: { duration: 0.22 }
  }
}

export default function DashboardPage() {
  const { loading: authLoading, onboardingComplete, userId } = useOnboardingCheck()

  // Use the new dashboard data hook
  const {
    data: dashboardData,
    loading,
    refreshing,
    error,
    unitSystem,
    consultationCompleted,
    refresh,
    load
  } = useDashboardData({ skip: authLoading || !onboardingComplete })

  const [weightModalOpen, setWeightModalOpen] = useState(false)
  const [showGeneratePlanModal, setShowGeneratePlanModal] = useState(false)
  const [hasActivePlan, setHasActivePlan] = useState<boolean | null>(null)
  const [checkingPlan, setCheckingPlan] = useState(false)

  // Check if user has an active plan
  useEffect(() => {
    async function checkPlanStatus() {
      if (authLoading || !onboardingComplete) return

      try {
        setCheckingPlan(true)
        const result = await getCurrentProgram()
        setHasActivePlan(!!result?.program_id)
      } catch (err) {
        // No plan exists (404) or error - treat as no plan
        setHasActivePlan(false)
      } finally {
        setCheckingPlan(false)
      }
    }

    checkPlanStatus()
  }, [authLoading, onboardingComplete])

  const handleWeightLogged = () => {
    // Refresh dashboard data after logging weight
    refresh()
  }

  const handleRefresh = () => {
    refresh()
  }

  const handlePlanGenerated = () => {
    // Mark as having active plan and close modal
    setHasActivePlan(true)
    setShowGeneratePlanModal(false)
    refresh()
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
              onClick={() => load()}
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
    <div className="min-h-screen bg-iron-black pb-40">
      {/* Top Progress Indicator - shows during refresh */}
      {refreshing && <div className="top-progress-iron" />}

      {/* Header */}
      <DashboardHeader
        displayName={dashboardData.display_name}
        date={dashboardData.date}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        dashboardData={dashboardData}
      />

      {/* Main Content */}
      <motion.div
        className="max-w-4xl mx-auto px-4 py-6 space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* MOBILE-FIRST: Progress Tracker at top (most important metric) */}
        <motion.div variants={cardVariants} className="md:hidden">
          <ProgressTrackerCard
            weight={dashboardData.weight}
            weekly={dashboardData.weekly}
            unitSystem={unitSystem}
            onLogWeight={() => setWeightModalOpen(true)}
          />
        </motion.div>

        {/* Generate Plan Card - Show if no active plan */}
        {!checkingPlan && hasActivePlan === false && (
          <motion.div variants={cardVariants}>
            <GeneratePlanCard onGenerateClick={() => setShowGeneratePlanModal(true)} />
          </motion.div>
        )}

        {/* Hero Card - Today At A Glance (most immediately useful) */}
        <motion.div variants={cardVariants}>
          <HeroCard
            nutrition={dashboardData.nutrition}
            activity={dashboardData.activity}
            netCalories={dashboardData.net_calories}
          />
        </motion.div>

        {/* AI Insights - Contextual feedback and suggestions */}
        <motion.div variants={cardVariants}>
          <InsightCardsGrid insights={generateInsights(dashboardData)} />
        </motion.div>

        {/* Smart Actions - Time-aware with Coach */}
        <motion.div variants={cardVariants}>
          <SmartActionsGrid onLogWeight={() => setWeightModalOpen(true)} />
        </motion.div>

        {/* DESKTOP: Progress Tracker at bottom (traditional layout) */}
        <motion.div variants={cardVariants} className="hidden md:block">
          <ProgressTrackerCard
            weight={dashboardData.weight}
            weekly={dashboardData.weekly}
            unitSystem={unitSystem}
            onLogWeight={() => setWeightModalOpen(true)}
          />
        </motion.div>
      </motion.div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Weight Log Modal */}
      <WeightLogModal
        isOpen={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        onSuccess={handleWeightLogged}
        defaultUnit={unitSystem === 'imperial' ? 'lbs' : 'kg'}
      />

      {/* Generate Plan Modal */}
      <GeneratePlanModal
        isOpen={showGeneratePlanModal}
        onClose={() => setShowGeneratePlanModal(false)}
        isRegeneration={false}
        onSuccess={handlePlanGenerated}
      />
    </div>
  )
}
