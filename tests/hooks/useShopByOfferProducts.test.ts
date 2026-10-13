import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import { productConfig } from '@/config/product/product.config';
import { useShopByOfferProducts } from '@/hooks/useProducts';
import { AppError } from '@/lib/errors';
import { getCollectionProducts } from '@/services/collection.service';
import type { Product, ProductListResponse } from '@/types/product';

jest.mock('@/services/collection.service', () => ({
  getCollectionProducts: jest.fn(),
}));

const mockGetCollectionProducts = getCollectionProducts as jest.MockedFunction<
  typeof getCollectionProducts
>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return Wrapper;
}

function makeProduct(id: string, name: string): Product {
  return {
    id,
    handle: name,
    name,
    description: '',
    price: 999,
    image: '',
    images: [],
    category: 'rings',
    productCategory: 'demifine',
    offers: [],
    variants: [],
  };
}

function makeList(items: Product[]): ProductListResponse {
  return {
    items,
    total: items.length,
    page: 1,
    totalPages: 1,
    hasNext: false,
  };
}

describe('useShopByOfferProducts', () => {
  beforeEach(() => {
    mockGetCollectionProducts.mockReset();
  });

  it('returns collection products and omits the current PDP product', async () => {
    mockGetCollectionProducts.mockResolvedValue(
      makeList([
        makeProduct('gid://shopify/Product/111', 'Current'),
        makeProduct('p2', 'Offer Ring'),
      ]),
    );

    const { result } = renderHook(
      () => useShopByOfferProducts('monsoon-sale-pos', 'gid://shopify/Product/111'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.products.map((product) => product.id)).toEqual(['p2']);
    });
    expect(result.current.error).toBeNull();
    expect(mockGetCollectionProducts).toHaveBeenCalledWith('monsoon-sale-pos', {
      page: 1,
      limit: productConfig.timing.shopByOffersLimit + 1,
    });
  });

  it('matches excluded products by numeric Shopify id', async () => {
    mockGetCollectionProducts.mockResolvedValue(
      makeList([makeProduct('111', 'Current'), makeProduct('p2', 'Offer Ring')]),
    );

    const { result } = renderHook(
      () => useShopByOfferProducts('monsoon-sale', 'gid://shopify/Product/111'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.products.map((product) => product.id)).toEqual(['p2']);
    });
  });

  it('does not fetch when the collection handle is empty', () => {
    const { result } = renderHook(() => useShopByOfferProducts('  ', 'p1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(mockGetCollectionProducts).not.toHaveBeenCalled();
  });

  it('exposes a normalised error when the collection request fails', async () => {
    mockGetCollectionProducts.mockRejectedValue(new AppError('NOT_FOUND', 'Failed'));

    const { result } = renderHook(() => useShopByOfferProducts('monsoon-sale', 'p1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(AppError);
    });
    expect(result.current.products).toEqual([]);
  });
});
