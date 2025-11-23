/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ Do not fail `next build` because of ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;