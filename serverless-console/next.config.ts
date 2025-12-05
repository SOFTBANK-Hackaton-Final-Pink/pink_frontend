import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow external dev access for the hackathon demo
  allowedDevOrigins: ["http://122.32.75.199:3000"],
};

export default nextConfig;
