import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { CartPageContent } from '@/components/cart/CartPageContent';
import { cartMessages } from '@/config/cart/cart.config';
import { LoginCancelledError } from '@/lib/auth/login-cancelled';
import type { Cart } from '@/types/cart';

const mockGuard = jest.fn((fn: () => void) => fn());
const mockGuardApi = jest.fn(<T,>(fn: () => Promise<T>) => fn());
const mockUseCart = jest.fn();
const mockUseAuth = jest.fn();
const mockRefreshCartSilent = jest.fn();

jest.mock('@/hooks/useCart', () => ({
  useCart: () => mockUseCart(),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
  useRequireAuth: () => ({ guard: mockGuard, guardApi: mockGuardApi }),
}));

import { createUseToastMock } from '@tests/test-utils/mock-use-toast';

const toastMock = createUseToastMock();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => toastMock,
}));

jest.mock('@/hooks/cart/useCartWalletPayable', () => ({
  useCartWalletPayable: () => ({
    walletApplied: 0,
    payableTotal: 100,
    loading: false,
    balance: 700,
  }),
}));

jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: () => false,
}));

jest.mock('@/hooks/cart/useCartRecommendedProducts', () => ({
  useCartRecommendedProducts: () => ({ products: [], isLoading: false, error: null }),
}));

jest.mock('@/hooks/wishlist/useWishlistMutations', () => ({
  useAddWishlistItemMutation: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
}));

jest.mock('@/providers/navigation/NavigationPendingProvider', () => ({
  useNavigationPending: () => ({
    pendingHref: null,
    startNavigation: jest.fn(),
    clearNavigation: jest.fn(),
  }),
}));

const { useAddWishlistItemMutation } = jest.requireMock('@/hooks/wishlist/useWishlistMutations') as {
  useAddWishlistItemMutation: jest.Mock;
};

jest.mock('@/infrastructure/checkout', () => ({
  checkoutProvider: { openCheckout: jest.fn() },
  registerCheckoutToast: jest.fn(),
  GokwikCheckout: () => null,
}));

const { checkoutProvider } = jest.requireMock('@/infrastructure/checkout') as {
  checkoutProvider: { openCheckout: jest.Mock };
};

jest.mock('@/lib/cart/checkout-utm-storage', () => ({
  getStoredLandingUtmParams: jest.fn(() => ({})),
  captureLandingUtmParams: jest.fn(),
  parseUtmQueryParams: jest.fn(() => ({})),
  applyUtmParamsToPageUrl: jest.fn(),
  UTM_QUERY_KEYS: [],
}));

jest.mock('@/config/cart/cart.config', () => ({
  ...jest.requireActual('@/config/cart/cart.config'),
  isCartFeatureEnabled: jest.fn(() => true),
}));

const cartWithItems: Cart = {
  id: 'cart-1',
  items: [
    {
      id: 'line-1',
      quantity: 1,
      price: 100,
      originalPrice: 120,
      totalPrice: 100,
      product_category: 'rings',
      isAvailable: true,
      product: {
        id: 'p1',
        name: 'Ring',
        handle: 'ring',
        primaryImage: '',
        variantId: 'v1',
        variantTitle: 'Gold',
        product_category: 'rings',
      },
    },
  ],
  totalItems: 1,
  subtotal: 100,
  total: 100,
  tax: 0,
  shipping: 0,
  discount: 0,
  currency: 'INR',
  checkoutUrl: '',
};

