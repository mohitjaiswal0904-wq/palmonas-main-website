import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import { useProductBundles } from '@/hooks/useProducts';
import { AppError } from '@/lib/errors';
import { getProductBundles } from '@/services/product.service';
import type { ProductBundle } from '@/types/product/bundles';

jest.mock('@/services/product.service', () => ({
  getProductBundles: jest.fn(),
}));

const mockGetProductBundles = getProductBundles as jest.MockedFunction<typeof getProductBundles>;

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

const shopTheLook: ProductBundle = {
  key: 'shop_the_look',
  title: 'Shop the Look',
  products: [
    {
      id: 'p1',
      handle: 'look-ring',
      name: 'Look Ring',
      description: '',
      price: 999,
      image: '',
      images: [],
      category: 'rings',
      productCategory: 'demifine',
      offers: [],
      variants: [],
    },
  ],
};

describe('useProductBundles', () => {
  beforeEach(() => {
    mockGetProductBundles.mockReset();
  });

  it('returns bundle rails for a product handle', async () => {
    mockGetProductBundles.mockResolvedValue([shopTheLook]);

    const { result } = renderHook(() => useProductBundles('gold-bracelet'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.bundles).toEqual([shopTheLook]);
    });
    expect(result.current.error).toBeNull();
    expect(mockGetProductBundles).toHaveBeenCalledWith('gold-bracelet');
  });

  it('does not fetch when the handle is empty', () => {
    const { result } = renderHook(() => useProductBundles(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.bundles).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(mockGetProductBundles).not.toHaveBeenCalled();
  });

  it('exposes a normalised error when the request fails', async () => {
    mockGetProductBundles.mockRejectedValue(new AppError('NOT_FOUND', 'Failed'));

    const { result } = renderHook(() => useProductBundles('gold-bracelet'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(AppError);
    });
    expect(result.current.bundles).toBeUndefined();
  });

  it('starts in a loading state before rails arrive', () => {
    mockGetProductBundles.mockReturnValue(new Promise<ProductBundle[]>(() => undefined));

    const { result } = renderHook(() => useProductBundles('gold-bracelet'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.bundles).toBeUndefined();
  });
});
