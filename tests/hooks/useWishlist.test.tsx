import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useWishlist } from '@/hooks/useWishlist';
import { AuthContext } from '@/providers/auth/auth.context';
import type { AuthContextValue } from '@/types/auth/auth.types';

const getWishlist = jest.fn();
const addToWishlist = jest.fn();
const removeWishlistItem = jest.fn();

jest.mock('@/services/wishlist.service', () => ({
  getWishlist: (...args: unknown[]) => getWishlist(...args),
  addToWishlist: (...args: unknown[]) => addToWishlist(...args),
  removeWishlistItem: (...args: unknown[]) => removeWishlistItem(...args),
}));

function createWrapper(authOverrides?: Partial<AuthContextValue>) {
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
        <AuthContext.Provider value={{ ...authDefaults, ...authOverrides }}>
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };
}

describe('useWishlist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getWishlist.mockResolvedValue([
      {
        productId: 'product-1',
        variantId: 'variant-1',
        product: {
          id: 'product-1',
          handle: 'ring',
          name: 'Ring',
          description: '',
          price: 1000,
          image: 'https://example.com/ring.jpg',
          images: ['https://example.com/ring.jpg'],
          category: 'rings',
          productCategory: 'demifine',
          offers: [],
          variants: [],
        },
      },
    ]);
    addToWishlist.mockResolvedValue(undefined);
    removeWishlistItem.mockResolvedValue(undefined);
  });

  it('reports wishlisted products from the fetched list', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.hasWishlistItem('product-1')).toBe(true);
    });
    expect(result.current.hasWishlistItem('product-2')).toBe(false);
  });

  it('adds a product to the wishlist when toggling an unsaved product', async () => {
    getWishlist
      .mockResolvedValueOnce([])
      .mockResolvedValue([
        {
          productId: 'product-2',
          variantId: 'variant-2',
          product: {
            id: 'product-2',
            handle: 'bracelet',
            name: 'Bracelet',
            description: '',
            price: 1000,
            image: 'https://example.com/bracelet.jpg',
            images: ['https://example.com/bracelet.jpg'],
            category: 'bracelets',
            productCategory: 'demifine',
            offers: [],
            variants: [],
          },
        },
      ]);

    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleWishlist('product-2');
    });

    expect(addToWishlist).toHaveBeenCalledWith('product-2');

    await waitFor(() => {
      expect(result.current.hasWishlistItem('product-2')).toBe(true);
    });
  });

  it('removes a wishlisted product when toggled again', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.hasWishlistItem('product-1')).toBe(true);
    });

    await act(async () => {
      await result.current.toggleWishlist('product-1');
    });

    expect(removeWishlistItem).toHaveBeenCalledWith('product-1');
    expect(result.current.hasWishlistItem('product-1')).toBe(false);
  });

  it('clears toggling state when login is cancelled', async () => {
    const { LoginCancelledError } = await import('@/lib/auth/login-cancelled');
    const guardApi = jest.fn().mockRejectedValue(new LoginCancelledError());
    getWishlist.mockResolvedValue([]);

    const { result } = renderHook(() => useWishlist(), {
      wrapper: createWrapper({
        isAuthenticated: false,
        isGuest: true,
        session: null,
        guardApi,
      }),
    });

    await act(async () => {
      await result.current.toggleWishlist('product-2').catch(() => undefined);
    });

    expect(guardApi).toHaveBeenCalled();
    expect(addToWishlist).not.toHaveBeenCalled();
    expect(result.current.isTogglingProduct('product-2')).toBe(false);
  });
});
