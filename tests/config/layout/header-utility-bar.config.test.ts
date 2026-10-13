import {
  headerMobileSearchReveal,
  headerUtilityBarMessages,
  headerUtilityBarRouteConfigs,
} from '@/config/layout/header-utility-bar.config';

describe('headerUtilityBarRouteConfigs', () => {
  it('flattens search header elevation from config', () => {
    expect(headerUtilityBarRouteConfigs.find((route) => route.id === 'search')?.showHeaderElevation).toBe(
      false,
    );
  });

  it('flattens wishlist header elevation from config', () => {
    expect(
      headerUtilityBarRouteConfigs.find((route) => route.id === 'wishlist')?.showHeaderElevation,
    ).toBe(false);
  });

  it('hydrates the wishlist back-nav title from labels', () => {
    expect(headerUtilityBarRouteConfigs.find((route) => route.id === 'wishlist')?.backNavTitle).toBe(
      headerUtilityBarMessages.labels.wishlistTitle,
    );
  });

  it('does not set a back-nav title on search or collection', () => {
    expect(headerUtilityBarRouteConfigs.find((route) => route.id === 'search')?.backNavTitle).toBeUndefined();
    expect(
      headerUtilityBarRouteConfigs.find((route) => route.id === 'collection')?.backNavTitle,
    ).toBeUndefined();
  });

  it('exposes mobile search-reveal thresholds that ignore small scroll jitter', () => {
    expect(headerMobileSearchReveal.tolerance).toBeGreaterThanOrEqual(12);
    expect(headerMobileSearchReveal.hideDistance).toBeGreaterThanOrEqual(headerMobileSearchReveal.tolerance);
    expect(headerMobileSearchReveal.revealDistance).toBeGreaterThanOrEqual(
      headerMobileSearchReveal.tolerance,
    );
    expect(headerMobileSearchReveal.settleMs).toBeGreaterThanOrEqual(300);
  });
});
