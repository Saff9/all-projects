// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  experimental: {
    mdxRs: false, // we use next-mdx-remote instead
  },
};

module.exports = nextConfig;
