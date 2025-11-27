import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    // !! WARN !!
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

// Security headers to help protect against common web vulnerabilities
const securityHeaders = [
  // Prevent Cross-Site Scripting (XSS) attacks
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Prevent clickjacking attacks
  {
    key: "X-Frame-Options",
    value: "DENY", // or "SAMEORIGIN" if you need to allow same-origin iframes
  },
  // Prevent MIME-type sniffing attacks
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Force HTTPS in modern browsers
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload", // 2 years
  },
  // Prevent information leakage via referrer header
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Content Security Policy to prevent XSS and data injection attacks
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' blob: data: https:",
      "connect-src 'self' https://*.ingest.sentry.io", // Add your API endpoints here
      "frame-src 'self'", // If you don't use iframes, you can remove this
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'", // Prevents embedding the site in iframes
    ].join("; "),
  },
  // Enable cross-site filter (XSS filter)
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=(), camera=()",
  },
];

export default nextConfig;
