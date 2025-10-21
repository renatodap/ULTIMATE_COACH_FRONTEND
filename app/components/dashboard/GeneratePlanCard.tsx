'use client'

/**
 * Generate Plan Card
 *
 * Prominent CTA card shown on Dashboard when user has no active plan
 * Encourages user to generate their first personalized fitness plan
 *
 * Part of Phase 4: Plan Generation System
 */

import { motion } from 'framer-motion'
import { Sparkles, Calendar, Dumbbell, Apple } from 'lucide-react'

interface GeneratePlanCardProps {
  onGenerateClick: () => void
}

export default function GeneratePlanCard({ onGenerateClick }: GeneratePlanCardProps) {
  return (
    <motion.div
      className="card-glass border-2 border-iron-orange/50 overflow-hidden accent-edge"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-br from-iron-orange/20 to-iron-orange/5 p-6 border-b border-iron-orange/30">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-iron-orange" />
          <h2 className="text-2xl font-heading text-iron-white uppercase tracking-wider">
            Ready To Start?
          </h2>
        </div>
        <p className="text-iron-gray text-sm">
          Generate your personalized fitness plan based on your profile
        </p>
      </div>

      {/* Features list */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Workouts */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-iron-orange/10 border border-iron-orange/30 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-iron-orange" />
            </div>
            <div>
              <p className="text-iron-white font-bold text-sm uppercase tracking-wider">
                Custom Workouts
              </p>
              <p className="text-iron-gray text-xs mt-1">
                Tailored to your goals and equipment
              </p>
            </div>
          </div>

          {/* Schedule */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-iron-orange/10 border border-iron-orange/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-iron-orange" />
            </div>
            <div>
              <p className="text-iron-white font-bold text-sm uppercase tracking-wider">
                Smart Schedule
              </p>
              <p className="text-iron-gray text-xs mt-1">
                Fits your availability perfectly
              </p>
            </div>
          </div>

          {/* Nutrition */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-iron-orange/10 border border-iron-orange/30 flex items-center justify-center">
              <Apple className="w-5 h-5 text-iron-orange" />
            </div>
            <div>
              <p className="text-iron-white font-bold text-sm uppercase tracking-wider">
                Meal Timing
              </p>
              <p className="text-iron-gray text-xs mt-1">
                Optimized around your training
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={onGenerateClick}
          className="w-full mt-6 px-6 py-4 bg-iron-orange text-iron-black font-bold uppercase tracking-wider text-base
            hover:bg-orange-600 active:scale-98 transition-all duration-200
            flex items-center justify-center gap-3 group"
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Generate My Plan
          <Sparkles className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
        </motion.button>

        {/* Info text */}
        <p className="text-xs text-iron-gray text-center mt-3">
          Takes 10-15 seconds • Uses your complete profile data
        </p>
      </div>
    </motion.div>
  )
}
