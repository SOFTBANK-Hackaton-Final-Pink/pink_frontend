import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external dev access during the hackathon demo
  allowedDevOrigins: ["http://61.42.251.141:3000"],
  // Dynamic deploy on Vercel (no static export / no S3 sync)
  env: {
    NEXT_PUBLIC_API_BASE: "http://52.78.40.174/api",
  },
};

export default nextConfig;
