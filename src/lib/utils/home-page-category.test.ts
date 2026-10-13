import {
  buildHomePageCategoryHref,
  getHomePageCmsSlug,
  resolveHomePageCategory,
} from '@/lib/utils/home-page-category';

describe('resolveHomePageCategory', () => {
  it('defaults to silver when category is missing or invalid', () => {
    expect(resolveHomePageCategory(undefined)).toBe('silver');
    expect(resolveHomePageCategory('unknown')).toBe('silver');
  });

  it('resolves known categories case-insensitively', () => {
    expect(resolveHomePageCategory('gold')).toBe('gold');
    expect(resolveHomePageCategory('demifine')).toBe('demifine');
    expect(resolveHomePageCategory('SILVER')).toBe('silver');
  });
});

describe('getHomePageCmsSlug', () => {
  it('maps categories to CMS page slugs', () => {
    expect(getHomePageCmsSlug('silver')).toBe('home-page-web');
    expect(getHomePageCmsSlug('demifine')).toBe('demifine-web');
    expect(getHomePageCmsSlug('gold')).toBe('gold-home-page-web');
  });
});

describe('buildHomePageCategoryHref', () => {
  it('uses / for the default category and query params for others', () => {
    expect(buildHomePageCategoryHref('silver')).toBe('/');
    expect(buildHomePageCategoryHref('demifine')).toBe('/?category=demifine');
    expect(buildHomePageCategoryHref('gold')).toBe('/?category=gold');
  });
});
