import { createElement } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CartStatsProvider, useCartStats } from '@/providers/cart/CartStatsProvider';
import { hydrateAuthenticatedCartLines } from '@/services/cart/cart-hydrate.service';
import { fetchCartStatsApi } from '@/services/cart/cart.service';
import { useCartStatsStore } from '@/store/cart/cart-stats.store';
import { useCartStore } from '@/store/cart/cart.store';
import type { Cart } from '@/types/cart';

const mockReadGuestCartSnapshot = jest.fn();
const mockReadCartStatsSnapshot = jest.fn();

jest.mock('@/services/cart/cart.service', () => ({
  fetchCartStatsApi: jest.fn(),
}));

jest.mock('@/services/cart/cart-hydrate.service', () => ({
  hydrateAuthenticatedCartLines: jest.fn(),
}));

jest.mock('@/lib/cart/guest-cart.local-data-source', () => ({
  ...jest.requireActual('@/lib/cart/guest-cart.local-data-source'),
  readGuestCartSnapshot: () => mockReadGuestCartSnapshot(),
}));

jest.mock('@/lib/cart/cart-stats.local-data-source', () => ({
  ...jest.requireActual('@/lib/cart/cart-stats.local-data-source'),
  readCartStatsSnapshot: () => mockReadCartStatsSnapshot(),
}));

const mockUseAuth = jest.fn();

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockFetchCartStatsApi = fetchCartStatsApi as jest.MockedFunction<typeof fetchCartStatsApi>;
const mockHydrateAuthenticatedCartLines = hydrateAuthenticatedCartLines as jest.MockedFunction<
  typeof hydrateAuthenticatedCartLines
>;

const sampleCart: Cart = {
  id: 'cart-1',
  items: [
    {
      id: 'line-1',
      quantity: 1,
      price: 1000,
      originalPrice: 1200,
      totalPrice: 1000,
      product_category: 'rings',
      isAvailable: true,
      product: {
        id: 'prod-1',
        name: 'Ring',
        handle: 'ring',
        primaryImage: '',
        variantId: 'gid://shopify/ProductVariant/123',
        variantTitle: 'Default',
        product_category: 'rings',
      },
    },
  ],
  totalItems: 1,
  subtotal: 1000,
  total: 1000,
  tax: 0,
  shipping: 0,
  discount: 0,
  currency: 'INR',
  checkoutUrl: '',
};

function renderCartStatsHook() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(CartStatsProvider, null, children),
    );

  return renderHook(() => useCartStats(), { wrapper });
}

describe('useCartStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchCartStatsApi.mockResolvedValue({ cartCount: 8, wishlistCount: 20 });
    mockHydrateAuthenticatedCartLines.mockResolvedValue(sampleCart);
    mockReadGuestCartSnapshot.mockReturnValue(null);
    mockReadCartStatsSnapshot.mockReturnValue(null);
    useCartStore.setState({ cart: null });
    useCartStatsStore.setState({
      cartCount: 5,
      cartCountHydrated: true,
      wishlistCount: 16,
      wishlistCountHydrated: true,
      loading: false,
      error: null,
    });
  });

  it('returns badge counts from context', () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'u1' } },
      isLoading: true,
      isGuest: false,
    });
    const { result } = renderCartStatsHook();

    expect(result.current.cartCount).toBe(5);
    expect(result.current.wishlistCount).toBe(16);
    // Client RTL uses getClientSnapshot → hydrated flags surface after mount gate.
    expect(result.current.cartCountHydrated).toBe(true);
    expect(result.current.wishlistCountHydrated).toBe(true);
  });

  it('throws when used outside CartStatsProvider', () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    expect(() => renderHook(() => useCartStats(), { wrapper })).toThrow(
      'useCartStats must be used within CartStatsProvider',
    );
  });
});

describe('CartStatsProvider bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchCartStatsApi.mockResolvedValue({ cartCount: 8, wishlistCount: 20 });
    mockHydrateAuthenticatedCartLines.mockImplementation(async () => {
      useCartStore.getState().setCart(sampleCart);
      return sampleCart;
    });
    mockReadGuestCartSnapshot.mockReturnValue(null);
    mockReadCartStatsSnapshot.mockReturnValue(null);
    useCartStore.setState({ cart: null });
    useCartStatsStore.setState({
      cartCount: 0,
      cartCountHydrated: false,
      wishlistCount: 0,
      wishlistCountHydrated: false,
      loading: false,
      error: null,
    });
  });

  it('restores persisted stats and refreshes authenticated counts from API', async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'u1' } },
      isLoading: false,
      isGuest: false,
    });
    mockReadCartStatsSnapshot.mockReturnValue({
      cartCount: 5,
      cartCountHydrated: true,
      wishlistCount: 16,
      wishlistCountHydrated: true,
    });

    renderCartStatsHook();

    await waitFor(() => {
      expect(useCartStatsStore.getState().wishlistCount).toBe(20);
      expect(useCartStatsStore.getState().cartCount).toBe(8);
      expect(useCartStatsStore.getState().wishlistCountHydrated).toBe(true);
    });
  });

  it('hydrates authenticated cart lines so PLP in-cart state survives refresh', async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'u1' } },
      isLoading: false,
      isGuest: false,
    });

    renderCartStatsHook();

    await waitFor(() => {
      expect(mockHydrateAuthenticatedCartLines).toHaveBeenCalled();
      expect(useCartStore.getState().cart?.id).toBe('cart-1');
      expect(useCartStore.getState().cart?.items).toHaveLength(1);
    });
  });

  it('keeps cart null when authenticated cart hydrate fails', async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'u1' } },
      isLoading: false,
      isGuest: false,
    });
    mockHydrateAuthenticatedCartLines.mockRejectedValueOnce(new Error('network'));

    renderCartStatsHook();

    await waitFor(() => {
      expect(mockHydrateAuthenticatedCartLines).toHaveBeenCalled();
    });

    expect(useCartStore.getState().cart).toBeNull();
  });

  it('does not fetch cart lines for guest bootstrap', async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'guest' } },
      isLoading: false,
      isGuest: true,
    });
    mockReadGuestCartSnapshot.mockReturnValue(sampleCart);

    renderCartStatsHook();

    await waitFor(() => {
      expect(useCartStore.getState().cart?.id).toBe('cart-1');
    });

    expect(mockHydrateAuthenticatedCartLines).not.toHaveBeenCalled();
  });
});
