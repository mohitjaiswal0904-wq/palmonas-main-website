/** @jest-environment jsdom */

const mockIsCheckoutEnabled = jest.fn();
const mockGetCheckoutProvider = jest.fn();
const mockIsShopifyCheckoutFallbackEnabled = jest.fn();
const mockGokwikOpenCheckout = jest.fn();
const mockOpenShopifyCheckout = jest.fn();

jest.mock('@/config/cart/cart.config', () => ({
  cartMessages: {
    checkout: {
      comingSoon: 'Checkout is coming soon.',
      buyNowComingSoon: 'Buy Now checkout is coming soon.',
    },
    toasts: {
      openingShopifyCheckout: 'Opening secure checkout…',
    },
    errors: {
      checkoutSdkNotReady: 'Checkout is temporarily unavailable. Please refresh and try again.',
      checkoutUrlMissing: 'Checkout is temporarily unavailable. Please refresh and try again.',
    },
  },
  isCheckoutEnabled: (...args: unknown[]) => mockIsCheckoutEnabled(...args),
  getCheckoutProvider: (...args: unknown[]) => mockGetCheckoutProvider(...args),
  isShopifyCheckoutFallbackEnabled: (...args: unknown[]) =>
    mockIsShopifyCheckoutFallbackEnabled(...args),
  getCheckoutUtmParams: (overrides?: Record<string, string>) => ({
    utm_medium: 'web',
    utm_campaign: 'web_checkout',
    ...overrides,
    utm_source: 'new_website',
  }),
}));

jest.mock('@/infrastructure/checkout/shopify-checkout', () => ({
  openShopifyCheckout: (...args: unknown[]) => mockOpenShopifyCheckout(...args),
  assertSafeShopifyCheckoutUrl: jest.fn(),
  withCheckoutUtmParams: jest.fn(),
}));

jest.mock('@/infrastructure/gokwik/checkout', () => ({
  gokwikCheckoutAdapter: {
    openCheckout: (...args: unknown[]) => mockGokwikOpenCheckout(...args),
  },
  assignGokwikCheckoutCart: jest.fn(),
  ensureGokwikCheckoutReady: jest.fn(),
  isGokwikCheckoutReady: jest.fn(),
  loadGokwikCheckoutScript: jest.fn(),
  waitForGokwikCheckoutSdk: jest.fn(),
  applyCheckoutMerchantInfo: jest.fn(),
  buildCheckoutMerchantInfo: jest.fn(),
  getCheckoutMerchantInfoInlineScript: jest.fn(),
  getGokwikCheckoutScriptUrl: jest.fn(),
}));

jest.mock('@/infrastructure/gokwik/GokwikCheckout', () => ({
  GokwikCheckout: () => null,
}));

jest.mock('@/infrastructure/gokwik/GokwikCheckoutEvents', () => ({
  GokwikCheckoutEvents: () => null,
}));

jest.mock('@/infrastructure/gokwik/checkout-identity', () => ({
  clearGokwikCheckoutIdentity: jest.fn(),
  normalizePhoneForGokwikCheckout: jest.fn(),
  syncGokwikCheckoutIdentity: jest.fn(),
}));

describe('checkout facade router', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockIsCheckoutEnabled.mockReturnValue(true);
    mockGetCheckoutProvider.mockReturnValue('gokwik');
    mockIsShopifyCheckoutFallbackEnabled.mockReturnValue(false);
    mockGokwikOpenCheckout.mockResolvedValue(undefined);
    mockOpenShopifyCheckout.mockResolvedValue(undefined);
  });

  it('shows coming soon toast when checkout disabled', async () => {
    mockIsCheckoutEnabled.mockReturnValue(false);
    const { checkoutProvider, registerCheckoutToast } = await import('@/infrastructure/checkout');
    const showToast = jest.fn();
    registerCheckoutToast(showToast);

    await checkoutProvider.openCheckout({ cartId: 'cart-1', source: 'cart' });

    expect(showToast).toHaveBeenCalledWith('Checkout is coming soon.');
    expect(mockGokwikOpenCheckout).not.toHaveBeenCalled();
    expect(mockOpenShopifyCheckout).not.toHaveBeenCalled();
  });

  it('delegates to GoKwik when provider is gokwik', async () => {
    const { checkoutProvider } = await import('@/infrastructure/checkout');

    await checkoutProvider.openCheckout({
      cartId: 'cart-1',
      source: 'cart',
      checkoutUrl: 'https://palmonas.myshopify.com/cart/c/abc',
    });

    expect(mockGokwikOpenCheckout).toHaveBeenCalled();
    expect(mockOpenShopifyCheckout).not.toHaveBeenCalled();
  });

  it('does not redirect when GoKwik fails and shopifyFallback is false', async () => {
    mockGokwikOpenCheckout.mockRejectedValue(new Error('Checkout is temporarily unavailable.'));
    const { checkoutProvider, registerCheckoutToast } = await import('@/infrastructure/checkout');
    const showToast = jest.fn();
    registerCheckoutToast(showToast);

    await expect(
      checkoutProvider.openCheckout({
        cartId: 'cart-1',
        source: 'cart',
        checkoutUrl: 'https://palmonas.myshopify.com/cart/c/abc',
      }),
    ).rejects.toThrow('Checkout is temporarily unavailable.');

    expect(mockOpenShopifyCheckout).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('Checkout is temporarily unavailable.');
  });

  it('redirects to Shopify when GoKwik fails and shopifyFallback is true', async () => {
    mockIsShopifyCheckoutFallbackEnabled.mockReturnValue(true);
    mockGokwikOpenCheckout.mockRejectedValue(new Error('Checkout is temporarily unavailable.'));
    const { checkoutProvider } = await import('@/infrastructure/checkout');

    await checkoutProvider.openCheckout({
      cartId: 'cart-1',
      source: 'cart',
      checkoutUrl: 'https://palmonas.myshopify.com/cart/c/abc',
      utmParams: { utm_source: 'new_website' },
    });

    expect(mockOpenShopifyCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        checkoutUrl: 'https://palmonas.myshopify.com/cart/c/abc',
      }),
      expect.objectContaining({ onToast: expect.any(Function) }),
    );
  });

  it('skips GoKwik when provider is shopify', async () => {
    mockGetCheckoutProvider.mockReturnValue('shopify');
    const { checkoutProvider } = await import('@/infrastructure/checkout');

    await checkoutProvider.openCheckout({
      cartId: 'cart-1',
      source: 'cart',
      checkoutUrl: 'https://palmonas.myshopify.com/cart/c/abc',
    });

    expect(mockGokwikOpenCheckout).not.toHaveBeenCalled();
    expect(mockOpenShopifyCheckout).toHaveBeenCalled();
  });

  it('toasts and throws when provider is shopify but checkoutUrl missing', async () => {
    mockGetCheckoutProvider.mockReturnValue('shopify');
    mockOpenShopifyCheckout.mockRejectedValue(
      new Error('Checkout is temporarily unavailable. Please refresh and try again.'),
    );
    const { checkoutProvider, registerCheckoutToast } = await import('@/infrastructure/checkout');
    const showToast = jest.fn();
    registerCheckoutToast(showToast);

    await expect(
      checkoutProvider.openCheckout({ cartId: 'cart-1', source: 'cart' }),
    ).rejects.toThrow();

    expect(showToast).toHaveBeenCalled();
  });
});
