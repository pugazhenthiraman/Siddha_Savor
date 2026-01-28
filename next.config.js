/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@/components', '@/lib'],
  },

  // Ignore lint errors during build since the environment is causing patching issues
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimize for development
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Faster rebuilds
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 200,
      };

      // Enable source maps only for debugging
      config.devtool = 'eval-cheap-module-source-map';

      // Optimize chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },

  // Optimize pages
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Enable React optimizations
  reactStrictMode: false,

  // Optimize images and assets
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },

  // Compress responses
  compress: true,
};

module.exports = nextConfig;
