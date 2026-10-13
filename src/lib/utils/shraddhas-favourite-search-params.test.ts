import { buildShraddhasFavouritePagePath } from '@/lib/utils/shraddhas-favourite-search-params';
import type { ProductFilters } from '@/types/product-listing';

describe('buildShraddhasFavouritePagePath', () => {
  it('returns the base path when filters and sort are default', () => {
    expect(buildShraddhasFavouritePagePath({}, 'featured')).toBe('/shraddhas-favourite');
  });

  it('serialises sort, filters, and page into the shraddhas-favourite path', () => {
    const filters: ProductFilters = { category: ['rings'] };

    expect(buildShraddhasFavouritePagePath(filters, 'price-asc', 2)).toBe(
      '/shraddhas-favourite?sort=price-asc&page=2&category=rings',
    );
  });
});
