import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';
// import { withBotId } from "botid/next/config"; // Temporarily disabled
import { withAxiom } from 'next-axiom';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  skipTrailingSlashRedirect: true,
  serverExternalPackages: ['redis'],
  // Transpile local workspace packages
  transpilePackages: ['@dcyfr/ai', '@dcyfr/agents'],
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
    ],
    // Performance optimization: Use multiple CPU cores for faster builds
    // Reserves 1 core for system, uses remaining cores for parallel processing
    cpus: Math.max(1, require('os').cpus().length - 1),
    // Development optimizations
    optimizeCss: process.env.NODE_ENV === 'development',
  },
  // Development server optimizations
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // Extend keep alive for faster reloads
      maxInactiveAge: 60 * 1000,
      pagesBufferLength: 5,
    },
    // Enable development features
    reactStrictMode: true,
  }),
  // Performance optimizations for Next.js 16
  poweredByHeader: false,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90, 95],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.credly.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Security note: /activity/embed is a PUBLIC read-only widget designed for third-party embedding.
        // ALLOWALL and wildcard CORS are intentional — this endpoint displays only public activity data
        // (commits, blog posts, certifications) with no user PII or authenticated content.
        // The embed generates static HTML that external sites can iframe; it requires no credentials.
        // Risk: low — read-only public data, no sensitive information, no state-changing operations.
        // If the embedded content ever includes user data, restrict to a known domain allowlist instead.
        source: '/activity/embed',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ];
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
      // Feed redirects - unified feed now points to activity feed
      {
        source: '/feed',
        destination: '/activity/feed',
        permanent: true,
      },
      // Personal resume redirect - old /drew/resume to new location
      {
        source: '/drew/resume',
        destination: '/about/drew/resume',
        permanent: true,
      },
      // Resume to Services redirect
      {
        source: '/resume',
        destination: '/services',
        permanent: true,
      },
      // Legacy RSS/Atom redirects already handled in app/rss.xml/route.ts and app/atom.xml/route.ts
    ];
  },
  webpack: (config, { isServer }) => {
    // Suppress harmless deprecation warnings from botid's transitive dependencies
    // These are internal to the package and don't affect functionality
    if (!isServer && process.env.NODE_ENV === 'development') {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          module: /node_modules\/botid/,
          message: /deprecated.*usestand/i,
        },
      ];
    }

    // Performance optimization: Exclude dev-only components from production bundles
    // This prevents dev dashboards, analytics tools, and debug UIs from being bundled
    // in preview/production builds, reducing bundle size and build time
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';
    if (!isDevelopment) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Tree-shake dev-only client components in production
        '@/components/dev': false,
      };
    }

    return config;
  },
};

export default withSentryConfig(withBundleAnalyzer(withAxiom(nextConfig)), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'dcyfr-labs',

  project: 'dcyfr-labs',

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
  tunnelRoute: '/monitoring',

  // Webpack configuration for Sentry optimizations
  webpack: {
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
      removeDebugLogging: true,
    },
    // Enables automatic instrumentation of Vercel Cron Monitors
    // See: https://docs.sentry.io/product/crons/
    automaticVercelMonitors: true,
  },

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
