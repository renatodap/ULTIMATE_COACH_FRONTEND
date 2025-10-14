'use client'

/**
 * Weight Log Modal Component
 *
 * Quick weight logging modal with kg/lbs toggle
 * Sharp design, NO rounded corners, mobile-first, full-screen on mobile
 */

import { useState } from 'react'
import { createBodyMetric } from '@/lib/api/body-metrics'

interface WeightLogModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultUnit?: 'kg' | 'lbs'
}

export default function WeightLogModal({ isOpen, onClose, onSuccess, defaultUnit = 'kg' }: WeightLogModalProps) {
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState<'kg' | 'lbs'>(defaultUnit)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convert to kg if needed
      let weightKg = parseFloat(weight)
      if (unit === 'lbs') {
        weightKg = weightKg * 0.453592
      }

      if (weightKg < 30 || weightKg > 300) {
        setError('Weight must be between 30-300 kg (66-661 lbs)')
        setLoading(false)
        return
      }

      await createBodyMetric({
        recorded_at: new Date().toISOString(),
        weight_kg: parseFloat(weightKg.toFixed(2)),
        notes: notes || null
      })

      // Success
      setWeight('')
      setNotes('')
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Failed to log weight:', err)
      setError(err.response?.data?.detail || 'Failed to log weight. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-iron-black/80 backdrop-blur-sm flex items-end md:items-center justify-center">
      {/* Modal */}
      <div className="bg-iron-dark-gray border-t md:border border-iron-gray w-full md:max-w-md md:m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-iron-gray/30">
          <h2 className="text-lg font-bold text-iron-white uppercase tracking-wider">
            Log Weight
          </h2>
          <button
            onClick={onClose}
            className="text-iron-gray hover:text-iron-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Unit Toggle */}
          <div>
            <label className="text-sm text-iron-gray mb-2 block uppercase tracking-wider">
              Unit
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUnit('kg')}
                className={`py-3 border transition ${
                  unit === 'kg'
                    ? 'border-iron-orange bg-iron-orange text-iron-black'
                    : 'border-iron-gray text-iron-white hover:border-iron-white'
                }`}
              >
                <span className="font-bold uppercase tracking-wider">KG</span>
              </button>
              <button
                type="button"
                onClick={() => setUnit('lbs')}
                className={`py-3 border transition ${
                  unit === 'lbs'
                    ? 'border-iron-orange bg-iron-orange text-iron-black'
                    : 'border-iron-gray text-iron-white hover:border-iron-white'
                }`}
              >
                <span className="font-bold uppercase tracking-wider">LBS</span>
              </button>
            </div>
          </div>

          {/* Weight Input */}
          <div>
            <label htmlFor="weight" className="text-sm text-iron-gray mb-2 block uppercase tracking-wider">
              Weight
            </label>
            <input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={unit === 'kg' ? 'e.g., 75.5' : 'e.g., 165.0'}
              required
              className="input"
            />
            <p className="text-xs text-iron-gray mt-2">
              {unit === 'kg' ? 'Enter weight in kilograms (30-300 kg)' : 'Enter weight in pounds (66-661 lbs)'}
            </p>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label htmlFor="notes" className="text-sm text-iron-gray mb-2 block uppercase tracking-wider">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., morning weight, after workout"
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading || !weight}
            >
              {loading ? 'Logging...' : 'Log Weight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
