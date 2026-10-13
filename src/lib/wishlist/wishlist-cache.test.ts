import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/keys';
import {
  isRenderableWishlistItem,
  optimisticallyAddWishlistProductId,
  readWishlistProductIds,
} from '@/lib/wishlist/wishlist-cache';
import { PRODUCT_CATEGORY } from '@/types/product';
import type { WishlistItem } from '@/types/wishlist';

function createQueryClientStub(): QueryClient {
  const cache = new Map<string, unknown>();

  return {
    getQueryData: (key: unknown[]) => cache.get(JSON.stringify(key)),
    setQueryData: (key: unknown[], value: unknown) => {
      cache.set(JSON.stringify(key), value);
    },
  } as unknown as QueryClient;
}

describe('wishlist-cache', () => {
  it('detects renderable wishlist rows', () => {
    const renderable: WishlistItem = {
      productId: '1',
      variantId: '2',
      product: {
        id: '1',
        handle: 'ring',
        name: 'Ring',
        description: '',
        price: 100,
        image: '',
        images: [],
        category: 'rings',
        productCategory: PRODUCT_CATEGORY.DEMIFINE,
        offers: [],
        variants: [],
      },
    };

    expect(isRenderableWishlistItem(renderable)).toBe(true);
    expect(
      isRenderableWishlistItem({
        ...renderable,
        product: { ...renderable.product, handle: '' },
      }),
    ).toBe(false);
  });

  it('stores heart-state ids separately from list rows', () => {
    const queryClient = createQueryClientStub();

    optimisticallyAddWishlistProductId(queryClient, 'product-9');

    expect(readWishlistProductIds(queryClient)).toEqual(['product-9']);
    expect(queryClient.getQueryData(queryKeys.wishlist.list())).toBeUndefined();
  });
});
