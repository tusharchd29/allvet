import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB. Photo-evidence uploads (Visits, Expenses, Travel
      // Log) go through Server Actions and can be up to 10MB; brochure
      // files can be up to 20MB. Raise the ceiling to fit the larger of
      // those plus multipart overhead and other form fields.
      bodySizeLimit: "22mb",
    },
  },
};

export default nextConfig;
