import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    appDir: true, // <-- forces Next.js to read src/app
  },
};

export default nextConfig;
