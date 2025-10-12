import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-project.supabase.co'], // Add your Supabase domain
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
