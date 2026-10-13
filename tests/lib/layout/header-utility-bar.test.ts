import { headerUtilityBarDefaults } from '@/config/layout/header-utility-bar.config';
import {
  mergeHeaderUtilityBarVisibility,
  resolveHeaderBackNavTitle,
  resolveHeaderUtilityBarRouteConfig,
  resolveHeaderUtilityBarVisibility,
  shouldShowHeaderDropShadow,
} from '@/lib/layout/header-utility-bar';

describe('resolveHeaderUtilityBarRouteConfig', () => {
  it('returns null when no route override matches', () => {
    expect(resolveHeaderUtilityBarRouteConfig('/')).toBeNull();
    expect(resolveHeaderUtilityBarRouteConfig('/pages/about')).toBeNull();
  });

  it('returns the pdp config on product detail routes', () => {
    expect(resolveHeaderUtilityBarRouteConfig('/products/ring')?.id).toBe('pdp');
  });

  it('returns the search config on search routes', () => {
    expect(resolveHeaderUtilityBarRouteConfig('/search')?.id).toBe('search');
    expect(resolveHeaderUtilityBarRouteConfig('/search')?.showHeaderElevation).toBe(false);
  });

  it('returns the collection config on collection routes', () => {
    expect(resolveHeaderUtilityBarRouteConfig('/collections/best-sellers')?.id).toBe('collection');
    expect(
      resolveHeaderUtilityBarRouteConfig('/collections/best-sellers')?.showHeaderElevation,
    ).not.toBe(false);
  });
});

describe('mergeHeaderUtilityBarVisibility', () => {
  it('returns defaults when route config is null', () => {
    expect(mergeHeaderUtilityBarVisibility('mobile', null)).toEqual(
      headerUtilityBarDefaults.mobile,
    );
    expect(mergeHeaderUtilityBarVisibility('laptop', null)).toEqual(
      headerUtilityBarDefaults.laptop,
    );
  });

  it('merges partial route overrides per breakpoint', () => {
    expect(
      mergeHeaderUtilityBarVisibility('mobile', {
        id: 'cart',
        routes: ['/cart'],
        mobile: { showCart: true, showPincode: false },
      }),
    ).toEqual({
      ...headerUtilityBarDefaults.mobile,
      showCart: true,
      showPincode: false,
    });

    expect(
      mergeHeaderUtilityBarVisibility('laptop', {
        id: 'cart',
        routes: ['/cart'],
        laptop: { showStoreLocator: false, showPincode: false },
      }),
    ).toEqual({
      ...headerUtilityBarDefaults.laptop,
      showStoreLocator: false,
      showPincode: false,
    });
  });
});

describe('resolveHeaderUtilityBarVisibility', () => {
  it('returns configured defaults when no route override matches', () => {
    expect(resolveHeaderUtilityBarVisibility('/')).toEqual(headerUtilityBarDefaults);
  });

  it('enables the search icon on collection routes for mobile', () => {
    expect(resolveHeaderUtilityBarVisibility('/collections/rings').mobile.showSearchIcon).toBe(true);
    expect(resolveHeaderUtilityBarVisibility('/collections/rings').mobile.showSearch).toBe(false);
  });

  it('hides inline mobile search on wishlist routes', () => {
    const visibility = resolveHeaderUtilityBarVisibility('/wishlist').mobile;

    expect(visibility.showBackNav).toBe(true);
    expect(visibility.showSearchIcon).toBe(true);
    expect(visibility.showCart).toBe(true);
    expect(visibility.showWishlist).toBe(false);
    expect(visibility.showAccount).toBe(false);
    expect(visibility.showStoreLocator).toBe(false);
    expect(visibility.showSearch).toBe(false);
    expect(visibility.showPincode).toBe(false);
  });

  it('enables mobile PDP back nav and utility icons without changing laptop defaults', () => {
    const visibility = resolveHeaderUtilityBarVisibility('/products/gold-ring');

    expect(visibility.mobile).toEqual({
      ...headerUtilityBarDefaults.mobile,
      showPincode: false,
      showWishlist: true,
      showAccount: false,
      showStoreLocator: false,
      showCart: true,
      showSearchIcon: true,
      showSearch: false,
      showBackNav: true,
    });
    expect(visibility.laptop).toEqual(headerUtilityBarDefaults.laptop);
    expect(visibility.laptop.showBackNav).toBe(false);
  });

  it('enables mobile search-field chrome on search routes without changing laptop defaults', () => {
    const visibility = resolveHeaderUtilityBarVisibility('/search');

    expect(visibility.mobile).toEqual({
      ...headerUtilityBarDefaults.mobile,
      showPincode: false,
      showWishlist: true,
      showAccount: false,
      showStoreLocator: false,
      showCart: true,
      showSearchIcon: false,
      showSearch: false,
      showBackNav: true,
      showMobileSearchField: true,
    });
    expect(visibility.laptop).toEqual(headerUtilityBarDefaults.laptop);
  });
});

describe('shouldShowHeaderDropShadow', () => {
  it('keeps header elevation on home', () => {
    expect(shouldShowHeaderDropShadow('/')).toBe(true);
  });

  it('keeps header elevation on gold, silver, and demifine collection headers', () => {
    expect(shouldShowHeaderDropShadow('/collections/gold')).toBe(true);
    expect(shouldShowHeaderDropShadow('/collections/silver')).toBe(true);
    expect(shouldShowHeaderDropShadow('/collections/demifine')).toBe(true);
  });

  it('hides header elevation on search', () => {
    expect(shouldShowHeaderDropShadow('/search')).toBe(false);
  });

  it('hides header elevation on wishlist', () => {
    expect(shouldShowHeaderDropShadow('/wishlist')).toBe(false);
  });
});

describe('resolveHeaderBackNavTitle', () => {
  it('returns the configured wishlist title', () => {
    expect(resolveHeaderBackNavTitle('/wishlist')).toBe('Wishlist');
  });

  it('returns undefined on home', () => {
    expect(resolveHeaderBackNavTitle('/')).toBeUndefined();
  });

  it('returns undefined on search', () => {
    expect(resolveHeaderBackNavTitle('/search')).toBeUndefined();
  });

  it('returns undefined on collection routes', () => {
    expect(resolveHeaderBackNavTitle('/collections/gold')).toBeUndefined();
  });
});
