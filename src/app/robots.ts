import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site.config';
import { noIndexRoutes } from '@/lib/seo/routes';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [...noIndexRoutes],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
