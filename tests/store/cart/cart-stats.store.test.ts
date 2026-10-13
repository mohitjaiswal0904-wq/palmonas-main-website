import { fetchCartStatsApi } from '@/services/cart/cart.service';
import { useCartStatsStore } from '@/store/cart/cart-stats.store';

jest.mock('@/services/cart/cart.service', () => ({
  fetchCartStatsApi: jest.fn(),
}));

const mockFetchCartStatsApi = fetchCartStatsApi as jest.MockedFunction<typeof fetchCartStatsApi>;

describe('useCartStatsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCartStatsStore.setState({
      cartCount: 5,
      cartCountHydrated: true,
      wishlistCount: 2,
      wishlistCountHydrated: false,
      loading: false,
      error: null,
    });
  });

  it('setStats updates wishlist only and preserves cartCount', () => {
    useCartStatsStore.getState().setStats({ cartCount: 99, wishlistCount: 7 });

    const state = useCartStatsStore.getState();
    expect(state.cartCount).toBe(5);
    expect(state.cartCountHydrated).toBe(true);
    expect(state.wishlistCount).toBe(7);
    expect(state.wishlistCountHydrated).toBe(true);
  });

  it('setStatsFromApi with applyCartCount updates cart badge from stats', () => {
    useCartStatsStore.getState().setStatsFromApi(
      { cartCount: 9, wishlistCount: 3 },
      { applyCartCount: true },
    );

    const state = useCartStatsStore.getState();
    expect(state.cartCount).toBe(9);
    expect(state.cartCountHydrated).toBe(true);
    expect(state.wishlistCount).toBe(3);
    expect(state.wishlistCountHydrated).toBe(true);
  });

  it('setStatsFromApi without applyCartCount keeps existing cartCount', () => {
    useCartStatsStore.getState().setStatsFromApi(
      { cartCount: 9, wishlistCount: 3 },
      { applyCartCount: false },
    );

    const state = useCartStatsStore.getState();
    expect(state.cartCount).toBe(5);
    expect(state.wishlistCount).toBe(3);
    expect(state.wishlistCountHydrated).toBe(true);
  });

  it('syncCartCountFromCart sets cartCount from cart totalItems', () => {
    useCartStatsStore.getState().syncCartCountFromCart({
      id: 'cart-1',
      items: [],
      totalItems: 3,
      subtotal: 0,
      total: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      currency: 'INR',
      checkoutUrl: '',
    });

    const state = useCartStatsStore.getState();
    expect(state.cartCount).toBe(3);
    expect(state.cartCountHydrated).toBe(true);
  });

  it('refreshAfterAuth applies cartCount and wishlist from API', async () => {
    mockFetchCartStatsApi.mockResolvedValue({ cartCount: 1, wishlistCount: 4 });

    await useCartStatsStore.getState().refreshAfterAuth();

    const state = useCartStatsStore.getState();
    expect(state.cartCount).toBe(1);
    expect(state.wishlistCount).toBe(4);
    expect(state.wishlistCountHydrated).toBe(true);
    expect(state.cartCountHydrated).toBe(true);
  });
});
