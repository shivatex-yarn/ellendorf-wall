/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1tjlmah25kwg0.cloudfront.net",
        pathname: "/templates/images/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],
    // Optimize images for production
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "70mb",
    },
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Optimize for production scale
  reactStrictMode: true,
  
  // Headers for caching and performance
  async headers() {
    return [
      {
        source: '/api/wallpapers',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/wallpaper",
        destination: "https://riw-wall-admin-2-4-2.onrender.com/api/wallpaper",
      },
    ];
  },
};

module.exports = nextConfig;
