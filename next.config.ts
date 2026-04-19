import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker production image (copies only what's needed to run)
  output: "standalone",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  serverExternalPackages: ["xlsx"],
};

export default nextConfig;
