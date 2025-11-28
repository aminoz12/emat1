/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    // Optimize images for Vercel
    unoptimized: false,
  },
  // Optimize performance
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Enable static optimization
  swcMinify: true,
  // Optimize build output
  experimental: {
    // optimizeCss: true, // Disabled due to missing critters dependency
  },
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Output configuration for Vercel
  output: 'standalone',
  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

module.exports = nextConfig
