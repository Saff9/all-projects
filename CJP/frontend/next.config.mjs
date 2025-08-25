/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker/PM2 production deployment
  output: 'standalone',

  // Compress output
  compress: true,

  // Disable X-Powered-By header
  poweredByHeader: false,

  // Telegram CDN image support (avatars, etc.)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 't.me' },
      { protocol: 'https', hostname: '*.telegram.org' },
      { protocol: 'https', hostname: 'telegra.ph' },
    ],
    // Optimize local images
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },

  // Remove console.log in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // Strict HTTP security headers — NOTE: X-Frame-Options is intentionally OMITTED
  // because Telegram renders Mini Apps inside an iframe. Adding SAMEORIGIN blocks it.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Allow Telegram to iframe the app
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org https://webk.telegram.org https://webz.telegram.org" },
        ],
      },
      // Aggressive caching for static assets
      {
        source: '/(.*)\\.(png|jpg|jpeg|gif|webp|avif|ico|svg|woff|woff2|ttf|eot)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Short cache for pages — always fresh
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },

  // Experimental optimizations
  experimental: {
    // Optimize package imports for better tree shaking
    optimizePackageImports: ['react', 'react-dom'],
  },
};

export default nextConfig;
