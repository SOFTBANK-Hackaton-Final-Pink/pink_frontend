import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external dev access for the hackathon demo
  allowedDevOrigins: ["http://61.42.251.141:3000"],
  // output: "export", // disabled: conflicts with API routes
  // trailingSlash: true,
  // images: { unoptimized: true },
};

export default nextConfig;
