import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages compatibility
  images: {
    unoptimized: true, // Cloudflare doesn't support Next.js Image Optimization API
  },
  // Note: Do NOT use output: 'export' - it would disable API routes
  // @cloudflare/next-on-pages handles the build conversion automatically
};

export default nextConfig;
