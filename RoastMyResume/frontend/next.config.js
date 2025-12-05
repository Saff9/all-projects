/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/roast',
        destination: '/api/index',
      },
      {
        source: '/api/create-share-link',
        destination: '/api/index',
      },
      {
        source: '/api/stripe-webhook',
        destination: '/api/index',
      },
    ];
  },
};

module.exports = nextConfig;
