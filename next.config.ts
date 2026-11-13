import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders({
          production: process.env.NODE_ENV === "production",
          locationSocketUrl: process.env.NEXT_PUBLIC_LOCATION_WS_URL,
        }),
      },
      {
        // Always revalidate the service worker so fixes reach installed clients.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
  // Cache Components (and the partial prefetching built on it) stays off: its staged rendering
  // relies on Node.js timer ordering that Cloudflare's Workers runtime doesn't give, so pages
  // hang there (vercel/next.js#94880). The marketing pages are static anyway.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
