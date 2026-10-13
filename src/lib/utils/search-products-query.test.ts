import { toSearchProductsQuery } from '@/lib/utils/search-products-query';

describe('toSearchProductsQuery', () => {
  it('maps the search term to q without an available stock filter', () => {
    expect(toSearchProductsQuery({ query: 'test', limit: 20 })).toEqual({
      q: 'test',
      page_size: 20,
    });
  });

  it('includes cursor pagination when provided', () => {
    expect(toSearchProductsQuery({ query: 'ring', cursor: 'abc123', limit: 20 })).toEqual({
      q: 'ring',
      cursor: 'abc123',
      page_size: 20,
    });
  });

  it('falls back to page pagination when cursor is absent', () => {
    expect(toSearchProductsQuery({ query: 'ring', page: 2, limit: 20 })).toEqual({
      q: 'ring',
      page: 2,
      page_size: 20,
    });
  });

  it('includes sort when provided without filter groups', () => {
    expect(
      toSearchProductsQuery({
        query: 'gold',
        sortBy: 'price-asc',
      }),
    ).toEqual({
      q: 'gold',
      sort: 'price-asc',
    });
  });

  it('maps name, best-selling, and new-arrivals to search sort values', () => {
    expect(toSearchProductsQuery({ query: 'h', sortBy: 'name-desc' }).sort).toBe('name-desc');
    expect(toSearchProductsQuery({ query: 'h', sortBy: 'best-selling' }).sort).toBe('best-selling');
    expect(toSearchProductsQuery({ query: 'h', sortBy: 'new-arrivals' }).sort).toBe('newest');
  });

  it('omits sort for featured so the API uses relevance', () => {
    expect(toSearchProductsQuery({ query: 'h', sortBy: 'featured' })).toEqual({
      q: 'h',
    });
  });

  it('sends a catalog product type when the intent is confident', () => {
    expect(toSearchProductsQuery({ query: 'chain', productType: 'necklaces', limit: 20 })).toEqual({
      q: 'chain',
      page_size: 20,
      product_type: 'necklaces',
    });
  });
});
