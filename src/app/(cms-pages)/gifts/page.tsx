import { CmsDynamicPage } from '@/components/cms/CmsDynamicPage';
import { cmsPageRouteMap, resolveCmsPagePath } from '@/config/cms-pages.config';
import { buildCmsPageMetadata } from '@/lib/seo/build-cms-page-metadata';

const giftsPath = resolveCmsPagePath('gifts');

export async function generateMetadata() {
  return buildCmsPageMetadata(cmsPageRouteMap.gifts, giftsPath);
}

/** CMS-driven gifts landing page (`/gifts`, slug `gifts`). */
export default function GiftsPage() {
  return <CmsDynamicPage slug={cmsPageRouteMap.gifts} />;
}
