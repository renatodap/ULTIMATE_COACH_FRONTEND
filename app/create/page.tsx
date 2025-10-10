'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { carouselApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sparkles, Loader2, DollarSign } from 'lucide-react'

export default function CreateCarouselPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    topic: '',
    carousel_type: 'explainer',
    slide_count: 8,
    target_audience: 'AI enthusiasts',
    brand_voice: 'educational_engaging',
    auto_publish: false,
    generate_variants: true,
  })

  // Fetch cost estimate when slide count or variants change
  const { data: costEstimate } = useQuery({
    queryKey: ['cost-estimate', formData.slide_count, formData.generate_variants],
    queryFn: () =>
      carouselApi.estimateCost({
        slide_count: formData.slide_count,
        generate_variants: formData.generate_variants,
      }),
  })

  const generateMutation = useMutation({
    mutationFn: carouselApi.generate,
    onSuccess: (data) => {
      toast.success('Carousel generation started!')
      router.push(`/carousel/${data.carousel_id}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Generation failed')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateMutation.mutate(formData)
  }

  const carouselTypes = [
    { value: 'explainer', label: 'Concept Explainer', description: 'Break down complex topics' },
    { value: 'tool_breakdown', label: 'Tool Breakdown', description: 'Feature analysis & review' },
    { value: 'news_digest', label: 'News Digest', description: 'Weekly AI news roundup' },
    { value: 'comparison', label: 'Comparison', description: 'Before/after or A vs B' },
    { value: 'tips', label: 'Tips & Hacks', description: 'Actionable advice' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-brand-600" />
            Create AI Carousel
          </h1>
          <p className="text-gray-600 mt-1">
            Generate a professional Instagram carousel in minutes
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
          {/* Topic */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic *
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              placeholder="e.g., How vector embeddings work in AI"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Be specific and focused. This will guide the research and copy.
            </p>
          </div>

          {/* Carousel Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Carousel Type *
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {carouselTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, carousel_type: type.value })
                  }
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    formData.carousel_type === type.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium mb-1">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Slide Count */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Slides: {formData.slide_count}
            </label>
            <input
              type="range"
              min="5"
              max="10"
              value={formData.slide_count}
              onChange={(e) =>
                setFormData({ ...formData, slide_count: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>5 slides</span>
              <span>10 slides</span>
            </div>
          </div>

          {/* Target Audience */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) =>
                setFormData({ ...formData, target_audience: e.target.value })
              }
              placeholder="e.g., AI developers, content creators"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Brand Voice */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Voice
            </label>
            <select
              value={formData.brand_voice}
              onChange={(e) =>
                setFormData({ ...formData, brand_voice: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="educational_engaging">Educational & Engaging</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual & Friendly</option>
              <option value="technical">Technical & In-Depth</option>
              <option value="playful">Playful & Fun</option>
            </select>
          </div>

          {/* Options */}
          <div className="mb-6 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.generate_variants}
                onChange={(e) =>
                  setFormData({ ...formData, generate_variants: e.target.checked })
                }
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
              />
              <div>
                <div className="font-medium">Generate A/B test variants</div>
                <div className="text-sm text-gray-600">
                  Create multiple hook variations for testing
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.auto_publish}
                onChange={(e) =>
                  setFormData({ ...formData, auto_publish: e.target.checked })
                }
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
              />
              <div>
                <div className="font-medium">Auto-publish when complete</div>
                <div className="text-sm text-gray-600">
                  Automatically post to Instagram when generation finishes
                </div>
              </div>
            </label>
          </div>

          {/* Cost Estimate */}
          <div className="mb-6 p-4 bg-gradient-to-br from-brand-50 to-blue-50 rounded-lg border border-brand-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-600" />
                <span className="text-sm font-semibold text-gray-800">
                  Cost Estimate
                </span>
              </div>
              {costEstimate ? (
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-600">
                    ${costEstimate.estimated_cost.toFixed(2)}
                  </div>
                  {costEstimate.within_limit ? (
                    <span className="text-xs text-green-600 font-medium">✓ Within limit</span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">⚠ Exceeds ${costEstimate.user_limit.toFixed(2)} limit</span>
                  )}
                </div>
              ) : (
                <div className="text-lg font-bold text-gray-400 animate-pulse">
                  Calculating...
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            {costEstimate && (
              <div className="space-y-1 mb-3 pb-3 border-b border-brand-200">
                {Object.entries(costEstimate.breakdown).map(([service, cost]) => (
                  (cost as number) > 0 && (
                    <div key={service} className="flex justify-between text-xs text-gray-600">
                      <span className="capitalize">{service.replace('_', ' ')}</span>
                      <span className="font-mono">${(cost as number).toFixed(2)}</span>
                    </div>
                  )
                ))}
              </div>
            )}

            <div className="text-xs text-gray-600 flex items-center justify-between">
              <span>⏱ Estimated time: 5-10 minutes</span>
              <span>💳 Charged after completion</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={generateMutation.isPending || !formData.topic}
            className="w-full px-6 py-4 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Carousel...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Carousel
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
