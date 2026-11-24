import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  images: {
    qualities: [75],
  },
};

export default nextConfig;
