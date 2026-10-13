import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site.config';
import { publicSeoRoutes } from '@/lib/seo/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  return publicSeoRoutes.map((route) => ({
    url: `${siteConfig.url}${route.path === '/' ? '' : route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
