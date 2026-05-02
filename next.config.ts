import type { NextConfig } from "next";

const cdnUrl = process.env.CDN_URL
  ? new URL(process.env.CDN_URL)
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: cdnUrl
      ? [
          {
            protocol:
              cdnUrl.protocol === "https:" ? "https" : "http",
            hostname: cdnUrl.hostname,
            pathname: "/**",
          },
        ]
      : [],
  },
};

export default nextConfig;