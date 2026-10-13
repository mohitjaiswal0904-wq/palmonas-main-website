import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WishlistButton } from '@/components/product/WishlistButton';
import { AuthContext } from '@/providers/auth/auth.context';
import type { AuthContextValue } from '@/types/auth/auth.types';

const toggleWishlist = jest.fn().mockResolvedValue(undefined);
const hasWishlistItem = jest.fn().mockReturnValue(false);

jest.mock('@/hooks/useWishlist', () => ({
  useWishlist: () => ({
    hasWishlistItem,
    toggleWishlist,
    isTogglingProduct: () => false,
  }),
}));

function renderWishlistButton(
  props?: Partial<React.ComponentProps<typeof WishlistButton>>,
  authOverrides?: Partial<AuthContextValue>,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const authDefaults: AuthContextValue = {
    session: null,
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
    guardApi: jest.fn((fn) => fn()),
    patchSessionUser: jest.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ ...authDefaults, ...authOverrides }}>
        <WishlistButton
          productId="product-1"
          productName="Gold Ring"
          variant="card"
          {...props}
        />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('WishlistButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hasWishlistItem.mockReturnValue(false);
  });

  it('renders add-to-wishlist label before the item is saved', () => {
    renderWishlistButton();

    expect(screen.getByRole('button', { name: 'Add Gold Ring to wishlist' })).toBeInTheDocument();
  });

  it('uses a white circular background on the card wishlist CTA (PW-630)', () => {
    renderWishlistButton();

    expect(screen.getByRole('button', { name: 'Add Gold Ring to wishlist' })).toHaveClass(
      'bg-white',
      'rounded-full',
    );
  });

  it('calls toggleWishlist with product id on click', async () => {
    const user = userEvent.setup();
    renderWishlistButton();

    await user.click(screen.getByRole('button', { name: 'Add Gold Ring to wishlist' }));

    expect(toggleWishlist).toHaveBeenCalledWith('product-1');
  });

  it('shows remove label and pressed state when wishlisted', () => {
    hasWishlistItem.mockReturnValue(true);
    renderWishlistButton();

    expect(
      screen.getByRole('button', { name: 'Remove Gold Ring from wishlist' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
