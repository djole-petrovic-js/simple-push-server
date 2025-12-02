import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Routes shouldn't be cached at all.
   */
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

export default nextConfig;
