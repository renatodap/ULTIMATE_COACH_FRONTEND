/**
 * API client for backend communication.
 */
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const carouselApi = {
  // Generate new carousel
  generate: async (data: {
    topic: string
    carousel_type: string
    slide_count?: number
    target_audience?: string
    brand_voice?: string
    auto_publish?: boolean
    generate_variants?: boolean
  }) => {
    const response = await api.post('/carousels/generate', data)
    return response.data
  },

  // List carousels
  list: async (params?: {
    page?: number
    page_size?: number
    status_filter?: string
  }) => {
    const response = await api.get('/carousels/', { params })
    return response.data
  },

  // Get carousel details
  get: async (carouselId: string) => {
    const response = await api.get(`/carousels/${carouselId}`)
    return response.data
  },

  // Get carousel progress
  getProgress: async (carouselId: string) => {
    const response = await api.get(`/carousels/${carouselId}/progress`)
    return response.data
  },

  // Update carousel
  update: async (
    carouselId: string,
    data: {
      caption?: string
      hashtags?: string[]
      scheduled_for?: string
    }
  ) => {
    const response = await api.patch(`/carousels/${carouselId}`, data)
    return response.data
  },

  // Delete carousel
  delete: async (carouselId: string) => {
    await api.delete(`/carousels/${carouselId}`)
  },

  // Estimate cost
  estimateCost: async (data: {
    slide_count: number
    generate_variants: boolean
  }) => {
    const response = await api.post('/carousels/estimate-cost', data)
    return response.data
  },
}

export const researchApi = {
  // Research topic
  researchTopic: async (data: {
    topic: string
    include_reddit?: boolean
    include_twitter?: boolean
    timeframe?: string
  }) => {
    const response = await api.post('/research/topic', data)
    return response.data
  },
}

export const analyticsApi = {
  // Get carousel analytics
  get: async (carouselId: string) => {
    const response = await api.get(`/analytics/${carouselId}`)
    return response.data
  },

  // Get performance prediction
  getPrediction: async (carouselId: string) => {
    const response = await api.get(`/analytics/${carouselId}/prediction`)
    return response.data
  },
}

export const publishingApi = {
  // Publish carousel
  publish: async (data: {
    carousel_id: string
    caption_override?: string
    hashtags_override?: string[]
    publish_immediately?: boolean
    scheduled_for?: string
  }) => {
    const response = await api.post('/publishing/publish', data)
    return response.data
  },
}

export const trendingApi = {
  // Get trending topics
  get: async (params?: { timeframe?: string; limit?: number }) => {
    const response = await api.get('/trending/', { params })
    return response.data
  },
}

// Authentication API
export const authApi = {
  // Register new user
  register: async (data: { email: string; password: string; full_name?: string }) => {
    const response = await api.post('/auth/register', data)
    // Save token to localStorage
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token)
    }
    return response.data
  },

  // Login user
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data)
    // Save token to localStorage
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token)
    }
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
  },
}

// Onboarding and Business Profile API
export const onboardingApi = {
  // Start onboarding process
  start: async () => {
    const response = await api.post('/onboarding/start')
    return response.data
  },

  // Get onboarding progress
  getProgress: async () => {
    const response = await api.get('/onboarding/progress')
    return response.data
  },

  // Update onboarding step
  updateStep: async (data: { step: number; data: Record<string, any> }) => {
    const response = await api.post('/onboarding/update-step', data)
    return response.data
  },

  // Complete onboarding
  complete: async (data: { profile_data: any }) => {
    const response = await api.post('/onboarding/complete', data)
    return response.data
  },
}

export const businessProfileApi = {
  // Get business profile
  get: async () => {
    const response = await api.get('/profiles/me')
    return response.data
  },

  // Update business profile
  update: async (data: { profile_data: any }) => {
    const response = await api.put('/profiles/me', data)
    return response.data
  },

  // Get profile completion status
  getCompletionStatus: async () => {
    const response = await api.get('/profiles/completion-status')
    return response.data
  },

  // Delete business profile
  delete: async () => {
    await api.delete('/profiles/me')
  },
}

// Approval workflow API
export const approvalApi = {
  // Get approval workflow status
  getStatus: async (carouselId: string) => {
    const response = await api.get(`/carousels/${carouselId}/approval`)
    return response.data
  },

  // Get specific stage variants
  getStage: async (carouselId: string, stage: string) => {
    const response = await api.get(`/carousels/${carouselId}/approval/stages/${stage}`)
    return response.data
  },

  // Approve a variant
  approveVariant: async (carouselId: string, data: {
    variant_id: string
    user_notes?: string
    selection_reason?: string
  }) => {
    const response = await api.post(`/carousels/${carouselId}/approval/approve`, data)
    return response.data
  },

  // Reject stage and regenerate
  rejectStage: async (carouselId: string, data: {
    carousel_id: string
    stage: string
    rejection_reason: string
    regeneration_prompt?: string
  }) => {
    const response = await api.post(`/carousels/${carouselId}/approval/reject`, data)
    return response.data
  },

  // Edit variant
  editVariant: async (carouselId: string, data: {
    variant_id: string
    edited_data: any
    edit_notes?: string
  }) => {
    const response = await api.patch(`/carousels/${carouselId}/approval/edit`, data)
    return response.data
  },

  // Record engagement data
  recordEngagement: async (carouselId: string, data: {
    carousel_id: string
    impressions: number
    reach: number
    likes: number
    comments: number
    saves: number
    shares: number
    published_at: string
  }) => {
    const response = await api.post(`/carousels/${carouselId}/engagement`, data)
    return response.data
  },
}
