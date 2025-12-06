import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external dev access for the hackathon demo
  allowedDevOrigins: ["http://61.42.251.141:3000"],
  // Static export for S3
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
