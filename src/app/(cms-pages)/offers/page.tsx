import { CmsDynamicPage } from '@/components/cms/CmsDynamicPage';
import { cmsPageRouteMap, resolveCmsPagePath } from '@/config/cms-pages.config';
import { buildCmsPageMetadata } from '@/lib/seo/build-cms-page-metadata';

const offersPath = resolveCmsPagePath('offers');

export async function generateMetadata() {
  return buildCmsPageMetadata(cmsPageRouteMap.offers, offersPath);
}

/** CMS-driven offers landing page (`/offers`, slug `offers`). */
export default function OffersPage() {
  return <CmsDynamicPage slug={cmsPageRouteMap.offers} />;
}
