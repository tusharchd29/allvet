import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB; photo-evidence uploads (Visits, Expenses, Travel
      // Log) go through Server Actions and can be up to 10MB, so raise the
      // ceiling to fit that plus multipart overhead and other form fields.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
