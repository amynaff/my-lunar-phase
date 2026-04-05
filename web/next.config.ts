import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

// Wrap with PWA
let pwaConfig: NextConfig = nextConfig;
try {
  const withPWA = require("@ducanh2912/next-pwa").default;
  pwaConfig = withPWA({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
      disableDevLogs: true,
    },
    fallbacks: {
      document: "/offline",
    },
  })(nextConfig);
} catch {
  // @ducanh2912/next-pwa not installed — skip
}

// Wrap with Sentry only when the package is installed
let exportedConfig: NextConfig = pwaConfig;

try {
  const { withSentryConfig } = require("@sentry/nextjs");
  exportedConfig = withSentryConfig(pwaConfig, {
    silent: !process.env.SENTRY_AUTH_TOKEN,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    disableLogger: true,
  });
} catch {
  // @sentry/nextjs not installed — skip wrapping
}

export default exportedConfig;
