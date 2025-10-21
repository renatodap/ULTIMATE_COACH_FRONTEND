'use client'

/**
 * AI Insight Card
 *
 * Displays contextual AI-powered insights on Dashboard
 * Provides personalized feedback, suggestions, and encouragement
 *
 * Part of Phase 5: AI-First UX Transformation
 */

import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Target, Zap, Heart, AlertCircle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export type InsightType = 'progress' | 'pattern' | 'suggestion' | 'encouragement' | 'alert' | 'achievement'

export interface Insight {
  id: string
  type: InsightType
  title: string
  message: string
  action?: {
    label: string
    path: string
  }
  importance: 'low' | 'medium' | 'high'
}

interface InsightCardProps {
  insight: Insight
}

export function InsightCard({ insight }: InsightCardProps) {
  const router = useRouter()

  // Icon and color based on insight type
  const getTypeConfig = () => {
    switch (insight.type) {
      case 'progress':
        return {
          icon: TrendingUp,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
        }
      case 'pattern':
        return {
          icon: Zap,
          color: 'text-iron-orange',
          bgColor: 'bg-iron-orange/10',
          borderColor: 'border-iron-orange/30',
        }
      case 'suggestion':
        return {
          icon: Sparkles,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30',
        }
      case 'encouragement':
        return {
          icon: Heart,
          color: 'text-pink-500',
          bgColor: 'bg-pink-500/10',
          borderColor: 'border-pink-500/30',
        }
      case 'alert':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
        }
      case 'achievement':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
        }
    }
  }

  const config = getTypeConfig()
  const Icon = config.icon

  return (
    <motion.div
      className={`card-glass border ${config.borderColor} overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`flex-shrink-0 w-10 h-10 ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-iron-white uppercase tracking-wider">
              {insight.title}
            </h3>
            <p className="text-sm text-iron-gray mt-1 leading-relaxed">
              {insight.message}
            </p>
          </div>
        </div>

        {/* Action button (if provided) */}
        {insight.action && (
          <button
            onClick={() => router.push(insight.action.path)}
            className="w-full mt-3 px-4 py-2 bg-iron-gray/20 hover:bg-iron-gray/30 text-iron-white text-sm font-medium
              transition-colors border border-iron-gray/30 hover:border-iron-orange/50"
          >
            {insight.action.label}
          </button>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Insight Cards Grid
 * Displays multiple insights in a responsive grid
 */
interface InsightCardsGridProps {
  insights: Insight[]
}

export function InsightCardsGrid({ insights }: InsightCardsGridProps) {
  if (insights.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  )
}
