import { hrefsMatch, normalizeHref, buildLocationHref } from '@/lib/navigation/normalize-href';

describe('normalizeHref', () => {
  it('normalizes an internal path with search', () => {
    expect(normalizeHref('/products/ring?color=gold')).toEqual({
      pathname: '/products/ring',
      search: '?color=gold',
    });
  });

  it('normalizes a bare pathname', () => {
    expect(normalizeHref('/cart')).toEqual({ pathname: '/cart', search: '' });
  });

  it('returns null for mailto links', () => {
    expect(normalizeHref('mailto:help@example.com')).toBeNull();
  });

  it('returns null for unparseable hrefs', () => {
    expect(normalizeHref('http://[')).toBeNull();
  });
});

describe('hrefsMatch', () => {
  it('matches equal path and search', () => {
    expect(hrefsMatch('/search?q=ring', '/search?q=ring')).toBe(true);
  });

  it('does not match different search', () => {
    expect(hrefsMatch('/search?q=ring', '/search?q=gold')).toBe(false);
  });
});

describe('buildLocationHref', () => {
  it('builds pathname only when search empty', () => {
    expect(buildLocationHref('/wishlist')).toBe('/wishlist');
  });

  it('prefixes search with question mark when missing', () => {
    expect(buildLocationHref('/search', 'q=a')).toBe('/search?q=a');
  });
});
