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
  // Add runtime configuration
  poweredByHeader: false,
  // Add error handling for runtime errors
  onDemandEntries: {
    // Keep pages in memory for 5 minutes
    maxInactiveAge: 5 * 60 * 1000,
    // Have 10 pages in memory at most
    pagesBufferLength: 10,
  },
};

module.exports = nextConfig;
