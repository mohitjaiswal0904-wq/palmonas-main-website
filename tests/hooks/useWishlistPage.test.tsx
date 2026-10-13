import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useWishlistPage } from '@/hooks/useWishlistPage';
import { AuthContext } from '@/providers/auth/auth.context';
import { useCartStatsStore } from '@/store/cart/cart-stats.store';
import type { AuthContextValue } from '@/types/auth/auth.types';
import { PRODUCT_CATEGORY } from '@/types/product';

const getWishlist = jest.fn();
const enrichWishlistCatalogFields = jest.fn(async (items: unknown[]) => items);
const removeWishlistItem = jest.fn();

jest.mock('@/services/wishlist.service', () => ({
  getWishlist: (...args: unknown[]) => getWishlist(...args),
  enrichWishlistCatalogFields: (items: unknown[]) => enrichWishlistCatalogFields(items),
  clearWishlist: jest.fn(),
  removeWishlistItem: (...args: unknown[]) => removeWishlistItem(...args),
}));

jest.mock('@/lib/cart/cart-stats.local-data-source', () => ({
  persistCartStatsSnapshot: jest.fn(),
  clearCartStatsSnapshot: jest.fn(),
  readCartStatsSnapshot: jest.fn(() => null),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const authDefaults: AuthContextValue = {
    session: {
      user: {
        id: 'user-1',
        isGuest: false,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phoneNumber: null,
        profilePicture: null,
        gender: 'unknown',
      },
      claims: {
        userId: 'user-1',
        sessionId: 'session-1',
        isGuest: false,
        shopifyCustomerId: null,
        expiresAt: Date.now() + 60_000,
      },
    },
    isBootstrapping: false,
    isLoggingIn: false,
    isLoggingOut: false,
    loginStatus: 'idle',
    loginError: null,
    error: null,
    isAuthenticated: true,
    isGuest: false,
    startLogin: jest.fn(),
    dismissLoginStatus: jest.fn(),
    expireLoginFlow: jest.fn(),
    retryLogin: jest.fn(),
    logout: jest.fn().mockResolvedValue(undefined),
    guardAction: jest.fn(),
    guardNavigation: jest.fn(),
    guardModal: jest.fn(),
    guardApi: jest.fn(<T,>(fn: () => Promise<T>) => fn()),
    patchSessionUser: jest.fn(),
  };

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authDefaults}>{children}</AuthContext.Provider>
      </QueryClientProvider>
    );
  };
}

function createWishlistItem(
  productId: string,
  productCategory: (typeof PRODUCT_CATEGORY)[keyof typeof PRODUCT_CATEGORY],
  category: string,
) {
  return {
    productId,
    variantId: '',
    product: {
      id: productId,
      handle: productId,
      name: productId,
      description: '',
      price: 1000,
      image: 'https://example.com/ring.jpg',
      images: ['https://example.com/ring.jpg'],
      category,
      productCategory,
      offers: [],
      variants: [
        {
          id: `${productId}-variant`,
          title: 'Default',
          price: 1000,
          availableForSale: true,
          selectedOptions: [],
        },
      ],
    },
  };
}

describe('useWishlistPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getWishlist.mockResolvedValue([
      createWishlistItem('product-1', PRODUCT_CATEGORY.DEMIFINE, 'rings'),
    ]);
    removeWishlistItem.mockResolvedValue(undefined);
  });

  it('defaults the active pill to the only category with products', async () => {
    getWishlist.mockResolvedValue([createWishlistItem('gold-1', PRODUCT_CATEGORY.GOLD, 'gold')]);

    const { result } = renderHook(() => useWishlistPage(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.itemCount).toBe(1);
    });

    expect(result.current.activeFilter).toBe('gold');
    expect(result.current.availableFilters).toEqual(['demifine', 'gold', 'all']);
    expect(result.current.filteredItems).toHaveLength(1);
  });

  it('keeps categories separated until the all pill is selected', async () => {
    getWishlist.mockResolvedValue([
      createWishlistItem('demifine-1', PRODUCT_CATEGORY.DEMIFINE, 'rings'),
      createWishlistItem('gold-1', PRODUCT_CATEGORY.GOLD, 'gold'),
    ]);

    const { result } = renderHook(() => useWishlistPage(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.itemCount).toBe(2);
    });

    expect(result.current.activeFilter).toBe('demifine');
    expect(result.current.filteredItems).toHaveLength(1);

    act(() => {
      result.current.setActiveFilter('all');
    });

    expect(result.current.activeFilter).toBe('all');
    expect(result.current.filteredItems).toHaveLength(2);
  });

  it('shows an empty gold category so its explore CTA can render', async () => {
    getWishlist.mockResolvedValue([
      createWishlistItem('demifine-1', PRODUCT_CATEGORY.DEMIFINE, 'rings'),
    ]);

    const { result } = renderHook(() => useWishlistPage(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.itemCount).toBe(1);
    });

    act(() => {
      result.current.setActiveFilter('gold');
    });

    expect(result.current.activeFilter).toBe('gold');
    expect(result.current.filteredItems).toHaveLength(0);
  });

  it('zeroes the header wishlist badge when the wishlist is cleared', async () => {
    useCartStatsStore.setState({ wishlistCount: 3, wishlistCountHydrated: true });

    const { result } = renderHook(() => useWishlistPage(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.itemCount).toBe(1);
    });

    await act(async () => {
      await result.current.clearAll();
    });

    expect(useCartStatsStore.getState().wishlistCount).toBe(0);
  });

  it('removes wishlist items by product id', async () => {
    const { result } = renderHook(() => useWishlistPage(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.itemCount).toBe(1);
    });

    await act(async () => {
      await result.current.removeItem('product-1');
    });

    expect(removeWishlistItem).toHaveBeenCalledWith('product-1');
    await waitFor(() => {
      expect(result.current.itemCount).toBe(0);
    });
  });
});
