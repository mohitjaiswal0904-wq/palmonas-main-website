import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import { cartConfig } from '@/config/cart/cart.config';
import { useCartRecommendedProducts } from '@/hooks/cart/useCartRecommendedProducts';
import { AppError } from '@/lib/errors';
import { getProduct } from '@/services/product.service';
import type { CartItem } from '@/types/cart';
import type { Product } from '@/types/product';

jest.mock('@/services/product.service', () => ({
  getProduct: jest.fn(),
}));

jest.mock('@/config/cart/cart.config', () => {
  const actual = jest.requireActual('@/config/cart/cart.config');
  return {
    ...actual,
    isCartFeatureEnabled: jest.fn((feature: string) => feature === 'recommendedUpsell'),
  };
});

const mockCartItems: CartItem[] = [];

jest.mock('@/store/cart/cart.store', () => ({
  useCartStore: (selector: (state: { cart: { items: CartItem[] } | null }) => unknown) =>
    selector({ cart: { items: mockCartItems } }),
}));

const mockGetProduct = getProduct as jest.MockedFunction<typeof getProduct>;

const { isCartFeatureEnabled } = jest.requireMock('@/config/cart/cart.config') as {
  isCartFeatureEnabled: jest.Mock;
};

const RECOMMENDED_IDS = cartConfig.recommendedUpsell.productIds;

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

/**
 * Builds a minimal product fixture for recommended upsell mocks.
 *
 * @param id - Product id and handle.
 * @returns A typed Product with required fields filled.
 */
function makeProduct(id: string): Product {
  return {
    id,
    handle: id,
    name: `Product ${id}`,
    description: '',
    price: 2029,
    compareAtPrice: 2899,
    image: `https://cdn.example.com/${id}.jpg`,
    images: [`https://cdn.example.com/${id}.jpg`],
    category: 'rings',
    productCategory: 'demifine',
    offers: [],
    variants: [
      {
        id: `${id}-v1`,
        title: 'Default',
        price: 2029,
        availableForSale: true,
        selectedOptions: [],
      },
    ],
  };
}

/**
 * Builds a cart line fixture for in-cart filtering tests.
 *
 * @param productId - Product id on the line.
 * @param variantId - Variant id on the line.
 * @returns A typed CartItem.
 */
function makeCartItem(productId: string, variantId: string): CartItem {
  return {
    id: `line-${productId}`,
    product: {
      id: productId,
      name: `Product ${productId}`,
      primaryImage: '',
      handle: productId,
      variantId,
      variantTitle: 'Default',
      product_category: 'demifine',
    },
    quantity: 1,
    price: 2029,
    product_category: 'demifine',
    totalPrice: 2029,
    isAvailable: true,
  };
}

/**
 * Resolves getProduct with fixtures for the configured recommended ids.
 */
function mockRecommendedProducts(): void {
  mockGetProduct.mockImplementation(async (id: string) => makeProduct(id));
}

describe('useCartRecommendedProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartItems.length = 0;
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'recommendedUpsell');
  });

  it('loads the configured recommended products in config order', async () => {
    mockRecommendedProducts();

    const { result } = renderHook(() => useCartRecommendedProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.products).toHaveLength(RECOMMENDED_IDS.length);
    });

    expect(result.current.products.map((product) => product.id)).toEqual(RECOMMENDED_IDS);
    expect(mockGetProduct.mock.calls.map((call) => call[0])).toEqual(RECOMMENDED_IDS);
    expect(result.current.error).toBeNull();
  });

  it('excludes products already in the cart', async () => {
    const inCartId = RECOMMENDED_IDS[0];
    mockCartItems.push(makeCartItem(inCartId ?? '', `${inCartId}-v1`));
    mockRecommendedProducts();

    const { result } = renderHook(() => useCartRecommendedProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.products.map((product) => product.id)).toEqual(RECOMMENDED_IDS.slice(1));
    });
  });

  it('excludes products matched by variant id when product ids differ in format', async () => {
    const keptId = RECOMMENDED_IDS[0];
    const excludedId = RECOMMENDED_IDS[1];
    mockCartItems.push(makeCartItem('gid://shopify/Product/99', `${excludedId}-v1`));
    mockRecommendedProducts();

    const { result } = renderHook(() => useCartRecommendedProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.products.map((product) => product.id)).toEqual(
        RECOMMENDED_IDS.filter((id) => id !== excludedId),
      );
    });

    expect(result.current.products[0]?.id).toBe(keptId);
  });

  it('keeps remaining products when one product request fails', async () => {
    const failedId = RECOMMENDED_IDS[1];
    mockGetProduct.mockImplementation(async (id: string) => {
      if (id === failedId) {
        throw new AppError('NOT_FOUND', 'Product missing');
      }
      return makeProduct(id);
    });

    const { result } = renderHook(() => useCartRecommendedProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.products.map((product) => product.id)).toEqual(
        RECOMMENDED_IDS.filter((id) => id !== failedId),
      );
    });

    expect(result.current.error).toBeNull();
  });

  it('returns an empty list while loading', () => {
    mockGetProduct.mockReturnValue(new Promise(() => undefined) as never);

    const { result } = renderHook(() => useCartRecommendedProducts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.products).toEqual([]);
  });

  it('skips the request when the recommended upsell feature is disabled', async () => {
    isCartFeatureEnabled.mockReturnValue(false);

    const { result } = renderHook(() => useCartRecommendedProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetProduct).not.toHaveBeenCalled();
    expect(result.current.products).toEqual([]);
  });

  it('surfaces AppError when every product request fails', async () => {
    mockGetProduct.mockRejectedValue(new AppError('NOT_FOUND', 'Product missing'));

    const { result } = renderHook(() => useCartRecommendedProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error?.code).toBe('NOT_FOUND');
    });

    expect(result.current.products).toEqual([]);
  });
});
