import { fireEvent, render, screen } from '@testing-library/react';

import {
  CartCheckoutSidebar,
  CartMobileCheckoutSections,
  resolveStickyOfferType,
} from '@/components/cart/CartCheckoutSidebar';
import { cartMessages } from '@/config/cart/cart.config';
import type { CartSummary } from '@/types/cart';

jest.mock('@/config/cart/cart.config', () => ({
  ...jest.requireActual('@/config/cart/cart.config'),
  isCartFeatureEnabled: jest.fn((feature: string) => {
    const actual = jest.requireActual('@/config/cart/cart.config');
    return actual.isCartFeatureEnabled(feature);
  }),
}));

jest.mock('@/components/cart/CartCouponSection', () => ({
  CartCouponSection: () => <div data-testid="cart-coupon-section" />,
}));

jest.mock('@/components/cart/CartRecommendedSection', () => ({
  CartRecommendedSection: () => <div data-testid="cart-recommended-section" />,
}));

jest.mock('@/components/cart/CartLimitedTimeOffers', () => ({
  CartLimitedTimeOffers: () => <div data-testid="cart-limited-time-offers" />,
}));

jest.mock('@/components/cart/CartGiftCardSection', () => ({
  CartGiftCardSection: () => <div data-testid="cart-gift-card-section" />,
}));

jest.mock('@/components/cart/cart-offer-banners', () => ({
  CartBundleDealCard: () => <div data-testid="cart-bundle-deal-banner" />,
  CartFreeGiftCard: () => <div data-testid="cart-free-gift-banner" />,
}));

jest.mock('@/components/cart/CartCheckoutBar', () => ({
  CartCheckoutBar: ({
    total,
    onCheckout,
  }: {
    total: number;
    onCheckout: () => void;
  }) => (
    <button type="button" data-testid="checkout-cta" data-total={total} onClick={onCheckout}>
      Continue to Checkout
    </button>
  ),
}));

jest.mock('@/components/cart/CartPriceBreakdown', () => ({
  CartPriceBreakdown: () => <div data-testid="cart-price-breakdown" />,
}));

jest.mock('@/components/cart/CartWalletToggleRow', () => ({
  CartWalletToggleRow: ({
    onChange,
    applied,
  }: {
    onChange?: (applied: boolean) => void;
    applied: boolean;
  }) => (
    <div data-testid="cart-wallet-toggle">
      <input
        type="checkbox"
        checked={applied}
        onChange={(e) => onChange?.(e.target.checked)}
        aria-label="wallet"
      />
    </div>
  ),
}));

jest.mock('@/components/cart/CartAddressBar', () => ({
  CartAddressBar: ({ onChange }: { onChange: () => void }) => (
    <button type="button" data-testid="cart-address-bar" onClick={onChange}>
      Address
    </button>
  ),
}));

jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    discounts: {
      availableDiscounts: [],
      unavailableDiscounts: [],
      appliedCode: null,
      appliedAmountSaved: 0,
      payableAfterDiscount: null,
    },
  }),
}));

const { isCartFeatureEnabled } = jest.requireMock('@/config/cart/cart.config') as {
  isCartFeatureEnabled: jest.Mock;
};

const summary: CartSummary = {
  subtotal: 100,
  total: 100,
  tax: 0,
  shipping: 0,
  discount: 0,
  totalItems: 1,
  totalMrp: 100,
  mrpDiscount: 0,
  sellingPrice: 100,
  couponDiscount: 0,
  payableTotal: 100,
};

describe('CartCheckoutSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isCartFeatureEnabled.mockImplementation((feature: string) => {
      const actual = jest.requireActual('@/config/cart/cart.config');
      return actual.isCartFeatureEnabled(feature);
    });
  });

  it('renders sidebar sections and embedded checkout CTA', () => {
    const onCheckout = jest.fn();

    render(
      <CartCheckoutSidebar
        summary={summary}
        onAddressChange={jest.fn()}
        onCheckout={onCheckout}
        walletToggled={false}
        onWalletToggle={jest.fn()}
        checkoutTotal={100}
      />,
    );

    expect(screen.getByTestId('cart-checkout-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('cart-coupon-section')).toBeInTheDocument();
    expect(screen.getByTestId('cart-recommended-section')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: cartMessages.continueToCheckout }));
    expect(onCheckout).toHaveBeenCalled();
  });

  it('hides address bar when address feature is disabled', () => {
    isCartFeatureEnabled.mockImplementation((feature: string) => feature !== 'address');

    render(
      <CartCheckoutSidebar
        summary={summary}
        onAddressChange={jest.fn()}
        onCheckout={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('cart-address-bar')).not.toBeInTheDocument();
  });

  it('renders address bar with selected address when enabled', () => {
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'address');
    const onAddressChange = jest.fn();
    render(
      <CartCheckoutSidebar
        summary={summary}
        selectedAddress={{ name: 'Priya', line: 'Bengaluru' }}
        onAddressChange={onAddressChange}
        onCheckout={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('cart-address-bar'));
    expect(onAddressChange).toHaveBeenCalled();
  });

  it('computes checkout total from payable total and gift wrap when checkoutTotal omitted', () => {
    render(
      <CartCheckoutSidebar
        summary={summary}
        payableTotal={80}
        giftWrapTotal={50}
        onAddressChange={jest.fn()}
        onCheckout={jest.fn()}
      />,
    );

    expect(screen.getByTestId('checkout-cta')).toHaveAttribute('data-total', '130');
  });

  it('uses noop wallet toggle when onWalletToggle is omitted', () => {
    render(
      <CartCheckoutSidebar
        summary={summary}
        onAddressChange={jest.fn()}
        onCheckout={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('wallet'));
    expect(screen.getByLabelText('wallet')).not.toBeChecked();
  });
});

describe('CartMobileCheckoutSections', () => {
  it('wraps recommended and LTO in mobile full-bleed breakout containers', () => {
    render(
      <CartMobileCheckoutSections
        summary={summary}
        walletToggled={false}
        onWalletToggle={jest.fn()}
      />,
    );

    expect(screen.getByTestId('recommended-mobile-breakout')).toHaveClass('-mx-[10px]');
    expect(screen.getByTestId('lto-mobile-breakout')).toHaveClass('-mx-[10px]');
    expect(screen.getByTestId('cart-recommended-section')).toBeInTheDocument();
    expect(screen.getByTestId('cart-limited-time-offers')).toBeInTheDocument();
  });

  it('renders mobile wallet toggle without onWalletToggle', () => {
    render(<CartMobileCheckoutSections summary={summary} />);

    fireEvent.click(screen.getByLabelText('wallet'));
    expect(screen.getByTestId('cart-wallet-toggle')).toBeInTheDocument();
  });
});

describe('resolveStickyOfferType', () => {
  it('returns bundle when bundle deal feature and mock data are enabled', () => {
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'bundleDeal');
    expect(resolveStickyOfferType()).toBe('bundle');
  });

  it('returns freeGift when bundle is disabled but free gift is enabled', () => {
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'freeGift');
    expect(resolveStickyOfferType()).toBe('freeGift');
  });

  it('returns null when neither sticky offer is available', () => {
    isCartFeatureEnabled.mockReturnValue(false);
    expect(resolveStickyOfferType()).toBeNull();
  });
});
