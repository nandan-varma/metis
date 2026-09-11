import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.openfoodfacts.org" },
      { protocol: "https", hostname: "**.openfoodfacts.net" },
    ],
  },
};

export default nextConfig;
