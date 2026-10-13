import { notFound } from 'next/navigation';

import { CmsDynamicPage } from '@/components/cms/CmsDynamicPage';
import { isCmsPageRouteName, resolveCmsPageSlug } from '@/config/cms-pages.config';
import { buildCmsPageMetadata } from '@/lib/seo/build-cms-page-metadata';
import { buildMetadata } from '@/lib/seo/build-metadata';

interface CmsNamedPageProps {
  params: Promise<{ pageName: string }>;
}

export async function generateMetadata({ params }: CmsNamedPageProps) {
  const { pageName } = await params;

  if (!isCmsPageRouteName(pageName)) {
    return buildMetadata({
      title: 'Page not found',
      path: `/page/${pageName}`,
      noIndex: true,
    });
  }

  const slug = resolveCmsPageSlug(pageName);
  if (!slug) {
    return buildMetadata({
      title: 'Page not found',
      path: `/page/${pageName}`,
      noIndex: true,
    });
  }

  return buildCmsPageMetadata(slug, `/page/${pageName}`);
}

export default async function CmsNamedPage({ params }: CmsNamedPageProps) {
  const { pageName } = await params;

  if (!isCmsPageRouteName(pageName)) {
    notFound();
  }

  const slug = resolveCmsPageSlug(pageName);
  if (!slug) {
    notFound();
  }

  return <CmsDynamicPage slug={slug} />;
}
