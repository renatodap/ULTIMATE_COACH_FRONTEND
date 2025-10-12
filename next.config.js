/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['txuebspgxwtnwmwiwxfo.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config) => {
    // Fix for Windows path issues
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
}

module.exports = nextConfig
