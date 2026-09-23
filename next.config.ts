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
  async headers() {
    return [
      {
        // Baseline hardening headers, applied to every response. No CSP
        // here on purpose — this app loads Leaflet + OpenStreetMap tiles
        // for the map view, and a CSP tight enough to matter but loose
        // enough not to break that needs live testing against the real
        // deployment, not a guess shipped blind.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            // Only geolocation is actually used (LocationCapture, for
            // customer/visit coordinates); camera access goes through a
            // plain file input's `capture` attribute, not getUserMedia.
            key: "Permissions-Policy",
            value: "geolocation=(self), camera=(), microphone=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
