import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence Turbopack warning during Vercel builds
  turbopack: {},
  // Exclude AI agent folders from file watcher to prevent infinite HMR refresh
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        "**/node_modules/**",
        "**/.agents/**",
        "**/.augment/**",
        "**/.claude/**",
        "**/.kiro/**",
        "**/.trae/**",
        "**/.gemini/**",
        "**/.git/**",
        "**/.next/**",
      ],
    };
    return config;
  },
  serverExternalPackages: ["pg"],
};

export default nextConfig;
