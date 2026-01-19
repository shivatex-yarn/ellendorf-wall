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
};

module.exports = nextConfig;
