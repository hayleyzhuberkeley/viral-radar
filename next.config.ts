import type { NextConfig } from "next";

// Every page shows one user's private data, so nothing is prerendered or
// shared between users. Cache Components stays off on purpose.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
