import {withSentryConfig} from "@sentry/nextjs";
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withBotId } from "botid/next/config";
import { withAxiom } from "next-axiom";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', '@radix-ui/react-dropdown-menu', '@radix-ui/react-dialog', '@radix-ui/react-select'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // Redirect old /projects and /portfolio paths to new /work path
      {
        source: '/projects',
        destination: '/work',
        permanent: true,
      },
      {
        source: '/projects/:path*',
        destination: '/work/:path*',
        permanent: true,
      },
      {
        source: '/portfolio',
        destination: '/work',
        permanent: true,
      },
      {
        source: '/portfolio/:path*',
        destination: '/work/:path*',
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(withBundleAnalyzer(withBotId(withAxiom(nextConfig))), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "dcyfr-labs",

  project: "dcyfr-labs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js proxy, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,

  // Ignore Next.js internal manifest files that don't have source maps
  // These are auto-generated config files, not executable code
  sourcemaps: {
    ignore: [
      '**/*_client-reference-manifest.js',
      '**/middleware-build-manifest.js',
      '**/next-font-manifest.js',
      '**/server-reference-manifest.js',
      '**/interception-route-rewrite-manifest.js',
    ],
  },
});