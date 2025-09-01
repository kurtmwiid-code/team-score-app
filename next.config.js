// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ allows deploys even with lint errors
  },
};

module.exports = nextConfig;
