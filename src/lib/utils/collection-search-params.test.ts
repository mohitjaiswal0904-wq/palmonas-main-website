import {
  buildCollectionPagePath,
  filtersMatchQuery,
  parseCollectionSearchParams,
  serializeCollectionSearchParams,
} from '@/lib/utils/collection-search-params';

describe('collection search params', () => {
  it('round-trips sort and filter option ids', () => {
    const filters = {
      'filter.v.option.color': ['gold', 'silver'],
      'filter.p.product_type': ['rings'],
    };
    const sort = 'price-asc' as const;
    const query = serializeCollectionSearchParams(filters, sort);
    const parsed = parseCollectionSearchParams(Object.fromEntries(new URLSearchParams(query)));

    expect(parsed.sort).toBe('price-asc');
    expect(parsed.filters).toEqual(filters);
  });

  it('builds collection paths without query for default sort', () => {
    expect(buildCollectionPagePath('stud-earrings', {}, 'featured')).toBe(
      '/collections/stud-earrings',
    );
  });

  it('round-trips page param for scroll pagination', () => {
    const query = serializeCollectionSearchParams({}, 'featured', 3);
    const parsed = parseCollectionSearchParams(Object.fromEntries(new URLSearchParams(query)));

    expect(parsed.page).toBe(3);
    expect(buildCollectionPagePath('stud-earrings', {}, 'featured', 3)).toBe(
      '/collections/stud-earrings?page=3',
    );
  });

  it('matches equivalent filter maps', () => {
    expect(
      filtersMatchQuery(
        { 'filter.v.option.color': ['gold', 'silver'] },
        { 'filter.v.option.color': ['silver', 'gold'] },
      ),
    ).toBe(true);
  });

  it('treats empty filter groups as equivalent to missing groups', () => {
    expect(
      filtersMatchQuery(
        { 'filter.v.option.color': ['gold'], 'filter.p.product_type': [] },
        { 'filter.v.option.color': ['gold'] },
      ),
    ).toBe(true);
  });
});
