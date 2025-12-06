import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow external dev access for the hackathon demo
  allowedDevOrigins: ["http://122.32.75.199:3000"],

  // Enable static export for S3 deployment
  output: 'export',

  // Optional: Add trailing slashes for better S3 routing
  trailingSlash: true,

  // Optional: Configure image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
