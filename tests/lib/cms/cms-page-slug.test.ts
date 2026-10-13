import { CMS_PAGE_SLUG_WEB_SUFFIX, toWebCmsPageSlug } from '@/lib/cms/cms-page-slug';

describe('toWebCmsPageSlug', () => {
  it('appends -web to base slugs', () => {
    expect(toWebCmsPageSlug('home-page')).toBe('home-page-web');
    expect(toWebCmsPageSlug('about')).toBe('about-web');
    expect(toWebCmsPageSlug('search')).toBe('search-web');
  });

  it('does not double-append when slug already ends with -web', () => {
    expect(toWebCmsPageSlug('home-page-web')).toBe('home-page-web');
    expect(toWebCmsPageSlug('gifts-web')).toBe('gifts-web');
  });

  it('returns empty slug unchanged', () => {
    expect(toWebCmsPageSlug('')).toBe('');
  });

  it('exports the suffix constant', () => {
    expect(CMS_PAGE_SLUG_WEB_SUFFIX).toBe('-web');
  });
});
