import { buildEmilyInParisPagePath } from '@/lib/utils/emily-in-paris-search-params';
import type { ProductFilters } from '@/types/product-listing';

describe('buildEmilyInParisPagePath', () => {
  it('returns the base path when filters and sort are empty', () => {
    expect(buildEmilyInParisPagePath({}, 'featured', 1)).toBe('/emily-in-paris');
  });

  it('serializes filters, sort, and page into query params', () => {
    const filters: ProductFilters = { category: ['rings'] };

    expect(buildEmilyInParisPagePath(filters, 'price-asc', 2)).toBe(
      '/emily-in-paris?sort=price-asc&page=2&category=rings',
    );
  });
});
