/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable server-side rendering for specific paths
  // This can help with MongoDB connection issues during build
  experimental: {
    // This is experimental and might change in future Next.js versions
    serverComponentsExternalPackages: ['mongoose'],
  },
  // Increase the timeout for builds
  staticPageGenerationTimeout: 180,
};

module.exports = nextConfig;
