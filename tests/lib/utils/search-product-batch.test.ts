import { fetchSearchProductsBatch } from '@/lib/utils/search-product-batch';
import type { ProductListResponse } from '@/types/product';
import type { ProductFilters, ProductSortOption } from '@/types/product-listing';

function createPage(overrides: Partial<ProductListResponse> = {}): ProductListResponse {
  return {
    items: [],
    total: 40,
    page: 1,
    totalPages: 2,
    hasNext: true,
    ...overrides,
  };
}

const batchParams = {
  query: '9kt',
  sort: 'featured' as ProductSortOption,
  filters: {} as ProductFilters,
  filterGroups: [],
  productsPageSize: 20,
  startCursor: 'cursor-a',
  startPageNumber: 2,
};

describe('fetchSearchProductsBatch', () => {
  it('fetches the next page when the cursor advances', async () => {
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce(createPage({ nextCursor: 'cursor-b', page: 2 }))
      .mockResolvedValueOnce(createPage({ nextCursor: 'cursor-c', page: 3 }));

    const pages = await fetchSearchProductsBatch(fetchPage, batchParams, 2);

    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(fetchPage.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ cursor: 'cursor-a' }));
    expect(fetchPage.mock.calls[1]?.[0]).toEqual(expect.objectContaining({ cursor: 'cursor-b' }));
    expect(pages).toHaveLength(2);
  });

  it('stops when the API echoes the same cursor', async () => {
    const fetchPage = jest
      .fn()
      .mockResolvedValue(createPage({ nextCursor: 'cursor-a', hasNext: true }));

    const pages = await fetchSearchProductsBatch(fetchPage, batchParams, 2);

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(pages).toHaveLength(1);
  });

  it('stops when hasNext is false even if a cursor is present', async () => {
    const fetchPage = jest.fn().mockResolvedValue(
      createPage({ nextCursor: 'cursor-b', hasNext: false }),
    );

    const pages = await fetchSearchProductsBatch(fetchPage, batchParams, 2);

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(pages).toHaveLength(1);
  });

  it('stops when the next cursor is missing', async () => {
    const fetchPage = jest.fn().mockResolvedValue(createPage({ hasNext: true }));

    const pages = await fetchSearchProductsBatch(fetchPage, batchParams, 2);

    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});
