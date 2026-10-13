import type { Metadata } from 'next';

import { HomeCmsPage } from '@/components/cms/HomeCmsPage';
import { siteConfig } from '@/config/site.config';
import { buildMetadata } from '@/lib/seo/build-metadata';
import {
  buildHomePageCategoryHref,
  getHomePageCategorySearchParam,
  resolveHomePageCategory,
} from '@/lib/utils/home-page-category';

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Shared app-shell prefetch — CMS body streams after swipe-back / category switches. */
export const prefetch = 'partial';

/**
 * Uses static site metadata instead of awaiting the CMS shell.
 * CMS meta fetch was on the document critical path and inflated TTFB (~2s+).
 */
export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const params = await searchParams;
  const activeCategory = resolveHomePageCategory(getHomePageCategorySearchParam(params));

  return buildMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    path: buildHomePageCategoryHref(activeCategory),
  });
}

export default function HomePage({ searchParams }: HomePageProps) {
  return <HomeCmsPage searchParams={searchParams} />;
}
