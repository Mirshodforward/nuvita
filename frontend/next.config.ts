import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost", "127.0.0.1", "nuvita.uz", "www.nuvita.uz"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nuvita.uz",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.nuvita.uz",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
