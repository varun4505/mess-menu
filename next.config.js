/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig; 