import {
  bottomNavCartItem,
  bottomNavRouteConfigs,
} from '@/config/layout/bottom-nav.config';
import {
  isBottomNavItemActive,
  isMobileBottomNavVisible,
  matchesBottomNavRoute,
  matchesBottomNavRouteConfig,
  resolveBottomNavItemsForPath,
  resolveBottomNavRouteConfig,
  resolveMobileBottomNavItems,
} from '@/lib/layout/bottom-nav';

function findRouteItem(configId: string, itemId: string) {
  const config = bottomNavRouteConfigs.find((entry) => entry.id === configId);
  const item = config?.items.find((entry) => entry.id === itemId);
  if (!item) {
    throw new Error(`Missing bottom nav item: ${configId}/${itemId}`);
  }
  return item;
}

describe('matchesBottomNavRoute', () => {
  it('matches home exactly and collection/cart prefixes', () => {
    expect(matchesBottomNavRoute('/', '/')).toBe(true);
    expect(matchesBottomNavRoute('/collections', '/')).toBe(false);
    expect(matchesBottomNavRoute('/collections/best-sellers', '/collections')).toBe(true);
    expect(matchesBottomNavRoute('/cart/offers', '/cart')).toBe(true);
  });
});

describe('matchesBottomNavRouteConfig', () => {
  it('does not treat query strings in routes as pathname matches', () => {
    const demifineConfig = bottomNavRouteConfigs.find((entry) => entry.id === 'demifine');

    expect(demifineConfig).toBeDefined();
    expect(
      matchesBottomNavRouteConfig('/', 'demifine', demifineConfig!),
    ).toBe(true);
    expect(
      matchesBottomNavRouteConfig('/', undefined, demifineConfig!),
    ).toBe(false);
  });
});

describe('resolveBottomNavRouteConfig', () => {
  it('selects the home config on / and hides on product pages', () => {
    expect(resolveBottomNavRouteConfig('/')?.id).toBe('home');
    expect(resolveBottomNavRouteConfig('/products/ring')).toBeNull();
  });

  it('selects the gifting config on /gifting', () => {
    expect(resolveBottomNavRouteConfig('/gifting')?.id).toBe('gifting');
  });

  it('selects the demifine config when category=demifine on /', () => {
    expect(resolveBottomNavRouteConfig('/', 'demifine')?.id).toBe('demifine');
    expect(resolveBottomNavRouteConfig('/', undefined)?.id).toBe('home');
  });
});

describe('resolveMobileBottomNavItems', () => {
  it('appends cart as the last item for every visible route', () => {
    const homeItems = resolveMobileBottomNavItems('/');

    expect(homeItems.at(-1)).toEqual(bottomNavCartItem);
    expect(homeItems).toHaveLength(5);
  });

  it('returns home route items before cart', () => {
    expect(resolveBottomNavItemsForPath('/')?.[0]?.id).toBe('home');
    expect(resolveBottomNavItemsForPath('/')?.[1]?.id).toBe('gold');
    expect(resolveBottomNavItemsForPath('/')?.[2]?.id).toBe('demifine');
    expect(resolveBottomNavItemsForPath('/')?.[3]?.id).toBe('gifts');
  });

  it('returns demifine route items when category=demifine', () => {
    const items = resolveBottomNavItemsForPath('/', 'demifine');

    expect(items.map((item) => item.id)).toEqual(['home', 'demifine', 'bestsellers', 'offers']);
  });

  it('resolves offers href to /offers for demifine route', () => {
    const offers = findRouteItem('demifine', 'offers');

    expect(offers.href).toBe('/offers');
  });
});

describe('isMobileBottomNavVisible', () => {
  it('shows the bar on home only', () => {
    expect(isMobileBottomNavVisible('/')).toBe(true);
    expect(isMobileBottomNavVisible('/', 'demifine')).toBe(true);
    expect(isMobileBottomNavVisible('/products/ring')).toBe(false);
  });
});

describe('isBottomNavItemActive', () => {
  it('marks silver home active on the default route', () => {
    const home = findRouteItem('home', 'home');
    const demifine = findRouteItem('home', 'demifine');

    expect(isBottomNavItemActive(home, '/', undefined)).toBe(true);
    expect(isBottomNavItemActive(demifine, '/', undefined)).toBe(false);
  });

  it('marks demifine active when category=demifine', () => {
    const home = findRouteItem('home', 'home');
    const demifine = findRouteItem('home', 'demifine');

    expect(isBottomNavItemActive(demifine, '/', 'demifine')).toBe(true);
    expect(isBottomNavItemActive(home, '/', 'demifine')).toBe(false);
  });

  it('marks gold active when category=gold', () => {
    const gold = findRouteItem('home', 'gold');

    expect(isBottomNavItemActive(gold, '/', 'gold')).toBe(true);
  });

  it('marks gifts active on the gifting page', () => {
    const gifts = findRouteItem('gifting', 'gifts');

    expect(isBottomNavItemActive(gifts, '/gifting', undefined)).toBe(true);
    expect(isBottomNavItemActive(gifts, '/', undefined)).toBe(false);
    expect(isBottomNavItemActive(bottomNavCartItem, '/cart', undefined)).toBe(true);
  });

  it('resolves every Home tab to the default silver href (PW-720)', () => {
    for (const configId of ['home', 'gifting', 'gold', 'offers', 'demifine'] as const) {
      const home = findRouteItem(configId, 'home');

      expect(home.homeCategory).toBe('silver');
      expect(home.href).toBe('/');
    }
  });

  it('does not mark Home active on /gifting', () => {
    const home = findRouteItem('gifting', 'home');

    expect(isBottomNavItemActive(home, '/gifting', undefined)).toBe(false);
    expect(isBottomNavItemActive(home, '/', undefined)).toBe(true);
  });
});
