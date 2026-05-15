import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better dev warnings
  reactStrictMode: true,

  // Block sensitive pages from being indexed by search engines
  async headers() {
    return [
      {
        source: "/(dashboard|notes|api)/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

