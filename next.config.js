/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ['localhost:3000'] } },
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // Derive NEXTAUTH_URL from Vercel's system env when not explicitly set
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? (
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    ),
  },
}

module.exports = nextConfig
