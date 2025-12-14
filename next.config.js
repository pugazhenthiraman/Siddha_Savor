/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack for better stability with Node 18
  experimental: {
    turbo: false,
  },
  
  // Optimize for development
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Reduce memory usage in development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      
      // Disable source maps for faster builds
      config.devtool = false;
    }
    
    return config;
  },
  
  // Reduce build cache issues
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Disable strict mode to prevent double renders
  reactStrictMode: false,
};

module.exports = nextConfig;
