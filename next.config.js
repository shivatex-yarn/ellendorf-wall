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