describe('CartPageContent layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGuard.mockImplementation((fn: () => void) => fn());
    mockGuardApi.mockImplementation(<T,>(fn: () => Promise<T>) => fn());
    jest.requireMock('@/hooks/useToast').useToast = () => toastMock;
    useAddWishlistItemMutation.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      session: { user: { id: 'u1' } },
    });
    mockUseCart.mockReturnValue({
      cart: cartWithItems,
      loading: false,
      isFetching: false,
      isEmpty: false,
      showEmpty: false,
      isMutating: false,
      discounts: null,
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      summary: {
        subtotal: 100,
        total: 100,
        tax: 0,
        shipping: 0,
        discount: 0,
        itemCount: 1,
      },
      actions: {
        prepareCheckout: jest.fn().mockResolvedValue({
          isValid: true,
          cartId: 'gid://shopify/Cart/cart-1',
          preCheckout: { is_valid: true, cart_id: 'cart-1', items: [] },
          cart: { ...cartWithItems, checkoutUrl: 'https://palmonas.myshopify.com/cart/c/abc' },
        }),
        addItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        refreshCartSilent: mockRefreshCartSilent,
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
        applyClubbedCartMutations: jest.fn(),
      },
      updatingLineId: null,
      removingLineId: null,
      cartMergeInProgress: false,
    });
  });

  it('shows skeleton while guest cart merge is in progress', () => {
    mockUseCart.mockReturnValue({
      cart: cartWithItems,
      loading: false,
      isFetching: true,
      isEmpty: false,
      showEmpty: false,
      isMutating: false,
      cartMergeInProgress: true,
      summary: {
        subtotal: 100,
        total: 100,
        tax: 0,
        shipping: 0,
        discount: 0,
        itemCount: 1,
      },
      actions: {
        prepareCheckout: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        refreshCartSilent: mockRefreshCartSilent,
      },
      updatingLineId: null,
      removingLineId: null,
    });

    render(<CartPageContent />);

    expect(screen.getByTestId('cart-fetching-skeleton')).toBeInTheDocument();
  });

  it('shows cart items while auth is still bootstrapping when a snapshot exists', () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      session: null,
    });

    render(<CartPageContent />);

    expect(screen.queryByTestId('cart-fetching-skeleton')).not.toBeInTheDocument();
    expect(screen.getByText('Ring')).toBeInTheDocument();
  });

  it('shows skeleton while cart is loading without hydrated cart', () => {
    mockUseCart.mockReturnValue({
      cart: null,
      loading: true,
      isFetching: true,
      isEmpty: true,
      showEmpty: false,
      isMutating: false,
      summary: {
        subtotal: 0,
        total: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        itemCount: 0,
      },
      actions: {
        prepareCheckout: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        refreshCartSilent: mockRefreshCartSilent,
      },
      updatingLineId: null,
      removingLineId: null,
    });

    render(<CartPageContent />);

    expect(screen.getByTestId('cart-fetching-skeleton')).toBeInTheDocument();
  });

  it('renders one mobile checkout CTA without price suffix', () => {
    render(<CartPageContent />);

    const footer = screen.getByTestId('cart-mobile-sticky-footer');
    const button = within(footer).getByRole('button', { name: cartMessages.continueToCheckout });
    expect(button).not.toHaveTextContent('₹');
  });

  it('renders Figma layout sections', () => {
    render(<CartPageContent />);

    expect(screen.getByTestId('cart-checkout-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('cart-checkout-sidebar')).toHaveClass(
      'laptop:col-start-2',
      'laptop:row-start-2',
    );
    expect(screen.getByTestId('cart-line-items-column')).toHaveClass(
      'laptop:col-start-1',
      'laptop:row-start-2',
    );
    expect(screen.getByTestId('cart-mobile-sticky-footer')).toBeInTheDocument();
    expect(screen.getByTestId('cart-mobile-footer-clearance')).toBeInTheDocument();
    expect(screen.getByTestId('cart-mobile-checkout-sections')).toBeInTheDocument();
    expect(screen.getAllByTestId('cart-coupon-section').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('cart-order-summary-heading')).toHaveClass(
      'text-[15px]',
      'font-semibold',
    );
    expect(screen.queryByTestId('cart-dispatch-info-banner')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('cart-bundle-deal-banner').length).toBeGreaterThanOrEqual(1);
  });

  it('shows only line offers that also exist in available store offers', () => {
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      cart: {
        ...cartWithItems,
        items: [
          {
            ...cartWithItems.items[0]!,
            applicableDiscounts: [
              { key: 'MONSOON4', label: 'Buy 4 At ₹2999', code: 'MONSOON4' },
              { key: 'B1G1', label: 'Buy 1 Get 1', code: 'B1G1' },
              { key: 'BDAY3', label: 'Buy 3 At ₹2999', code: 'BDAY3' },
            ],
          },
        ],
      },
      discounts: {
        availableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'B1G1',
            discountDetail: 'Buy 1 Get 1 Free',
          },
          {
            offerType: 'store_offer',
            discountCode: 'MONSOON4',
            discountDetail: 'Buy 4 at 2999',
          },
        ],
        unavailableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'BDAY3',
            discountDetail: 'Need 3 items',
          },
        ],
        appliedCode: null,
        appliedAmountSaved: 0,
        payableAfterDiscount: null,
      },
    });

    render(<CartPageContent />);

    expect(screen.getByText('Buy 4 At ₹2999')).toBeInTheDocument();
    expect(screen.getByText('Buy 1 Get 1')).toBeInTheDocument();
    expect(screen.queryByText('Buy 3 At ₹2999')).not.toBeInTheDocument();
  });

  it('shows applied line allocations from cart API on the item card', () => {
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      cart: {
        ...cartWithItems,
        items: [
          {
            ...cartWithItems.items[0]!,
            lineDiscountAllocations: [
              { key: 'mega40', title: 'mega40', amount: 90320, valueType: 'fixed_amount' },
            ],
            applicableDiscounts: [{ key: 'mega40', label: 'Flat 40% Off', code: 'mega40' }],
          },
        ],
      },
    });

    render(<CartPageContent />);

    expect(screen.getByTestId('cart-item-applied-discounts')).toBeInTheDocument();
    expect(screen.getByText('Flat 40% Off Applied')).toBeInTheDocument();
    expect(screen.queryByTestId('cart-item-applicable-discounts')).not.toBeInTheDocument();
  });

  it('renders see-all gift-card links to cart sub-routes', () => {
    render(<CartPageContent />);

    expect(screen.queryByTestId('cart-see-all-coupons')).not.toBeInTheDocument();
    const giftLinks = screen.getAllByTestId('cart-see-all-gift-cards');
    expect(giftLinks[0]).toHaveAttribute('href', '/cart/gift-cards');
  });

  it('shows fetching skeleton instead of empty state during auth refetch', () => {
    mockUseCart.mockReturnValue({
      cart: null,
      loading: false,
      isFetching: true,
      isEmpty: true,
      showEmpty: false,
      isMutating: false,
      summary: { subtotal: 0, total: 0, tax: 0, shipping: 0, discount: 0, itemCount: 0 },
      actions: { refreshCartSilent: mockRefreshCartSilent },
      updatingLineId: null,
      removingLineId: null,
    });

    render(<CartPageContent />);

    expect(screen.getByTestId('cart-fetching-skeleton')).toBeInTheDocument();
    expect(screen.queryByText(cartMessages.emptyTitle)).not.toBeInTheDocument();
  });

  it('does not flash full-page skeleton when cart is already empty during refetch', () => {
    mockUseCart.mockReturnValue({
      cart: { ...cartWithItems, items: [] },
      loading: false,
      isFetching: true,
      isEmpty: true,
      showEmpty: true,
      isMutating: false,
      summary: { subtotal: 0, total: 0, tax: 0, shipping: 0, discount: 0, itemCount: 0 },
      actions: { refreshCartSilent: mockRefreshCartSilent },
      updatingLineId: null,
      removingLineId: null,
      cartMergeInProgress: false,
    });

    render(<CartPageContent />);

    expect(screen.queryByTestId('cart-fetching-skeleton')).not.toBeInTheDocument();
    expect(screen.getByText(cartMessages.emptyTitle)).toBeInTheDocument();
  });

  it('shows empty state while auth is bootstrapping when cart is already empty', () => {
    mockUseAuth.mockReturnValue({ isLoading: true, session: null });
    mockUseCart.mockReturnValue({
      cart: null,
      loading: false,
      isFetching: false,
      isEmpty: true,
      showEmpty: true,
      summary: { subtotal: 0, total: 0, tax: 0, shipping: 0, discount: 0, itemCount: 0 },
      actions: { refreshCartSilent: mockRefreshCartSilent },
      updatingLineId: null,
      removingLineId: null,
    });

    render(<CartPageContent />);

    expect(screen.queryByTestId('cart-fetching-skeleton')).not.toBeInTheDocument();
    expect(screen.getByText(cartMessages.emptyTitle)).toBeInTheDocument();
  });

  it('shows inline overlay while a line-item mutation is in flight', () => {
    mockUseCart.mockReturnValue({
      cart: cartWithItems,
      loading: false,
      isFetching: false,
      isEmpty: false,
      showEmpty: false,
      isMutating: true,
      summary: {
        subtotal: 100,
        total: 100,
        tax: 0,
        shipping: 0,
        discount: 0,
        itemCount: 1,
      },
      actions: { refreshCartSilent: mockRefreshCartSilent },
      updatingLineId: 'line-1',
      removingLineId: null,
    });

    render(<CartPageContent />);

    expect(screen.getByTestId('cart-items-mutation-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-card')).toBeInTheDocument();
    expect(screen.getAllByTestId('cart-wallet-toggle').length).toBeGreaterThanOrEqual(1);
  });

  it('links cart line cards to the product page from the API handle', () => {
    render(<CartPageContent />);

    expect(screen.getByRole('link', { name: 'View Ring' })).toHaveAttribute(
      'href',
      '/products/ring',
    );
  });

  it('shows the Out of Stock image badge when a clubbed line is unavailable', () => {
    mockUseCart.mockReturnValue({
      ...mockUseCart(),
      cart: {
        ...cartWithItems,
        items: [{ ...cartWithItems.items[0]!, isAvailable: false }],
      },
    });

    render(<CartPageContent />);

    expect(screen.getByTestId('cart-item-out-of-stock')).toHaveTextContent(cartMessages.outOfStock);
    expect(screen.getByTestId('cart-item-card')).toHaveAttribute('data-out-of-stock', 'true');
  });

  it('renders gift wrap below items and adds wrap SKU with cart quantity when checked', async () => {
    const addItem = jest.fn().mockResolvedValue(undefined);
    mockUseCart.mockReturnValue({
      cart: cartWithItems,
      loading: false,
      isFetching: false,
      isEmpty: false,
      showEmpty: false,
      isMutating: false,
      discounts: null,
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      summary: {
        subtotal: 100,
        total: 100,
        tax: 0,
        shipping: 0,
        discount: 0,
        itemCount: 1,
      },
      actions: {
        addItem,
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        refreshCartSilent: mockRefreshCartSilent,
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
        applyClubbedCartMutations: jest.fn(),
        prepareCheckout: jest.fn(),
      },
      updatingLineId: null,
      removingLineId: null,
      cartMergeInProgress: false,
    });

    render(<CartPageContent />);

    const giftWrap = screen.getByTestId('cart-gift-wrap');
    const itemCard = screen.getByTestId('cart-item-card');
    expect(itemCard.compareDocumentPosition(giftWrap) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.click(within(giftWrap).getByRole('checkbox'));

    await waitFor(() => {
      expect(addItem).toHaveBeenCalledWith('9132590334209', 1);
    });
  });

  it('removes gift wrap SKU when unchecked', async () => {
    const removeItem = jest.fn().mockResolvedValue(undefined);
    const wrapCart: Cart = {
      ...cartWithItems,
      items: [
        ...cartWithItems.items,
        {
          id: 'wrap-line',
          quantity: 1,
          price: 50,
          totalPrice: 50,
          product_category: 'gift',
          isAvailable: true,
          product: {
            id: 'wrap',
            name: 'Gift Wrap',
            handle: 'gift-wrap',
            primaryImage: '',
            variantId: '9132590334209',
            variantTitle: 'Default',
            product_category: 'gift',
          },
        },
      ],
      totalItems: 2,
      subtotal: 150,
      total: 150,
    };

    mockUseCart.mockReturnValue({
      cart: wrapCart,
      loading: false,
      isFetching: false,
      isEmpty: false,
      showEmpty: false,
      isMutating: false,
      discounts: null,
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      summary: {
        subtotal: 150,
        total: 150,
        tax: 0,
        shipping: 0,
        discount: 0,
        itemCount: 2,
      },
      actions: {
        addItem: jest.fn(),
        removeItem,
        updateQuantity: jest.fn(),
        refreshCartSilent: mockRefreshCartSilent,
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
        applyClubbedCartMutations: jest.fn(),
        prepareCheckout: jest.fn(),
      },
      updatingLineId: null,
      removingLineId: null,
      cartMergeInProgress: false,
    });

    render(<CartPageContent />);

    const giftWrap = screen.getByTestId('cart-gift-wrap');
    expect(within(giftWrap).getByRole('checkbox')).toBeChecked();
    expect(screen.queryByText('Gift Wrap')).not.toBeInTheDocument();

    fireEvent.click(within(giftWrap).getByRole('checkbox'));

    await waitFor(() => {
      expect(removeItem).toHaveBeenCalledWith('wrap-line');
    });
  });

  it('opens address sheet from mobile address bar', () => {
    render(<CartPageContent />);

    const addButtons = screen.getAllByRole('button', { name: cartMessages.addAddress });
    fireEvent.click(addButtons[0]!);
    expect(screen.getByText(cartMessages.selectAddress)).toBeInTheDocument();
  });

  it('triggers checkout when sticky footer CTA is clicked', async () => {
    const mockPrepareCheckout = jest.fn().mockResolvedValue({
      isValid: true,
      cartId: 'gid://shopify/Cart/cart-1',
      preCheckout: { is_valid: true, cart_id: 'cart-1', items: [] },
      cart: { ...cartWithItems, checkoutUrl: 'https://palmonas.myshopify.com/cart/c/abc' },
    });
    mockUseCart.mockReturnValue({
      cart: cartWithItems,
      loading: false,
      isFetching: false,
      isEmpty: false,
      showEmpty: false,
      isMutating: false,
      summary: {
        subtotal: 100,
        total: 100,
        tax: 0,
        shipping: 0,
        discount: 0,
        itemCount: 1,
      },
      actions: {
        prepareCheckout: mockPrepareCheckout,
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        refreshCartSilent: mockRefreshCartSilent,
      },
      updatingLineId: null,
      removingLineId: null,
    });

    render(<CartPageContent />);

    const footer = screen.getByTestId('cart-mobile-sticky-footer');
    fireEvent.click(within(footer).getByRole('button', { name: cartMessages.continueToCheckout }));

    await waitFor(() => {
      expect(mockPrepareCheckout).toHaveBeenCalled();
      expect(mockGuard).not.toHaveBeenCalled();
      expect(checkoutProvider.openCheckout).toHaveBeenCalledWith({
        cartId: 'gid://shopify/Cart/cart-1',
        source: 'cart',
        checkoutUrl: 'https://palmonas.myshopify.com/cart/c/abc',
      });
    });
  });

  it('shows toast when checkout validation fails', async () => {
    const mockShowWarning = jest.fn();
    jest.requireMock('@/hooks/useToast').useToast = () => ({
      showWarning: mockShowWarning,
      showError: jest.fn(),
      showSuccess: jest.fn(),
    });
    const mockPrepareCheckout = jest.fn().mockResolvedValue({
      isValid: false,
      cartId: 'gid://shopify/Cart/cart-1',
      preCheckout: { is_valid: false, cart_id: 'cart-1', items: [] },
    });
    mockUseCart.mockReturnValue({
      cart: cartWithItems,
      loading: false,
      isFetching: false,
      isEmpty: false,
      showEmpty: false,
      isMutating: false,
      summary: {
        subtotal: 100,
        total: 100,
        tax: 0,
        shipping: 0,
        discount: 0,
        itemCount: 1,
      },
      actions: {
        prepareCheckout: mockPrepareCheckout,
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        refreshCartSilent: mockRefreshCartSilent,
      },
      updatingLineId: null,
      removingLineId: null,
    });

    render(<CartPageContent />);

    const footer = screen.getByTestId('cart-mobile-sticky-footer');
    fireEvent.click(within(footer).getByRole('button', { name: cartMessages.continueToCheckout }));

    await waitFor(() => {
      expect(mockShowWarning).toHaveBeenCalledWith(cartMessages.validation.outOfStock);
    });
  });

  it('shows generic checkout error for non-Error throws', async () => {
    const mockShowError = jest.fn();
    jest.requireMock('@/hooks/useToast').useToast = () => ({
      showWarning: jest.fn(),
      showError: mockShowError,
      showSuccess: jest.fn(),
    });
    const mockPrepareCheckout = jest.fn().mockRejectedValue('checkout failed');
    mockUseCart.mockReturnValue({
      cart: cartWithItems,
      loading: false,
      isFetching: false,
      isEmpty: false,
      showEmpty: false,
      isMutating: false,
      summary: {
        subtotal: 100,
        total: 100,
        tax: 0,
        shipping: 0,
        discount: 0,
        itemCount: 1,
      },
      actions: {
        prepareCheckout: mockPrepareCheckout,
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        refreshCartSilent: mockRefreshCartSilent,
      },
      updatingLineId: null,
      removingLineId: null,
    });

    render(<CartPageContent />);

    const footer = screen.getByTestId('cart-mobile-sticky-footer');
    fireEvent.click(within(footer).getByRole('button', { name: cartMessages.continueToCheckout }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(cartMessages.errors.checkout);
    });
  });

  it('renders empty state when showEmpty is true', () => {
    mockUseCart.mockReturnValue({
      cart: null,
      loading: false,
      isFetching: false,
      isEmpty: true,
      showEmpty: true,
      isMutating: false,
      summary: { subtotal: 0, total: 0, tax: 0, shipping: 0, discount: 0, itemCount: 0 },
      actions: { refreshCartSilent: mockRefreshCartSilent },
      updatingLineId: null,
      removingLineId: null,
    });

    render(<CartPageContent />);

    expect(screen.getByText(cartMessages.emptyTitle)).toBeInTheDocument();
    expect(screen.getByTestId('cart-header')).toBeInTheDocument();
  });

  it('adds to wishlist before removing cart line on move to wishlist', async () => {
    const order: string[] = [];
    const applyClubbedCartMutations = jest.fn().mockImplementation(async () => {
      order.push('remove');
    });
    const mutateAsync = jest.fn().mockImplementation(async () => {
      order.push('wishlist');
    });
    useAddWishlistItemMutation.mockReturnValue({ mutateAsync, isPending: false });
    mockUseCart.mockReturnValue({
      cart: cartWithItems,
      loading: false,
      isFetching: false,
      isEmpty: false,
      showEmpty: false,
      isMutating: false,
      discounts: null,
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      summary: {
        subtotal: 100,
        total: 100,
        tax: 0,
        shipping: 0,
        discount: 0,
        itemCount: 1,
      },
      actions: {
        prepareCheckout: jest.fn(),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        refreshCartSilent: mockRefreshCartSilent,
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
        applyClubbedCartMutations,
      },
      updatingLineId: null,
      removingLineId: null,
      cartMergeInProgress: false,
    });

    render(<CartPageContent />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.removeItem }));
    fireEvent.click(screen.getByRole('button', { name: cartMessages.removeConfirm.moveToWishlist }));

    await waitFor(() => {
      expect(order).toEqual(['wishlist', 'remove']);
      expect(toastMock.showSuccess).toHaveBeenCalledWith(cartMessages.toasts.moveToWishlist);
    });
  });

  it('keeps cart line when wishlist login is cancelled', async () => {
    const applyClubbedCartMutations = jest.fn();
    const mutateAsync = jest.fn();
    mockGuardApi.mockRejectedValueOnce(new LoginCancelledError());
    useAddWishlistItemMutation.mockReturnValue({ mutateAsync, isPending: false });
    mockUseCart.mockReturnValue({
      cart: cartWithItems,
      loading: false,
      isFetching: false,
      isEmpty: false,
      showEmpty: false,
      isMutating: false,
      discounts: null,
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      summary: {
        subtotal: 100,
        total: 100,
        tax: 0,
        shipping: 0,
        discount: 0,
        itemCount: 1,
      },
      actions: {
        prepareCheckout: jest.fn(),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        refreshCartSilent: mockRefreshCartSilent,
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
        applyClubbedCartMutations,
      },
      updatingLineId: null,
      removingLineId: null,
      cartMergeInProgress: false,
    });

    render(<CartPageContent />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.removeItem }));
    fireEvent.click(screen.getByRole('button', { name: cartMessages.removeConfirm.moveToWishlist }));

    await waitFor(() => {
      expect(mockGuardApi).toHaveBeenCalled();
    });
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(applyClubbedCartMutations).not.toHaveBeenCalled();
    expect(toastMock.showError).not.toHaveBeenCalled();
    expect(toastMock.showSuccess).not.toHaveBeenCalled();
    expect(screen.getByText(cartMessages.removeConfirm.title)).toBeInTheDocument();
    await waitFor(() => {
      const wishlistButton = screen.getByRole('button', {
        name: cartMessages.removeConfirm.moveToWishlist,
      });
      expect(wishlistButton).not.toBeDisabled();
      expect(wishlistButton).not.toHaveAttribute('aria-busy', 'true');
    });
    expect(screen.getByText(cartMessages.removeConfirm.moveToWishlist)).toBeInTheDocument();
  });
});
