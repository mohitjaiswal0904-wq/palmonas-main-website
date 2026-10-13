import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import {
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
} from '@/hooks/wishlist/useWishlistMutations';
import { queryKeys } from '@/lib/query/keys';
import { useCartStatsStore } from '@/store/cart/cart-stats.store';

const addToWishlist = jest.fn();
const removeWishlistItem = jest.fn();

jest.mock('@/services/wishlist.service', () => ({
  addToWishlist: (...args: unknown[]) => addToWishlist(...args),
  removeWishlistItem: (...args: unknown[]) => removeWishlistItem(...args),
}));

function createWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  return { Wrapper, client };
}

describe('useWishlistMutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCartStatsStore.setState({ wishlistCount: 0 });
    addToWishlist.mockResolvedValue(undefined);
    removeWishlistItem.mockResolvedValue(undefined);
  });

  it('adds a product and bumps the wishlist badge', async () => {
    const { Wrapper, client } = createWrapper();
    client.setQueryData(queryKeys.wishlist.productIds(), []);

    const { result } = renderHook(() => useAddWishlistItemMutation(), { wrapper: Wrapper });

    await result.current.mutateAsync('product-1');

    expect(addToWishlist).toHaveBeenCalledWith('product-1');
    expect(useCartStatsStore.getState().wishlistCount).toBe(1);
    await waitFor(() => {
      expect(client.getQueryData(queryKeys.wishlist.productIds())).toEqual(['product-1']);
    });
  });

  it('rolls back optimistic add when the API fails', async () => {
    addToWishlist.mockRejectedValue(new Error('network'));
    const { Wrapper, client } = createWrapper();
    client.setQueryData(queryKeys.wishlist.productIds(), []);

    const { result } = renderHook(() => useAddWishlistItemMutation(), { wrapper: Wrapper });

    await expect(result.current.mutateAsync('product-1')).rejects.toThrow('network');
    expect(useCartStatsStore.getState().wishlistCount).toBe(0);
    expect(client.getQueryData(queryKeys.wishlist.productIds())).toEqual([]);
  });

  it('removes a product and decrements the wishlist badge', async () => {
    const { Wrapper, client } = createWrapper();
    client.setQueryData(queryKeys.wishlist.productIds(), ['product-1']);
    client.setQueryData(queryKeys.wishlist.list(), [
      {
        productId: 'product-1',
        variantId: 'v1',
        product: {
          id: 'product-1',
          handle: 'ring',
          name: 'Ring',
          description: '',
          price: 100,
          image: '',
          images: [],
          category: 'rings',
          productCategory: 'demifine',
          offers: [],
          variants: [],
        },
      },
    ]);
    useCartStatsStore.setState({ wishlistCount: 1 });

    const { result } = renderHook(() => useRemoveWishlistItemMutation(), { wrapper: Wrapper });

    await result.current.mutateAsync('product-1');

    expect(removeWishlistItem).toHaveBeenCalledWith('product-1');
    expect(useCartStatsStore.getState().wishlistCount).toBe(0);
  });

  it('rolls back optimistic remove when the API fails', async () => {
    removeWishlistItem.mockRejectedValue(new Error('network'));
    const { Wrapper, client } = createWrapper();
    const list = [
      {
        productId: 'product-1',
        variantId: 'v1',
        product: {
          id: 'product-1',
          handle: 'ring',
          name: 'Ring',
          description: '',
          price: 100,
          image: '',
          images: [],
          category: 'rings',
          productCategory: 'demifine',
          offers: [],
          variants: [],
        },
      },
    ];
    client.setQueryData(queryKeys.wishlist.productIds(), ['product-1']);
    client.setQueryData(queryKeys.wishlist.list(), list);
    useCartStatsStore.setState({ wishlistCount: 1 });

    const { result } = renderHook(() => useRemoveWishlistItemMutation(), { wrapper: Wrapper });

    await expect(result.current.mutateAsync('product-1')).rejects.toThrow('network');
    expect(useCartStatsStore.getState().wishlistCount).toBe(1);
    expect(client.getQueryData(queryKeys.wishlist.productIds())).toEqual(['product-1']);
    expect(client.getQueryData(queryKeys.wishlist.list())).toEqual(list);
  });
});
