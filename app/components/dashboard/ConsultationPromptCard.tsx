'use client'

/**
 * ConsultationPromptCard
 *
 * Prominent card that prompts users to complete AI consultation
 * Only shown when consultation_completed === false
 *
 * Design: Mobile-first, sharp iron aesthetic with accent edge
 */

import { Sparkles, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ConsultationPromptCard() {
  const router = useRouter()

  return (
    <div className="relative card-glass surface-elevated border-2 border-iron-orange p-6 accent-edge">
      {/* Badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-iron-orange">
          <Sparkles className="w-5 h-5 text-iron-black" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-iron-orange">
          Required
        </span>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold uppercase tracking-wider text-iron-white mb-2">
        Get Your Personalized Program
      </h2>

      {/* Subtext */}
      <p className="text-iron-gray text-sm mb-6">
        Complete a 15-20 minute AI consultation and receive a custom 2-week training + nutrition program tailored to your goals, schedule, and experience.
      </p>

      {/* CTA Button */}
      <button
        onClick={() => router.push('/dashboard/consultation')}
        className="w-full btn-primary tap-target active-press flex items-center justify-center gap-3 py-4"
      >
        <span className="font-bold text-base uppercase tracking-widest">
          Start Consultation
        </span>
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Benefits List */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-iron-gray">
          <span>✓</span>
          <span>2-week periodized training plan</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-iron-gray">
          <span>✓</span>
          <span>Daily meal plans with recipes</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-iron-gray">
          <span>✓</span>
          <span>Personalized to your schedule & equipment</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-iron-gray">
          <span>⏱</span>
          <span className="opacity-70">15-20 minute consultation</span>
        </div>
      </div>
    </div>
  )
}
