import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/forum",
        destination: "/",
        permanent: true,
      },
      {
        source: "/forum/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },

  // Standalone output for Docker/Vercel
  output: "standalone",

  // Powered-by header removal
  poweredByHeader: false,
};

export default withSentryConfig(nextConfig, {
  // Upload source maps to Sentry for readable stack traces
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress source map warnings during build
  silent: !process.env.CI,

  // Route browser Sentry requests through Next.js server
  // This prevents ad blockers from blocking error reports
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger in production
  disableLogger: true,

  // Hide source maps from users but upload to Sentry
  hideSourceMaps: true,

  // Widen the scope of the SDK to capture more errors
  widenClientFileUpload: true,
});
