/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/category/portable-power",
        destination: "/category/electronics-tech-accessories",
        permanent: true,
      },
      {
        source: "/category/travel-gear",
        destination: "/category/travel",
        permanent: true,
      },
      {
        source: "/category/everyday-carry",
        destination: "/category/travel",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
