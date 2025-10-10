'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approvalApi } from '@/lib/api'
import { TrendingUp, Calendar, CheckCircle } from 'lucide-react'

interface EngagementFormProps {
  carouselId: string
  onSuccess?: () => void
}

export function EngagementForm({ carouselId, onSuccess }: EngagementFormProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    impressions: '',
    reach: '',
    likes: '',
    comments: '',
    saves: '',
    shares: '',
    published_at: '',
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const recordMutation = useMutation({
    mutationFn: (data: any) => approvalApi.recordEngagement(carouselId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['carousel', carouselId] })
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onSuccess?.()
      }, 3000)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      carousel_id: carouselId,
      impressions: parseInt(formData.impressions) || 0,
      reach: parseInt(formData.reach) || 0,
      likes: parseInt(formData.likes) || 0,
      comments: parseInt(formData.comments) || 0,
      saves: parseInt(formData.saves) || 0,
      shares: parseInt(formData.shares) || 0,
      published_at: formData.published_at || new Date().toISOString(),
    }

    recordMutation.mutate(data)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Calculate engagement rate preview
  const impressions = parseInt(formData.impressions) || 0
  const saves = parseInt(formData.saves) || 0
  const likes = parseInt(formData.likes) || 0
  const comments = parseInt(formData.comments) || 0
  const shares = parseInt(formData.shares) || 0

  const saveRate = impressions > 0 ? ((saves / impressions) * 100).toFixed(2) : '0.00'
  const engagementRate = impressions > 0
    ? (((likes + comments + saves + shares) / impressions) * 100).toFixed(2)
    : '0.00'
  const performedWell = parseFloat(saveRate) > 3

  if (showSuccess) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-900 mb-2">
          Engagement Data Recorded!
        </h3>
        <p className="text-green-700 mb-4">
          {performedWell ? (
            <>
              🎉 Your carousel performed well! (Save rate: {saveRate}% &gt; 3%)
            </>
          ) : (
            <>
              Save rate: {saveRate}% (Target: &gt;3%)
            </>
          )}
        </p>
        <div className="text-sm text-green-600">
          The system will learn from this performance data to improve future carousels.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-brand-600" />
        <div>
          <h3 className="text-lg font-bold">Record Engagement Metrics</h3>
          <p className="text-sm text-gray-600">
            Help the system learn by recording real Instagram performance
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Published Date */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Published Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="datetime-local"
              value={formData.published_at}
              onChange={(e) => handleChange('published_at', e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Impressions * <span className="text-gray-500 font-normal">(total views)</span>
            </label>
            <input
              type="number"
              value={formData.impressions}
              onChange={(e) => handleChange('impressions', e.target.value)}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g., 12500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Reach <span className="text-gray-500 font-normal">(unique accounts)</span>
            </label>
            <input
              type="number"
              value={formData.reach}
              onChange={(e) => handleChange('reach', e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g., 9800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Likes
            </label>
            <input
              type="number"
              value={formData.likes}
              onChange={(e) => handleChange('likes', e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g., 430"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Comments
            </label>
            <input
              type="number"
              value={formData.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g., 28"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Saves * <span className="text-gray-500 font-normal">(most important!)</span>
            </label>
            <input
              type="number"
              value={formData.saves}
              onChange={(e) => handleChange('saves', e.target.value)}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g., 385"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Shares
            </label>
            <input
              type="number"
              value={formData.shares}
              onChange={(e) => handleChange('shares', e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g., 67"
            />
          </div>
        </div>

        {/* Calculated Metrics Preview */}
        {impressions > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              Calculated Metrics:
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Engagement Rate:</span>
              <span className="font-semibold">{engagementRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Save Rate:</span>
              <span
                className={`font-semibold ${
                  performedWell ? 'text-green-600' : 'text-orange-600'
                }`}
              >
                {saveRate}%
                {performedWell ? ' ✓ Good!' : ' (Target: >3%)'}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Save rate &gt; 3% = high-quality, valuable content
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={recordMutation.isPending}
            className="flex-1 px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {recordMutation.isPending ? 'Recording...' : 'Record Engagement Data'}
          </button>
        </div>

        {recordMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Failed to record engagement data. Please try again.
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <strong>💡 Tip:</strong> Record metrics 24-48 hours after publishing for best results.
        This data helps the system learn which content performs well and improve future
        generations.
      </div>
    </div>
  )
}
