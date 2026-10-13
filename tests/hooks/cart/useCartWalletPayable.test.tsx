import { renderHook } from '@testing-library/react';

import { useCartWalletPayable } from '@/hooks/cart/useCartWalletPayable';

const mockUsePathname = jest.fn(() => '/cart');
const mockUseAuth = jest.fn(() => ({ isAuthenticated: true }));
const mockUseWallet = jest.fn((_opts?: { enabled?: boolean }) => ({
  balance: 500,
  loading: false,
  isFetching: false,
  error: null,
}));

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/hooks/user/useWallet', () => ({
  useWallet: (opts?: { enabled?: boolean }) => mockUseWallet(opts),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/config/cart/cart.config', () => ({
  ...jest.requireActual('@/config/cart/cart.config'),
  isCartFeatureEnabled: jest.fn((feature: string) => {
    const actual = jest.requireActual('@/config/cart/cart.config');
    return actual.isCartFeatureEnabled(feature);
  }),
}));

describe('useCartWalletPayable', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/cart');
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    mockUseWallet.mockReturnValue({
      balance: 500,
      loading: false,
      isFetching: false,
      error: null,
    });
  });

  it('does not apply wallet when toggle is off', () => {
    const { result } = renderHook(() => useCartWalletPayable(1000, false));

    expect(result.current.walletApplied).toBe(0);
    expect(result.current.payableTotal).toBe(1000);
  });

  it('applies wallet when toggle is on', () => {
    const { result } = renderHook(() => useCartWalletPayable(1000, true));

    expect(result.current.walletApplied).toBe(500);
    expect(result.current.payableTotal).toBe(500);
  });

  it('skips wallet fetch off cart route', () => {
    mockUsePathname.mockReturnValue('/products/ring');

    renderHook(() => useCartWalletPayable(1000, true));

    expect(mockUseWallet).toHaveBeenCalledWith({ enabled: false });
  });

  it('skips wallet fetch for guest users on cart route', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    const { result } = renderHook(() => useCartWalletPayable(1000, true));

    expect(mockUseWallet).toHaveBeenCalledWith({ enabled: false });
    expect(result.current.walletApplied).toBe(0);
    expect(result.current.payableTotal).toBe(1000);
  });

  it('applies min(balance, cartTotal) when wallet toggle is on', () => {
    mockUseWallet.mockReturnValue({
      balance: 500,
      loading: false,
      isFetching: false,
      error: null,
    });

    const { result: capped } = renderHook(() => useCartWalletPayable(300, true));
    expect(capped.current.walletApplied).toBe(300);
    expect(capped.current.payableTotal).toBe(0);

    mockUseWallet.mockReturnValue({
      balance: 200,
      loading: false,
      isFetching: false,
      error: null,
    });

    const { result: partial } = renderHook(() => useCartWalletPayable(750, true));
    expect(partial.current.walletApplied).toBe(200);
    expect(partial.current.payableTotal).toBe(550);
  });
});
