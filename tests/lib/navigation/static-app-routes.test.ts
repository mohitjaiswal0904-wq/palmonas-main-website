import {
  isStaticAppRoute,
  shouldPrefetchAppRoute,
  shouldSkipNavigationOverlay,
} from '@/lib/navigation/static-app-routes';

describe('static-app-routes', () => {
  it('marks about as static, prefetchable, and overlay-free', () => {
    expect(isStaticAppRoute('/about')).toBe(true);
    expect(shouldPrefetchAppRoute('/about')).toBe(true);
    expect(shouldSkipNavigationOverlay('/about')).toBe(true);
  });

  it('does not treat product routes as static', () => {
    expect(isStaticAppRoute('/products/demo')).toBe(false);
    expect(shouldSkipNavigationOverlay('/products/demo')).toBe(false);
  });

  it('treats legacy about CMS paths as static after canonicalization', () => {
    expect(isStaticAppRoute('/pages/about-us')).toBe(true);
    expect(shouldSkipNavigationOverlay('/pages/about-us')).toBe(true);
    expect(shouldPrefetchAppRoute('/page/about')).toBe(true);
  });
});
