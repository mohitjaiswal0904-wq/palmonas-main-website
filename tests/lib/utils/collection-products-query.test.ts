import { toCollectionProductQuery } from '@/lib/utils/collection-products-query';

describe('toCollectionProductQuery', () => {
  it('maps page, limit, and sort', () => {
    expect(
      toCollectionProductQuery({
        page: 2,
        limit: 24,
        sortBy: 'price-asc',
      }),
    ).toEqual({
      page: 2,
      page_size: 24,
      sort_by: 'price-ascending',
    });
  });

  it('includes cursor when provided', () => {
    expect(toCollectionProductQuery({ cursor: 'abc', page: 3 })).toEqual({
      page: 3,
      cursor: 'abc',
    });
  });

  it('omits empty optional fields', () => {
    expect(toCollectionProductQuery({})).toEqual({});
  });

  it('does not send filters without filter groups', () => {
    expect(
      toCollectionProductQuery({
        page: 1,
        filters: { category: ['rings'] },
      }),
    ).toEqual({ page: 1 });
  });
});
