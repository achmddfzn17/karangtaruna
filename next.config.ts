import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Turbopack doesn't need watchOptions — it handles file watching natively
  },
  serverExternalPackages: ["pg"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  images: {
    // Do not enable dangerouslyAllowLocalIP for the public image optimizer.
    // Public Supabase image URLs are covered by the explicit remotePatterns rule.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "csacgdbuckmrhudtoejz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
