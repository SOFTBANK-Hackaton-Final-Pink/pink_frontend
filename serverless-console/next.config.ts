import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 데모용 외부 접근 허용
  allowedDevOrigins: ["http://61.42.251.141:3000"],
  // 정적 export 는 API 라우트와 충돌하므로 비활성화
  // output: "export",
  // trailingSlash: true,
  // images: { unoptimized: true },
};

export default nextConfig;
