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
      {
        protocol: "https",
        hostname: "app1-reimagine-wallpaper.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
    ],
    // Optimize image loading
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "70mb",
    },
    optimizeCss: true,
  },

  // Compression
  compress: true,

  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://riw-wall-admin-2-4-2.onrender.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
