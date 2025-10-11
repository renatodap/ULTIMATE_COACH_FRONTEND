'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { businessProfileApi } from '@/lib/api'
import { BusinessProfileData } from '@/lib/types/onboarding'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<BusinessProfileData>>({
    business_name: '',
    industry: '',
    website_url: '',
    target_audience: '',
    audience_pain_points: [],
    brand_voice: '',
    brand_personality: '',
    brand_values: [],
    content_goals: [],
    key_topics: [],
    content_style_preferences: '',
    posting_frequency: '',
    best_performing_topics: [],
    preferred_colors: [],
    visual_style: '',
    competitors: [],
    unique_selling_points: [],
    example_copy_they_like: '',
    example_hooks: [],
    current_follower_count: undefined,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Save profile
      await businessProfileApi.update({
        profile_data: formData as BusinessProfileData,
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Failed to save profile:', err)
      setError(err.response?.data?.detail || 'Failed to save profile')
      setLoading(false)
    }
  }

  const handleArrayInput = (field: keyof BusinessProfileData, value: string) => {
    const items = value.split(',').map((item) => item.trim()).filter(Boolean)
    setFormData((prev) => ({ ...prev, [field]: items }))
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Carousel Agent
          </h1>
          <p className="text-gray-400">
            Tell us about your business to personalize your carousels
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Single Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 space-y-8">

          {/* Section 1: Business Basics */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
              1. Business Basics
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., AI Productivity Co"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Industry <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., SaaS, E-commerce, Coaching"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Website URL <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Audience <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Small business owners aged 25-45 who want to improve productivity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audience Pain Points <span className="text-gray-500">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={formData.audience_pain_points?.join(', ')}
                onChange={(e) => handleArrayInput('audience_pain_points', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Time management, Overwhelm, Low productivity"
              />
            </div>
          </div>

          {/* Section 2: Brand Voice & Identity */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
              2. Brand Voice & Identity
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Brand Voice <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.brand_voice}
                onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a voice...</option>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="casual">Casual</option>
                <option value="authoritative">Authoritative</option>
                <option value="inspirational">Inspirational</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Brand Personality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.brand_personality}
                onChange={(e) => setFormData({ ...formData, brand_personality: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Approachable expert, Innovative leader"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Brand Values <span className="text-gray-500">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={formData.brand_values?.join(', ')}
                onChange={(e) => handleArrayInput('brand_values', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Innovation, Simplicity, Results"
              />
            </div>
          </div>

          {/* Section 3: Content Strategy */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
              3. Content Strategy
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content Goals <span className="text-gray-500">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={formData.content_goals?.join(', ')}
                onChange={(e) => handleArrayInput('content_goals', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Educate, Inspire, Drive sales"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Key Topics <span className="text-gray-500">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={formData.key_topics?.join(', ')}
                onChange={(e) => handleArrayInput('key_topics', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Productivity tips, AI tools, Time management"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Example Copy You Like <span className="text-gray-500">(helps match your style)</span>
              </label>
              <textarea
                value={formData.example_copy_they_like}
                onChange={(e) => setFormData({ ...formData, example_copy_they_like: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Paste examples of Instagram captions or content you admire..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Example Hooks <span className="text-gray-500">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={formData.example_hooks?.join(', ')}
                onChange={(e) => handleArrayInput('example_hooks', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Want to 10x your productivity?, Stop wasting time on..."
              />
            </div>
          </div>

          {/* Section 4: Visual Identity */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
              4. Visual Identity
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred Colors <span className="text-gray-500">(comma-separated hex codes)</span>
              </label>
              <input
                type="text"
                value={formData.preferred_colors?.join(', ')}
                onChange={(e) => handleArrayInput('preferred_colors', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., #6366f1, #8b5cf6, #ec4899"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Visual Style <span className="text-gray-500">(optional)</span>
              </label>
              <select
                value={formData.visual_style}
                onChange={(e) => setFormData({ ...formData, visual_style: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a style...</option>
                <option value="minimal">Minimal</option>
                <option value="bold">Bold</option>
                <option value="elegant">Elegant</option>
                <option value="playful">Playful</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>

          {/* Section 5: Competitive Edge */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
              5. Competitive Edge
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Unique Selling Points <span className="text-gray-500">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={formData.unique_selling_points?.join(', ')}
                onChange={(e) => handleArrayInput('unique_selling_points', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., AI-powered, Fastest delivery, 24/7 support"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Competitors <span className="text-gray-500">(comma-separated, optional)</span>
              </label>
              <input
                type="text"
                value={formData.competitors?.join(', ')}
                onChange={(e) => handleArrayInput('competitors', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Competitor A, Competitor B"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Follower Count <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="number"
                value={formData.current_follower_count || ''}
                onChange={(e) => setFormData({ ...formData, current_follower_count: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 5000"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Skip for now
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-center text-sm text-gray-500 pt-4">
            <span className="text-red-500">*</span> Required fields
            <br />
            You can always update your profile later in settings
          </p>
        </form>
      </div>
    </div>
  )
}
