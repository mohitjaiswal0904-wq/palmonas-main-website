import { CmsDynamicPage } from '@/components/cms/CmsDynamicPage';
import { cmsPageRouteMap, resolveCmsPagePath } from '@/config/cms-pages.config';
import { buildCmsPageMetadata } from '@/lib/seo/build-cms-page-metadata';

const rakhiPath = resolveCmsPagePath('rakhi');

export async function generateMetadata() {
  return buildCmsPageMetadata(cmsPageRouteMap.rakhi, rakhiPath);
}

/** CMS-driven rakhi landing page (`/rakhi`, slug `rakhi-web`). */
export default function RakhiPage() {
  return <CmsDynamicPage slug={cmsPageRouteMap.rakhi} />;
}
