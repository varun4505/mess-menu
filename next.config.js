/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removing the 'output: export' setting to enable API routes
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // swcMinify is now enabled by default in newer Next.js versions
};

module.exports = nextConfig;