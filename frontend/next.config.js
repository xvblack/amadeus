/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      // {
      //   source: '/api/:path*',
      //   destination: 'http://localhost:4000/:path*' // Proxy to Backend
      // }
    ]
  },
  output: 'standalone',
}

module.exports = nextConfig
