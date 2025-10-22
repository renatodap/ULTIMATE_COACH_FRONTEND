"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentProgram } from '@/lib/api/planning'

export default function PlanSummaryPage() {
  const router = useRouter()
  const [program, setProgram] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProgram()
  }, [])

  async function fetchProgram() {
    try {
      setLoading(true)
      setError(null)
      const data = await getCurrentProgram()
      setProgram(data)
    } catch (err) {
      console.error('Error fetching program:', err)
      setError('No program found')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-iron-orange"></div>
          <p className="mt-2 text-iron-gray">Loading program...</p>
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="space-y-4">
        <div className="bg-iron-dark-gray border border-iron-gray rounded-lg p-6 text-center">
          <span className="text-4xl mb-3 block">📋</span>
          <h3 className="text-lg font-semibold text-iron-white mb-2">
            No Program Yet
          </h3>
          <p className="text-sm text-iron-gray mb-4">
            Generate your personalized fitness program to get started.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-iron-orange text-iron-black rounded-lg font-semibold hover:bg-iron-orange/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Program Overview */}
      <div className="bg-iron-dark-gray border border-iron-gray rounded-lg p-4">
        <h2 className="text-lg font-semibold text-iron-white mb-3">
          Your Program
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Tile label="Goal" value={program.primary_goal} />
          <Tile
            label="Duration"
            value={`${program.training_sessions?.length || 0} sessions/week`}
          />
          <Tile label="Start Date" value={program.program_start_date} />
          <Tile label="Next Check-in" value={program.next_reassessment_date} />
        </div>
      </div>

      {/* Nutrition Targets */}
      <div className="bg-iron-dark-gray border border-iron-gray rounded-lg p-4">
        <h3 className="text-sm font-semibold text-iron-white mb-3">
          Daily Nutrition
        </h3>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-iron-white">
              {program.tdee}
            </div>
            <div className="text-xs text-iron-gray">calories</div>
          </div>
          <div>
            <div className="text-lg font-bold text-iron-white">
              {program.macros?.protein_g}g
            </div>
            <div className="text-xs text-iron-gray">protein</div>
          </div>
          <div>
            <div className="text-lg font-bold text-iron-white">
              {program.macros?.carbs_g}g
            </div>
            <div className="text-xs text-iron-gray">carbs</div>
          </div>
          <div>
            <div className="text-lg font-bold text-iron-white">
              {program.macros?.fat_g}g
            </div>
            <div className="text-xs text-iron-gray">fat</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <button
          onClick={() => router.push('/plan/today')}
          className="w-full py-3 bg-iron-orange text-iron-black rounded-lg font-semibold hover:bg-iron-orange/90 transition-colors"
        >
          View Today's Plan
        </button>
        <button
          onClick={() => router.push('/plan/week')}
          className="w-full py-3 bg-iron-gray/20 border border-iron-gray text-iron-white rounded-lg font-semibold hover:bg-iron-gray/30 transition-colors"
        >
          View Week Schedule
        </button>
      </div>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
      <div className="text-xs text-neutral-400">{label}</div>
      <div className="text-base font-medium mt-1">{value}</div>
    </div>
  )
}
