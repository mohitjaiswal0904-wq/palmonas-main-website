import { act, renderHook, waitFor } from '@testing-library/react';

import { useGiftingCategoryProducts } from '@/hooks/useGiftingCategoryProducts';
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
    items: itemIds.map((id) => ({
      id,
      handle: id,
      name: id,
      description: '',
      price: 100,
      image: 'https://cdn.example.com/x.jpg',
      images: ['https://cdn.example.com/x.jpg'],
      category: 'rings',
      productCategory: 'demifine',
      variants: [],
      offers: [],
    })),
    page,
    total: 10,
    totalPages: 5,
    hasNext,
  };
}

describe('useGiftingCategoryProducts', () => {
  beforeEach(() => {
    mockGetCollectionProducts.mockReset();
  });

  it('uses the SSR seed for the initial handle without refetching', () => {
    const initialPage = makePage(1, ['a', 'b']);
    const { result } = renderHook(() =>
      useGiftingCategoryProducts('best-sellers', {
        pageSize: 12,
        initialHandle: 'best-sellers',
        initialPage,
      }),
    );

    expect(result.current.products.map((product) => product.id)).toEqual(['a', 'b']);
    expect(result.current.isLoading).toBe(false);
    expect(mockGetCollectionProducts).not.toHaveBeenCalled();
  });

  it('fetches page 1 when the collection handle changes', async () => {
    mockGetCollectionProducts.mockResolvedValueOnce(makePage(1, ['ring-1'], false));
    const initialPage = makePage(1, ['a']);

    const { result, rerender } = renderHook(
      ({ handle }) =>
        useGiftingCategoryProducts(handle, {
          pageSize: 12,
          initialHandle: 'best-sellers',
          initialPage,
        }),
      { initialProps: { handle: 'best-sellers' } },
    );

    rerender({ handle: 'rings' });

    await waitFor(() => {
      expect(result.current.products.map((product) => product.id)).toEqual(['ring-1']);
    });
    expect(mockGetCollectionProducts).toHaveBeenCalledWith(
      'rings',
      expect.objectContaining({ page: 1, limit: 12 }),
    );
  });

  it('appends the next page on load more', async () => {
    mockGetCollectionProducts.mockResolvedValueOnce(makePage(2, ['c'], false));
    const initialPage = makePage(1, ['a', 'b']);

    const { result } = renderHook(() =>
      useGiftingCategoryProducts('best-sellers', {
        pageSize: 12,
        initialHandle: 'best-sellers',
        initialPage,
      }),
    );

    await act(async () => {
      await result.current.loadMoreProducts();
    });

    await waitFor(() => {
      expect(result.current.products.map((product) => product.id)).toEqual(['a', 'b', 'c']);
    });
    expect(result.current.hasMoreProducts).toBe(false);
  });

  it('clears products when a tab fetch fails', async () => {
    mockGetCollectionProducts.mockRejectedValueOnce(new Error('network'));
    const initialPage = makePage(1, ['a']);

    const { result, rerender } = renderHook(
      ({ handle }) =>
        useGiftingCategoryProducts(handle, {
          pageSize: 12,
          initialHandle: 'best-sellers',
          initialPage,
        }),
      { initialProps: { handle: 'best-sellers' } },
    );

    rerender({ handle: 'earrings' });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.products).toEqual([]);
    expect(result.current.hasMoreProducts).toBe(false);
  });
});
