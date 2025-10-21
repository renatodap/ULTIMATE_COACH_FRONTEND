'use client'

/**
 * Profile Page - Comprehensive View
 *
 * Displays ALL user profile data from onboarding including:
 * - Basic info (name, email)
 * - Physical stats (age, sex, height, weight, goals)
 * - Training & Activity (experience level, activity level, workout frequency)
 * - Nutrition Plan (macro targets, TDEE, calorie goals)
 * - Dietary Preferences (dietary restrictions, allergies, meal frequency)
 * - Lifestyle (sleep, stress, cooking habits)
 * - Consultation Results (if completed)
 * - Preferences (unit system, timezone)
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'
import {
  User,
  Activity,
  Apple,
  Moon,
  Settings,
  LogOut,
  Edit2,
  TrendingUp,
  Calendar,
  Utensils,
  Heart,
  Scale,
  Target,
  ChevronDown,
  ChevronUp,
  Link2,
  Star,
  Dumbbell,
  Clock,
  Shield,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { getFullUserProfile, getUserTrainingModalities, type FullUserProfile, type UserTrainingModality } from '@/lib/api/profile'
import { logout } from '@/lib/api/auth'
import { updateFullUserProfile } from '@/lib/api/profile'
import { displayWeight, displayHeight } from '@/lib/utils/units'
import { useTimezone } from '@/lib/context/TimezoneContext'
import { formatDateDisplay } from '@/lib/utils/timezone'
import { getCurrentProgram } from '@/lib/api/planning'
import { GeneratePlanModal } from '@/app/components/dashboard/GeneratePlanModal'
import EditPhysicalStatsModal from '@/app/components/profile/EditPhysicalStatsModal'
import EditGoalsModal from '@/app/components/profile/EditGoalsModal'
import EditDietaryModal from '@/app/components/profile/EditDietaryModal'
import EditLifestyleModal from '@/app/components/profile/EditLifestyleModal'
import EditPreferencesModal from '@/app/components/profile/EditPreferencesModal'
import EditTrainingModalitiesModal from '@/app/components/profile/EditTrainingModalitiesModal'
import EditEquipmentModal from '@/app/components/profile/EditEquipmentModal'
import EditScheduleModal from '@/app/components/profile/EditScheduleModal'
import EditMealTimingModal from '@/app/components/profile/EditMealTimingModal'
import EditExerciseFamiliarityModal from '@/app/components/profile/EditExerciseFamiliarityModal'
import EditChallengesModal from '@/app/components/profile/EditChallengesModal'
import EditConstraintsModal from '@/app/components/profile/EditConstraintsModal'
import Toast from '@/app/components/shared/Toast'
import {
  formatGoal,
  formatActivityLevel,
  formatBiologicalSex,
  formatExperienceLevel,
  formatDietaryPreference,
  formatUnitSystem,
  formatStressLevel,
} from '@/lib/constants/profile'
import { getLanguageDisplayName, type SupportedLanguage } from '@/lib/utils/language'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
}

const contentVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2 }
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3 }
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { timezone } = useTimezone()
  const [profile, setProfile] = useState<FullUserProfile | null>(null)
  const [trainingModalities, setTrainingModalities] = useState<UserTrainingModality[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Accordion state for collapsible sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    // Prioritize most used sections on mobile: Nutrition plan, Goals.
    new Set(['macros', 'goals'])
  )

  // Modal states
  const [showPhysicalModal, setShowPhysicalModal] = useState(false)
  const [showGoalsModal, setShowGoalsModal] = useState(false)
  const [showDietaryModal, setShowDietaryModal] = useState(false)
  const [showLifestyleModal, setShowLifestyleModal] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [showTrainingModalitiesModal, setShowTrainingModalitiesModal] = useState(false)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showMealTimingModal, setShowMealTimingModal] = useState(false)
  const [showExerciseFamiliarityModal, setShowExerciseFamiliarityModal] = useState(false)
  const [showChallengesModal, setShowChallengesModal] = useState(false)
  const [showConstraintsModal, setShowConstraintsModal] = useState(false)
  const [showRegeneratePlanModal, setShowRegeneratePlanModal] = useState(false)

  // Plan status - properly typed based on backend response
  interface Program {
    program_id: string
    primary_goal: string
    program_start_date: string
    next_reassessment_date: string
    tdee: number
    macros: Record<string, number>
    training_sessions: unknown[]
    meals: unknown[]
  }
  const [currentPlan, setCurrentPlan] = useState<Program | null>(null)
  const [checkingPlan, setCheckingPlan] = useState(false)

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [profileData, modalitiesData] = await Promise.all([
        getFullUserProfile(),
        getUserTrainingModalities().catch(() => []) // Non-critical, default to empty
      ])
      setProfile(profileData)
      setTrainingModalities(modalitiesData)

      // Check for current plan
      try {
        setCheckingPlan(true)
        const planResult = await getCurrentProgram()
        setCurrentPlan(planResult || null)
      } catch {
        setCurrentPlan(null)
      } finally {
        setCheckingPlan(false)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('profile.failedToLoad')
      setError(errorMessage)
      console.error('Profile load error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSignOut = async () => {
    // Logout function now handles redirect automatically
    await logout()
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  // Modal handlers
  const handleUpdateSuccess = (updatedProfile: FullUserProfile) => {
    setProfile(updatedProfile)
    setToast({ message: t('profile.profileUpdated'), type: 'success' })
  }

  const handleUpdateError = (errorMessage: string) => {
    setToast({ message: errorMessage, type: 'error' })
  }

  const handlePlanRegenerated = () => {
    setShowRegeneratePlanModal(false)
    setToast({ message: 'Plan regenerated successfully!', type: 'success' })
    loadProfile() // Reload to get new plan
  }

  if (isLoading) {
    return <LoadingScreen message={t('profile.loadingProfile')} />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-iron-black text-iron-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md px-4">
            <h2 className="font-heading text-2xl text-iron-orange mb-2 uppercase">{t('profile.unableToLoad')}</h2>
            <p className="text-iron-gray mb-6">{error}</p>
            <button
              onClick={loadProfile}
              className="bg-iron-orange text-iron-black font-heading px-6 py-3 uppercase tracking-wider hover:bg-orange-600 transition-colors"
            >
              {t('profile.tryAgain')}
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  // Helper component for collapsible section
  const CollapsibleSection = ({
    id,
    title,
    icon: Icon,
    onEdit,
    children,
  }: {
    id: string
    title: string
    icon: React.ElementType
    onEdit?: () => void
    children: React.ReactNode
  }) => {
    const isExpanded = expandedSections.has(id)

    return (
      <motion.div
        className="rounded-xl border border-iron-gray/40 bg-iron-dark-gray/50 shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-sm"
        variants={sectionVariants}
      >
        <button
          onClick={() => toggleSection(id)}
          className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-iron-gray/10 transition-colors rounded-xl"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-iron-orange" />
            <h3 className="font-heading text-lg sm:text-xl text-iron-white uppercase tracking-wider">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <motion.div
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    e.preventDefault()
                    onEdit()
                  }
                }}
                className="p-2 hover:bg-iron-orange/20 transition-colors cursor-pointer"
                aria-label={`Edit ${title}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit2 className="w-4 h-4 text-iron-orange" />
              </motion.div>
            )}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-iron-gray" />
            </motion.div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={contentVariants}
              className="overflow-hidden"
            >
              <div className="p-4 sm:p-6 pt-0 border-t border-iron-gray/20">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }


  // Helper component for data row
  const DataRow = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-iron-gray">{label}</span>
      <span className="text-sm text-iron-white font-medium">{value || t('profile.notSet')}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-iron-black text-iron-white pb-40">
      {/* Subtle dynamic gradient background at top */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-iron-orange/10 via-transparent to-transparent pointer-events-none" />
      {/* Header */}
      <header className="border-b border-iron-gray sticky top-0 bg-iron-black z-[100]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-iron-white uppercase tracking-wider">
            {t('profile.pageTitle')}
          </h1>
          <div className="flex items-center gap-2">
            {profile && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-iron-gray uppercase tracking-wider">Units</label>
                <select
                  value={profile.unit_system || 'metric'}
                  onChange={async (e) => {
                    const nextUnits = e.target.value as 'metric' | 'imperial'
                    try {
                      const updated = await updateFullUserProfile({ unit_system: nextUnits })
                      setProfile(updated)
                      setToast({ type: 'success', message: `Switched to ${nextUnits} units` })
                    } catch (err) {
                      setToast({ type: 'error', message: 'Failed to update unit preference' })
                    }
                  }}
                  className="px-3 py-2 bg-iron-black border border-iron-gray text-iron-white focus:outline-none focus:border-iron-orange text-xs rounded-lg"
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </select>
              </div>
            )}
            <a
              href="/templates"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-iron-gray text-iron-white text-xs hover:border-iron-orange/60 transition-colors"
              aria-label="Templates"
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </a>
            <a
              href="/profile/connected-apps"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-iron-gray text-iron-white text-xs hover:border-iron-orange/60 transition-colors"
              aria-label="Connected Apps"
            >
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Connected Apps</span>
              <span className="sm:hidden">Apps</span>
            </a>
          </div>
        </div>
      </header>

      <motion.main
        className="max-w-4xl mx-auto px-4 py-6 space-y-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Summary Card */}
        <motion.div
          variants={sectionVariants}
          className="rounded-2xl border border-iron-gray/30 bg-iron-dark-gray/40 shadow-[0_8px_24px_rgba(0,0,0,0.35)] overflow-hidden"
        >
          <div className="p-5 flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-iron-orange/20 border border-iron-orange/30 flex items-center justify-center text-iron-orange font-heading text-xl">
              {(profile.full_name || profile.email || 'U').slice(0,1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-iron-gray uppercase tracking-wider">{((t as any)('profile.welcomeBack')) || 'Welcome back'}</p>
              <h2 className="text-lg sm:text-xl font-bold truncate">{profile.full_name || profile.email}</h2>
              <p className="text-xs text-iron-gray mt-1">
                {((t as any)('profile.primaryGoal'))}: {formatGoal(profile.primary_goal)} • {((t as any)('profile.activityLevel'))}: {formatActivityLevel(profile.activity_level)}
              </p>
            </div>
            {/* Quick stat pill */}
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs text-iron-gray uppercase tracking-wider">{t('profile.dailyCalorieGoal')}</span>
              <span className="text-xl font-heading text-iron-orange">{profile.daily_calorie_goal || '—'}</span>
            </div>
          </div>
          {/* Highlights (responsive grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border-t border-iron-gray/20">
            <div className="rounded-lg bg-iron-black/40 p-3 text-center">
              <div className="text-xs text-iron-gray uppercase mb-1">{t('profile.currentWeight')}</div>
              <div className="text-base sm:text-lg font-heading">{
                (profile.current_weight_kg ?? null) !== null
                  ? displayWeight(profile.current_weight_kg!, profile.unit_system || 'metric').formatted
                  : '—'
              }</div>
            </div>
            <div className="rounded-lg bg-iron-black/40 p-3 text-center">
              <div className="text-xs text-iron-gray uppercase mb-1">{t('profile.goalWeight')}</div>
              <div className="text-base sm:text-lg font-heading">{
                (profile.goal_weight_kg ?? null) !== null
                  ? displayWeight(profile.goal_weight_kg!, profile.unit_system || 'metric').formatted
                  : '—'
              }</div>
            </div>
            <div className="rounded-lg bg-iron-black/40 p-3 text-center">
              <div className="text-xs text-iron-gray uppercase mb-1">{t('profile.workoutFrequency')}</div>
              <div className="text-base sm:text-lg font-heading">{profile.workout_frequency ? `${profile.workout_frequency}${t('profile.timesPerWeek')}` : '—'}</div>
            </div>
          </div>
        </motion.div>

        {/* Basic Info Section (Always visible) */}
        <CollapsibleSection id="basic" title={t('profile.basicInfo')} icon={User}>
          <div className="space-y-2">
            <DataRow label={t('profile.name')} value={profile.full_name} />
            <DataRow label={t('profile.email')} value={profile.email} />
            <DataRow label={t('profile.memberSince')} value={profile.created_at ? formatDateDisplay(profile.created_at, timezone, true) : t('profile.unknown')} />
            {profile.onboarding_completed && (
              <DataRow
                label={t('profile.onboardingCompleted')}
                value={profile.onboarding_completed_at ? formatDateDisplay(profile.onboarding_completed_at, timezone, true) : t('profile.yes')}
              />
            )}
          </div>
        </CollapsibleSection>

        {/* Physical Stats Section */}
        <CollapsibleSection
          id="physical"
          title={t('profile.physicalStats')}
          icon={Scale}
          onEdit={() => setShowPhysicalModal(true)}
        >
          <div className="space-y-2">
            <DataRow
              label={t('profile.age')}
              value={profile.age ? `${profile.age} ${t('profile.years')}` : undefined}
            />
            <DataRow
              label={t('profile.sex')}
              value={formatBiologicalSex(profile.biological_sex)}
            />
            <DataRow
              label={t('profile.height')}
              value={profile.height_cm !== undefined && profile.height_cm !== null
                ? displayHeight(profile.height_cm, profile.unit_system || 'metric').formatted
                : undefined}
            />
            <DataRow
              label={t('profile.currentWeight')}
              value={profile.current_weight_kg !== undefined && profile.current_weight_kg !== null
                ? displayWeight(profile.current_weight_kg, profile.unit_system || 'metric').formatted
                : undefined}
            />
            <DataRow
              label={t('profile.goalWeight')}
              value={profile.goal_weight_kg !== undefined && profile.goal_weight_kg !== null
                ? displayWeight(profile.goal_weight_kg, profile.unit_system || 'metric').formatted
                : undefined}
            />
          </div>
        </CollapsibleSection>

        {/* Goals & Training Section */}
        <CollapsibleSection
          id="goals"
          title={t('profile.goalsTraining')}
          icon={Target}
          onEdit={() => setShowGoalsModal(true)}
        >
          <div className="space-y-2">
            <DataRow label={t('profile.primaryGoal')} value={formatGoal(profile.primary_goal)} />
            <DataRow
              label="Secondary Goal"
              value={profile.secondary_goal ? formatGoal(profile.secondary_goal) : t('profile.none')}
            />
            <DataRow
              label={t('profile.experienceLevel')}
              value={formatExperienceLevel(profile.experience_level)}
            />
            <DataRow label={t('profile.activityLevel')} value={formatActivityLevel(profile.activity_level)} />
            <DataRow
              label={t('profile.workoutFrequency')}
              value={profile.workout_frequency ? `${profile.workout_frequency}${t('profile.timesPerWeek')}` : undefined}
            />
            {/* Fitness Notes */}
            {profile.fitness_notes && (
              <div className="pt-2 border-t border-iron-gray/20">
                <div className="text-sm text-iron-gray mb-1">Fitness Considerations</div>
                <div className="text-sm text-iron-white p-3 bg-iron-black/40 rounded-lg whitespace-pre-wrap">
                  {profile.fitness_notes}
                </div>
              </div>
            )}

            {/* Training Modalities */}
            <div className="pt-4 border-t border-iron-gray/30">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-iron-gray font-medium">Training Modalities</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowTrainingModalitiesModal(true)
                  }}
                  className="min-h-[36px] px-3 py-1.5 text-xs bg-iron-orange/20 text-iron-orange hover:bg-iron-orange/30 transition-colors rounded-lg border border-iron-orange/30 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              </div>
              {trainingModalities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {trainingModalities.map((tm) => (
                    <div
                      key={tm.id}
                      className="px-3 py-2 rounded-lg bg-iron-black/40 border border-iron-gray/30 flex items-center gap-2"
                    >
                      <span className="text-lg">{tm.training_modalities.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-sm text-iron-white font-medium">
                          {tm.training_modalities.name}
                          {tm.is_primary && <span className="ml-1 text-yellow-400">★</span>}
                        </span>
                        <span className="text-xs text-iron-gray capitalize">
                          {tm.proficiency_level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-iron-gray italic p-4 bg-iron-black/20 rounded-lg border border-iron-gray/20 text-center">
                  No training modalities selected
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Fitness Plan Section */}
        {!checkingPlan && currentPlan && (
          <CollapsibleSection id="fitness-plan" title="Fitness Plan" icon={Calendar}>
            <div className="space-y-4">
              {/* Plan Status */}
              <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Active Plan</span>
                </div>
                <p className="text-sm text-iron-gray">
                  You have an active personalized fitness plan
                </p>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => router.push('/plan')}
                  className="px-4 py-3 bg-iron-orange text-iron-black font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  View Plan
                </button>
                <button
                  onClick={() => setShowRegeneratePlanModal(true)}
                  className="px-4 py-3 bg-iron-gray/20 border border-iron-orange text-iron-orange font-medium rounded-lg hover:bg-iron-orange/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Regenerate Plan
                </button>
              </div>

              {/* Info */}
              <p className="text-xs text-iron-gray text-center">
                Regenerate your plan when your profile changes significantly
              </p>
            </div>
          </CollapsibleSection>
        )}

        {/* Nutrition Plan Section (Prominent Display) */}
        <CollapsibleSection id="macros" title={t('profile.nutritionPlan')} icon={TrendingUp}>
          <div className="space-y-4">
            {/* Calorie Goal - Large Display */}
            <div className="text-center p-5 bg-gradient-to-br from-iron-orange/10 to-transparent border border-iron-orange/30 rounded-lg">
              <div className="text-sm text-iron-gray mb-1 uppercase tracking-wider">{t('profile.dailyCalorieGoal')}</div>
              <div className="text-4xl font-heading text-iron-orange">
                {profile.daily_calorie_goal || '—'}
              </div>
              <div className="text-xs text-iron-gray mt-1">{t('profile.caloriesPerDay')}</div>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-iron-gray/10 border border-iron-gray/20 rounded-lg">
                <div className="text-xs text-iron-gray uppercase mb-1">Protein</div>
                <div className="text-2xl font-heading text-iron-white">{profile.daily_protein_goal || '—'}</div>
                <div className="text-xs text-iron-gray">g</div>
              </div>
              <div className="text-center p-3 bg-iron-gray/10 border border-iron-gray/20 rounded-lg">
                <div className="text-xs text-iron-gray uppercase mb-1">Carbs</div>
                <div className="text-2xl font-heading text-iron-white">{profile.daily_carbs_goal || '—'}</div>
                <div className="text-xs text-iron-gray">g</div>
              </div>
              <div className="text-center p-3 bg-iron-gray/10 border border-iron-gray/20 rounded-lg">
                <div className="text-xs text-iron-gray uppercase mb-1">Fats</div>
                <div className="text-2xl font-heading text-iron-white">{profile.daily_fat_goal || '—'}</div>
                <div className="text-xs text-iron-gray">g</div>
              </div>
            </div>

            {/* TDEE */}
            <div className="space-y-2 pt-2 border-t border-iron-gray/30">
              <DataRow label={t('profile.estimatedTDEE')} value={profile.estimated_tdee ? `${profile.estimated_tdee} ${t('profile.cal')}` : undefined} />
              <DataRow
                label={t('profile.macrosLastCalculated')}
                value={profile.macros_last_calculated_at ? formatDateDisplay(profile.macros_last_calculated_at, timezone, true) : undefined}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Dietary Preferences Section */}
        <CollapsibleSection
          id="dietary"
          title={t('profile.dietaryPreferences')}
          icon={Apple}
          onEdit={() => setShowDietaryModal(true)}
        >
          <div className="space-y-2">
            <DataRow
              label={t('profile.dietaryPreference')}
              value={formatDietaryPreference(profile.dietary_preference)}
            />
            <DataRow
              label={t('profile.foodAllergies')}
              value={profile.food_allergies && profile.food_allergies.length > 0 ? profile.food_allergies.join(', ') : t('profile.none')}
            />
            <DataRow
              label={t('profile.foodsToAvoid')}
              value={profile.foods_to_avoid && profile.foods_to_avoid.length > 0 ? profile.foods_to_avoid.join(', ') : t('profile.none')}
            />
            <DataRow label={t('profile.mealsPerDay')} value={profile.meals_per_day} />
            <DataRow label={t('profile.cooksRegularly')} value={profile.cooks_regularly ? t('profile.yes') : t('profile.no')} />
          </div>
        </CollapsibleSection>

        {/* Lifestyle Section */}
        <CollapsibleSection
          id="lifestyle"
          title={t('profile.lifestyle')}
          icon={Moon}
          onEdit={() => setShowLifestyleModal(true)}
        >
          <div className="space-y-2">
            <DataRow label={t('profile.sleepHours')} value={profile.sleep_hours ? `${profile.sleep_hours} ${t('profile.hoursPerNight')}` : undefined} />
            <DataRow
              label={t('profile.stressLevel')}
              value={formatStressLevel(profile.stress_level)}
            />
          </div>
        </CollapsibleSection>

        {/* Consultation Section (if completed) */}
        {profile.consultation_completed && (
          <CollapsibleSection id="consultation" title={t('profile.consultation')} icon={Heart}>
            <div className="space-y-2">
              <div className="p-4 bg-green-900/20 border border-green-700/50">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                  <Heart className="w-4 h-4" />
                  <span className="font-medium">{t('profile.consultationCompleted')}</span>
                </div>
                <p className="text-sm text-iron-gray">
                  {profile.consultation_completed_at
                    ? `${t('profile.completedOn')} ${formatDateDisplay(profile.consultation_completed_at, timezone, true)}`
                    : t('profile.youHaveCompleted')}
                </p>
              </div>
              {/* Additional consultation data can be displayed here when available */}
            </div>
          </CollapsibleSection>
        )}

        {/* Preferences Section */}
        <CollapsibleSection
          id="preferences"
          title={t('profile.preferences')}
          icon={Settings}
          onEdit={() => setShowPreferencesModal(true)}
        >
          <div className="space-y-2">
            <DataRow
              label={t('profile.language')}
              value={profile.language ? getLanguageDisplayName(profile.language as SupportedLanguage) : 'English'}
            />
            <DataRow
              label={t('profile.unitSystem')}
              value={formatUnitSystem(profile.unit_system)}
            />
            <DataRow label={t('profile.timezone')} value={profile.timezone} />
          </div>
        </CollapsibleSection>

        {/* Equipment Access Section */}
        <CollapsibleSection
          id="equipment"
          title="Equipment Access"
          icon={Dumbbell}
          onEdit={() => setShowEquipmentModal(true)}
        >
          <div className="space-y-2">
            {profile.equipment_access && profile.equipment_access.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.equipment_access.map((item) => (
                  <span key={item} className="px-3 py-1 bg-iron-orange/20 border border-iron-orange rounded-lg text-sm text-iron-white">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-iron-gray">No equipment access specified</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Training Schedule Section */}
        <CollapsibleSection
          id="schedule"
          title="Training Schedule"
          icon={Calendar}
          onEdit={() => setShowScheduleModal(true)}
        >
          <div className="space-y-2">
            {profile.weekly_schedule && profile.weekly_schedule.length > 0 ? (
              <div className="text-sm text-iron-white">
                <p className="mb-2 text-iron-gray">{profile.weekly_schedule.length} training slots per week</p>
                <div className="space-y-1">
                  {profile.weekly_schedule.slice(0, 5).map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-iron-orange">•</span>
                      <span>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][slot.day - 1]}</span>
                      <span className="text-iron-gray">-</span>
                      <span className="capitalize">{slot.time_block.replace('_', ' ')}</span>
                    </div>
                  ))}
                  {profile.weekly_schedule.length > 5 && (
                    <p className="text-iron-gray text-xs mt-1">+ {profile.weekly_schedule.length - 5} more</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-iron-gray">No training schedule set</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Meal Timing Section */}
        <CollapsibleSection
          id="meal-timing"
          title="Meal Timing"
          icon={Clock}
          onEdit={() => setShowMealTimingModal(true)}
        >
          <div className="space-y-2">
            {profile.meal_timing_preferences && profile.meal_timing_preferences.length > 0 ? (
              <div className="space-y-2">
                {profile.meal_timing_preferences.map((mt, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-iron-gray/20 last:border-0">
                    <span className="text-sm text-iron-white capitalize">{mt.meal_time_id.replace('-', ' ')}</span>
                    <span className="text-xs text-iron-gray">{mt.typical_portion_size} portion</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-iron-gray">No meal timing preferences set</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Exercise Familiarity Section */}
        <CollapsibleSection
          id="exercises"
          title="Exercise Familiarity"
          icon={Dumbbell}
          onEdit={() => setShowExerciseFamiliarityModal(true)}
        >
          <div className="space-y-2">
            {profile.exercise_familiarity && profile.exercise_familiarity.length > 0 ? (
              <div className="text-sm text-iron-white">
                <p className="mb-2 text-iron-gray">{profile.exercise_familiarity.length} exercises tracked</p>
                <div className="flex flex-wrap gap-2">
                  {profile.exercise_familiarity.slice(0, 8).map((ex, idx) => (
                    <span key={idx} className="px-2 py-1 bg-iron-gray/20 rounded text-xs">
                      Comfort: {ex.comfort_level}/5
                    </span>
                  ))}
                  {profile.exercise_familiarity.length > 8 && (
                    <span className="px-2 py-1 text-iron-gray text-xs">+ {profile.exercise_familiarity.length - 8} more</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-iron-gray">No exercise familiarity data</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Challenges Section */}
        <CollapsibleSection
          id="challenges"
          title="Challenges & Obstacles"
          icon={AlertCircle}
          onEdit={() => setShowChallengesModal(true)}
        >
          <div className="space-y-2">
            {profile.challenges && profile.challenges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.challenges.map((challenge) => (
                  <span key={challenge} className="px-3 py-1 bg-iron-orange/20 border border-iron-orange rounded-lg text-sm text-iron-white">
                    {challenge}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-iron-gray">No challenges specified</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Constraints/Non-Negotiables Section */}
        <CollapsibleSection
          id="constraints"
          title="Non-Negotiables"
          icon={Shield}
          onEdit={() => setShowConstraintsModal(true)}
        >
          <div className="space-y-2">
            {profile.non_negotiables && profile.non_negotiables.length > 0 ? (
              <div className="space-y-3">
                {profile.non_negotiables.map((constraint, idx) => (
                  <div key={idx} className="p-3 bg-iron-orange/10 border border-iron-orange/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-iron-orange flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-iron-white font-medium capitalize">{constraint.constraint_type.replace('_', ' ')}</p>
                        <p className="text-xs text-iron-gray mt-1">{constraint.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-iron-gray">No non-negotiables set</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Sign Out Button - Extra spacing to prevent accidental taps near nav */}
        <motion.button
          onClick={handleSignOut}
          className="w-full border-2 border-red-600/80 text-red-500 font-heading text-base sm:text-lg md:text-xl py-3 sm:py-4 uppercase tracking-wider hover:bg-red-600 hover:text-iron-white transition-colors flex items-center justify-center gap-2 rounded-xl mb-12"
          variants={sectionVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          {t('profile.signOut')}
        </motion.button>
      </motion.main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Modals */}
      {profile && (
        <>
          <EditPhysicalStatsModal
            profile={profile}
            isOpen={showPhysicalModal}
            onClose={() => setShowPhysicalModal(false)}
            onSuccess={handleUpdateSuccess}
            onError={handleUpdateError}
          />
          <EditGoalsModal
            profile={profile}
            isOpen={showGoalsModal}
            onClose={() => setShowGoalsModal(false)}
            onSuccess={handleUpdateSuccess}
            onError={handleUpdateError}
          />
          <EditDietaryModal
            profile={profile}
            isOpen={showDietaryModal}
            onClose={() => setShowDietaryModal(false)}
            onSuccess={handleUpdateSuccess}
            onError={handleUpdateError}
          />
          <EditLifestyleModal
            profile={profile}
            isOpen={showLifestyleModal}
            onClose={() => setShowLifestyleModal(false)}
            onSuccess={handleUpdateSuccess}
            onError={handleUpdateError}
          />
          <EditPreferencesModal
            profile={profile}
            isOpen={showPreferencesModal}
            onClose={() => setShowPreferencesModal(false)}
            onSuccess={handleUpdateSuccess}
            onError={handleUpdateError}
          />
          <EditTrainingModalitiesModal
            isOpen={showTrainingModalitiesModal}
            onClose={() => setShowTrainingModalitiesModal(false)}
            onSuccess={() => {
              loadProfile()
              setToast({ message: 'Training modalities updated', type: 'success' })
            }}
            onError={handleUpdateError}
          />
          <EditEquipmentModal
            profile={profile}
            isOpen={showEquipmentModal}
            onClose={() => setShowEquipmentModal(false)}
            onSuccess={handleUpdateSuccess}
            onError={handleUpdateError}
          />
          <EditScheduleModal
            profile={profile}
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
            onSuccess={handleUpdateSuccess}
            onError={handleUpdateError}
          />
          <EditMealTimingModal
            profile={profile}
            isOpen={showMealTimingModal}
            onClose={() => setShowMealTimingModal(false)}
            onSuccess={handleUpdateSuccess}
            onError={handleUpdateError}
          />
          <EditExerciseFamiliarityModal
            profile={profile}
            isOpen={showExerciseFamiliarityModal}
            onClose={() => setShowExerciseFamiliarityModal(false)}
            onSuccess={handleUpdateSuccess}
            onError={handleUpdateError}
          />
          <EditChallengesModal
            profile={profile}
            isOpen={showChallengesModal}
            onClose={() => setShowChallengesModal(false)}
            onSuccess={handleUpdateSuccess}
            onError={handleUpdateError}
          />
          <EditConstraintsModal
            profile={profile}
            isOpen={showConstraintsModal}
            onClose={() => setShowConstraintsModal(false)}
            onSuccess={handleUpdateSuccess}
            onError={handleUpdateError}
          />

          {/* Regenerate Plan Modal */}
          {currentPlan && (
            <GeneratePlanModal
              isOpen={showRegeneratePlanModal}
              onClose={() => setShowRegeneratePlanModal(false)}
              isRegeneration={true}
              currentPlanId={currentPlan.program_id}
              onSuccess={handlePlanRegenerated}
            />
          )}
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
