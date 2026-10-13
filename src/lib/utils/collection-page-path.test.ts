import {
  normalizeCollectionHandle,
  resolveCollectionPagePath,
} from '@/lib/utils/collection-page-path';

describe('normalizeCollectionHandle', () => {
  it('strips collections prefix and query string', () => {
    expect(normalizeCollectionHandle('/collections/new-arrivals?sort=price-asc')).toBe(
      'new-arrivals',
    );
  });

  it('returns bare handles unchanged', () => {
    expect(normalizeCollectionHandle('best-sellers')).toBe('best-sellers');
  });

  it('aliases misspelled bestseller handles', () => {
    expect(normalizeCollectionHandle('bestsellers')).toBe('best-sellers');
    expect(normalizeCollectionHandle('/collections/best-seller')).toBe('best-sellers');
  });
});

describe('resolveCollectionPagePath', () => {
  it('sends curated handles to their dedicated landing page', () => {
    expect(resolveCollectionPagePath('shraddhas-favourite')).toBe('/shraddhas-favourite');
    expect(resolveCollectionPagePath('/collections/emily-paris-collection')).toBe(
      '/emily-in-paris',
    );
  });

  it('keeps standard collections on the collection route', () => {
    expect(resolveCollectionPagePath('new-arrivals')).toBe('/collections/new-arrivals');
  });

  it('returns home for empty handles', () => {
    expect(resolveCollectionPagePath('')).toBe('/');
    expect(resolveCollectionPagePath('/collections/')).toBe('/');
  });
});
