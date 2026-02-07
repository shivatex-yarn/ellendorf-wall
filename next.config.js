
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1tjlmah25kwg0.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600, // Increased to 1 hour for better caching with 3,000 concurrent users
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "70mb",
    },
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://ellendorf-server.onrender.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
