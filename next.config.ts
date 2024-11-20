import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.AWS_CLOUDFRONT_ID}.cloudfront.net`,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
