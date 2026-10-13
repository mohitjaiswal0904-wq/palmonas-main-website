import { renderHook, act, waitFor } from '@testing-library/react';

import { useCollection, type CollectionInitialData } from '@/hooks/useCollection';
import { getCollectionProducts } from '@/services/collection.service';
import type { ProductListResponse } from '@/types/product';

jest.mock('@/services/collection.service', () => ({
  getCollectionProducts: jest.fn(),
}));

const mockGetCollectionProducts = getCollectionProducts as jest.MockedFunction<
  typeof getCollectionProducts
>;

function makePage(page: number, itemIds: string[], hasNext = true): ProductListResponse {
  return {
    items: itemIds.map((id) => ({ id, handle: id, name: id })),
    page,
    pageSize: 2,
    total: 10,
    totalPages: 5,
    hasNext,
    filterGroups: [],
  } as unknown as ProductListResponse;
}

function makeInitialData(pages: ProductListResponse[]): CollectionInitialData {
  return {
    collection: {
      id: 'c1',
      handle: 'best-sellers',
      title: 'Best Sellers',
    },
    productsPages: pages,
    productsPageSize: 2,
    loadedPageCount: pages.length,
    hasMoreProducts: true,
    filters: {},
    sort: 'featured',
    filterGroups: [],
  };
}

describe('useCollection', () => {
  beforeEach(() => {
    mockGetCollectionProducts.mockReset();
  });

  it('exposes products from the SSR seed page', () => {
    const initialData = makeInitialData([makePage(1, ['a', 'b'])]);
    const { result } = renderHook(() => useCollection('best-sellers', { initialData }));

    expect(result.current.products.map((product) => product.id)).toEqual(['a', 'b']);
    expect(result.current.loadedPageCount).toBe(1);
  });

  it('appends the next page from the client API on load more', async () => {
    mockGetCollectionProducts.mockResolvedValueOnce(makePage(2, ['c', 'd'], false));
    const initialData = makeInitialData([makePage(1, ['a', 'b'])]);

    const { result } = renderHook(() => useCollection('best-sellers', { initialData }));

    await act(async () => {
      await result.current.loadMoreProducts();
    });

    await waitFor(() => {
      expect(result.current.products.map((product) => product.id)).toEqual(['a', 'b', 'c', 'd']);
    });
    expect(result.current.hasMoreProducts).toBe(false);
    expect(mockGetCollectionProducts).toHaveBeenCalledWith(
      'best-sellers',
      expect.objectContaining({ page: 2 }),
    );
  });

  it('appends the next page even when the API reports page 1 again', async () => {
    mockGetCollectionProducts.mockResolvedValueOnce(makePage(1, ['c', 'd'], false));
    const initialData = makeInitialData([makePage(1, ['a', 'b'])]);

    const { result } = renderHook(() => useCollection('best-sellers', { initialData }));

    await act(async () => {
      await result.current.loadMoreProducts();
    });

    await waitFor(() => {
      expect(result.current.products.map((product) => product.id)).toEqual(['a', 'b', 'c', 'd']);
    });
    expect(result.current.loadedPageCount).toBe(2);
  });

  it('does not fetch while a load-more is already in flight', async () => {
    let resolveFetch: ((value: ProductListResponse) => void) | undefined;
    mockGetCollectionProducts.mockImplementationOnce(
      () =>
        new Promise<ProductListResponse>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const initialData = makeInitialData([makePage(1, ['a'])]);

    const { result } = renderHook(() => useCollection('best-sellers', { initialData }));

    await act(async () => {
      void result.current.loadMoreProducts();
    });

    await act(async () => {
      await result.current.loadMoreProducts();
    });

    expect(mockGetCollectionProducts).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch?.(makePage(2, ['b'], false));
    });
  });

  it('stops offering load more when the client request fails', async () => {
    mockGetCollectionProducts.mockRejectedValueOnce(new Error('network'));
    const initialData = makeInitialData([makePage(1, ['a'])]);

    const { result } = renderHook(() => useCollection('best-sellers', { initialData }));

    await act(async () => {
      await result.current.loadMoreProducts();
    });

    expect(result.current.hasMoreProducts).toBe(false);
  });
});
