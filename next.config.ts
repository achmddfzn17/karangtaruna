import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Turbopack doesn't need watchOptions — it handles file watching natively
  },
  serverExternalPackages: ["pg"],
};

export default nextConfig;
