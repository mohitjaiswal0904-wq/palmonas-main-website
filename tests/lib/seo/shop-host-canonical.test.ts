import {
  buildShopHostCanonicalScript,
  isShopDuplicateHost,
  PRIMARY_CANONICAL_ORIGIN,
  SHOP_HOST_CANONICAL_SCRIPT_ID,
} from '@/lib/seo/shop-host-canonical';

describe('shop-host-canonical', () => {
  it('flags shop.palmonas.com as a duplicate host', () => {
    expect(isShopDuplicateHost('shop.palmonas.com')).toBe(true);
    expect(isShopDuplicateHost('SHOP.PALMONAS.COM')).toBe(true);
  });

  it('flags palmonas.myshopify.com as a duplicate host', () => {
    expect(isShopDuplicateHost('palmonas.myshopify.com')).toBe(true);
  });

  it('does not flag the primary storefront host', () => {
    expect(isShopDuplicateHost('palmonas.com')).toBe(false);
    expect(isShopDuplicateHost('www.palmonas.com')).toBe(false);
    expect(isShopDuplicateHost('')).toBe(false);
  });

  it('builds an early script that noindexes shop hosts and points canonical at primary', () => {
    const script = buildShopHostCanonicalScript();

    expect(SHOP_HOST_CANONICAL_SCRIPT_ID).toBe('shop-host-canonical');
    expect(script).toContain(PRIMARY_CANONICAL_ORIGIN);
    expect(script).toContain('shop.palmonas.com');
    expect(script).toContain('palmonas.myshopify.com');
    expect(script).toContain('noindex, follow');
    expect(script).toContain('rel="canonical"');
  });
});
