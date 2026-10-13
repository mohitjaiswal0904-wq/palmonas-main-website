import { env } from '@/lib/env';

export const siteConfig = {
  name: 'Palmonas',
  shortName: 'Palmonas',
  title: 'Palmonas — Luxury Jewelry & Lifestyle',
  description:
    'Discover handcrafted luxury jewelry and lifestyle pieces from Palmonas. Timeless elegance, modern design.',
  url: env.NEXT_PUBLIC_APP_URL,
  locale: 'en_IN',
  ogImage: {
    url: '/images/og-default.jpg',
    width: 1200,
    height: 630,
    alt: 'Palmonas — Luxury Jewelry & Lifestyle',
  },
  twitter: {
    handle: '@palmonas',
    card: 'summary_large_image' as const,
  },
  keywords: [
    'luxury jewelry',
    'palmonas',
    'gold jewelry',
    'handcrafted jewelry',
    'fine jewelry india',
  ],
  creator: 'Palmonas',
  themeColor: '#3F3529',
} as const;
