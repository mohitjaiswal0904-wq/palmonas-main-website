import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // React Compiler 1.0 — stable automatic memoization
  reactCompiler: true,

  // Cache Components — enables the `use cache` directive and granular cache control
  cacheComponents: true,

  // Standalone output for Docker / ECS deployment.
  output: 'standalone',

  // Gzip for HTML/text when Next serves the response directly (default true).
  // CDN/reverse proxies should also compress edge-to-browser (Brotli on Vercel).
  // SWC minify is always on in Next 16 production builds — no `swcMinify` flag.
  compress: true,

  // Production-only compiler transforms (no effect in `next dev`).
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
    // Strips `data-testid` (and matching props) from production JS.
    reactRemoveProperties: true,
  },

  experimental: {
    // Tree-shake icon / query entry points instead of pulling whole packages.
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
  },

  // Allow ngrok / tunnel hosts to load Next.js dev HMR assets without cross-origin blocks.
  allowedDevOrigins: process.env.NEXT_ALLOWED_DEV_ORIGINS
    ? process.env.NEXT_ALLOWED_DEV_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : undefined,

  // Turbopack is the stable default bundler in Next.js 16 for both dev & build.
  // Override individual Turbopack options here if needed:
  // turbopack: { rules: {} },

  // Images load from remote CDNs directly (no /_next/image origin proxy).
  // Shopify receives width/quality via src/lib/cdn-image-loader.ts.
  images: {
    loader: 'custom',
    loaderFile: './src/lib/cdn-image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'oms-palmonas.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'd2ppgkj0vs05g5.cloudfront.net',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Marketing HTML: allow CDN edge caches after SSR so TTFB stays low on warm hits.
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/pages/about-us', destination: '/about', permanent: true },
      { source: '/page/about-us', destination: '/about', permanent: true },
      { source: '/pages/about', destination: '/about', permanent: true },
      { source: '/page/about', destination: '/about', permanent: true },
      { source: '/page/gifts', destination: '/gifts', permanent: true },
      { source: '/page/offers', destination: '/offers', permanent: true },
      { source: '/pages/faq', destination: '/pages/faqs', permanent: true },
      { source: '/pages/lifetime-warranty-policy', destination: '/pages/warranty-page', permanent: true },
      { source: '/pages/lifetime-buyback-policy', destination: '/pages/lifetime-buy-back-policy', permanent: true },
      // Legacy / misspelled bestseller handles → canonical collection
      { source: '/collections/bestsellers', destination: '/collections/best-sellers', permanent: true },
      { source: '/collections/best-seller', destination: '/collections/best-sellers', permanent: true },
    ];
  },
};

/** `@next/bundle-analyzer` only runs with Webpack (`pnpm analyze:webpack`). */
export default withBundleAnalyzer(nextConfig);
