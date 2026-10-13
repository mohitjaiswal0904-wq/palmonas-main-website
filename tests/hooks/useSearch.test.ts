import { act, renderHook, waitFor } from '@testing-library/react';

import { useSearch } from '@/hooks/useSearch';
import { searchProductsList } from '@/services/search.service';
import type { Product, ProductListResponse } from '@/types/product';
import type { SearchResultsData } from '@/types/search';

jest.mock('@/services/search.service', () => ({
  searchProductsList: jest.fn(),
}));

const mockSearchProductsList = searchProductsList as jest.MockedFunction<typeof searchProductsList>;

/** Minimal product fixture for useSearch tests. */
function makeProduct(id: string): Product {
  return {
    id,
    handle: id,
    name: `Product ${id}`,
    description: '',
    price: 999,
    image: '',
    images: [],
    category: 'rings',
    productCategory: 'gold',
    offers: [],
    variants: [],
  };
}

const productPage: ProductListResponse = {
  items: [makeProduct('1')],
  total: 1,
  page: 1,
  totalPages: 1,
  filterGroups: [],
  offers: [],
};

function buildSearchResults(overrides: Partial<SearchResultsData> = {}): SearchResultsData {
  return {
    query: 'rin',
    productsPages: [productPage],
    productsPageSize: 20,
    loadedPageCount: 1,
    loadedBatchIndex: 1,
    hasMoreProducts: false,
    filters: {},
    sort: 'featured',
    filterGroups: [],
    totalResults: 1,
    ...overrides,
  };
}

describe('useSearch', () => {
  it('falls back to pageQuery when SSR search results are not available yet', () => {
    const { result } = renderHook(() => useSearch({ pageQuery: 'rin' }));

    expect(result.current.query).toBe('rin');
    expect(result.current.products).toEqual([]);
  });

  it('syncs products when streamed SSR search results arrive', async () => {
    const { result, rerender } = renderHook(
      ({ searchResults, pageQuery }: { searchResults?: SearchResultsData | null; pageQuery: string }) =>
        useSearch({ searchResults, pageQuery }),
      {
        initialProps: { searchResults: null as SearchResultsData | null, pageQuery: 'rin' },
      },
    );

    expect(result.current.products).toEqual([]);

    rerender({ searchResults: buildSearchResults(), pageQuery: 'rin' });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.query).toBe('rin');
    expect(result.current.totalResults).toBe(1);
  });

  it('clears products when search results are removed', () => {
    type HookProps = { searchResults: SearchResultsData | null };
    const initialProps: HookProps = { searchResults: buildSearchResults() };

    const { result, rerender } = renderHook(
      ({ searchResults }: HookProps) => useSearch({ searchResults, pageQuery: 'rin' }),
      { initialProps },
    );

    expect(result.current.products).toHaveLength(1);

    rerender({ searchResults: null });

    expect(result.current.products).toEqual([]);
  });

  it('stops loading more when the search API repeats the same cursor', async () => {
    mockSearchProductsList.mockReset();
    mockSearchProductsList.mockResolvedValue({
      items: [makeProduct('2')],
      total: 40,
      page: 2,
      totalPages: 2,
      hasNext: true,
      nextCursor: 'cursor-a',
      filterGroups: [],
      offers: [],
    });

    const { result } = renderHook(() =>
      useSearch({
        pageQuery: '9kt',
        searchResults: buildSearchResults({
          query: '9kt',
          hasMoreProducts: true,
          nextCursor: 'cursor-a',
          productsPages: [
            {
              ...productPage,
              items: [makeProduct('1')],
              total: 40,
              totalPages: 2,
              hasNext: true,
              nextCursor: 'cursor-a',
            },
          ],
          totalResults: 40,
        }),
      }),
    );

    await act(async () => {
      await result.current.loadMoreProducts();
    });

    await waitFor(() => {
      expect(result.current.hasMoreProducts).toBe(false);
    });
    expect(mockSearchProductsList).toHaveBeenCalledTimes(1);
  });

  it('keeps fetching while the cursor advances then stops at the last page', async () => {
    mockSearchProductsList.mockReset();
    mockSearchProductsList.mockResolvedValueOnce({
      items: [makeProduct('2')],
      total: 40,
      page: 2,
      totalPages: 3,
      hasNext: true,
      nextCursor: 'cursor-b',
      filterGroups: [],
      offers: [],
    });
    mockSearchProductsList.mockResolvedValueOnce({
      items: [makeProduct('3')],
      total: 40,
      page: 3,
      totalPages: 3,
      hasNext: false,
      nextCursor: 'cursor-c',
      filterGroups: [],
      offers: [],
    });

    const { result } = renderHook(() =>
      useSearch({
        pageQuery: '9kt',
        searchResults: buildSearchResults({
          query: '9kt',
          hasMoreProducts: true,
          nextCursor: 'cursor-a',
          productsPages: [
            {
              ...productPage,
              items: [makeProduct('1')],
              total: 40,
              totalPages: 3,
              hasNext: true,
              nextCursor: 'cursor-a',
            },
          ],
          totalResults: 40,
        }),
      }),
    );

    await act(async () => {
      await result.current.loadMoreProducts();
    });

    await waitFor(() => {
      expect(result.current.hasMoreProducts).toBe(false);
    });
    expect(mockSearchProductsList).toHaveBeenCalledTimes(2);
    expect(result.current.products.map((product) => product.id)).toEqual(['1', '2', '3']);
  });
});
