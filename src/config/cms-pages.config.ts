import { pageIds } from '@/config/components.config';

/**
 * Maps web route segment (`/page/{pageName}`) to CMS page slug.
 * Home uses `home` at `/` — not under `/page/home`.
 */
export const cmsPageRouteMap = {
  home: pageIds.home,
  about: 'about-web',
  sale: 'sale-web',
  gifts: 'gifts-web',
  offers: 'offers-web',
  rakhi: 'rakhi-web',
} as const;

/** CMS pages with a dedicated top-level URL instead of `/page/{name}`. */
const cmsPageTopLevelPaths: Partial<Record<CmsPageRouteName, string>> = {
  gifts: '/gifts',
  offers: '/offers',
  rakhi: '/rakhi',
};

export type CmsPageRouteName = keyof typeof cmsPageRouteMap;

export type CmsPageSlug = (typeof cmsPageRouteMap)[CmsPageRouteName];

export function resolveCmsPageSlug(pageName: string): CmsPageSlug | null {
  if (pageName in cmsPageRouteMap) {
    return cmsPageRouteMap[pageName as CmsPageRouteName];
  }

  return null;
}

export function resolveCmsPagePath(pageName: CmsPageRouteName): string {
  if (pageName === 'home') {
    return '/';
  }

  const topLevelPath = cmsPageTopLevelPaths[pageName];
  if (topLevelPath) {
    return topLevelPath;
  }

  return `/page/${pageName}`;
}

export function isCmsPageRouteName(pageName: string): pageName is CmsPageRouteName {
  return pageName in cmsPageRouteMap;
}
