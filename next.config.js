/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['coindesk.com', 'cointelegraph.com', 'bitcoinist.com', 'decrypt.co', 'theblockcrypto.com', 'blockworks.co', 'dlnews.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/rss/:path*',
        destination: '/api/rss/:path*',
      },
    ];
  },
}

module.exports = nextConfig
