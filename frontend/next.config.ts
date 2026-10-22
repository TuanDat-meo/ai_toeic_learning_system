import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/ets_2024_lc/:path*",
        destination: "/api/media/ets_2024_lc/:path*",
      },
      {
        source: "/ets_2023_lc/:path*",
        destination: "/api/media/ets_2023_lc/:path*",
      },
      {
        source: "/ets_2022_lc/:path*",
        destination: "/api/media/ets_2022_lc/:path*",
      },
    ];
  },
};

export default nextConfig;
