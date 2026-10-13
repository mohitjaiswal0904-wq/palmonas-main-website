import { cmsPageRouteMap, resolveCmsPagePath, resolveCmsPageSlug } from '@/config/cms-pages.config';

describe('cmsPageRouteMap', () => {
  it('maps route names to CMS slugs', () => {
    expect(cmsPageRouteMap.home).toBe('home-page-web');
    expect(cmsPageRouteMap.about).toBe('about-web');
    expect(cmsPageRouteMap.gifts).toBe('gifts-web');
    expect(cmsPageRouteMap.offers).toBe('offers-web');
    expect(cmsPageRouteMap.rakhi).toBe('rakhi-web');
  });

  it('resolves known page names', () => {
    expect(resolveCmsPageSlug('about')).toBe('about-web');
    expect(resolveCmsPageSlug('gifts')).toBe('gifts-web');
    expect(resolveCmsPageSlug('offers')).toBe('offers-web');
    expect(resolveCmsPageSlug('rakhi')).toBe('rakhi-web');
    expect(resolveCmsPageSlug('unknown')).toBeNull();
  });

  it('resolves web paths', () => {
    expect(resolveCmsPagePath('home')).toBe('/');
    expect(resolveCmsPagePath('about')).toBe('/page/about');
    expect(resolveCmsPagePath('gifts')).toBe('/gifts');
    expect(resolveCmsPagePath('offers')).toBe('/offers');
    expect(resolveCmsPagePath('rakhi')).toBe('/rakhi');
  });
});
