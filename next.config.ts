import type { NextConfig } from "next";
import path from "node:path";

// Có package-lock.json lạ ở C:\Users\hoang khiến Turbopack dò nhầm root
// (output lẫn lộn, action ID không khớp -> "Server Action not found").
// Đặt root rõ ràng để build/compile luôn nhất quán.
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Cho phép dev resources từ 127.0.0.1 (browser dùng http://127.0.0.1:3000 khi test E2E).
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
