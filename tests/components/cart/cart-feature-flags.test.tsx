import { fireEvent, render, screen } from '@testing-library/react';

import { CartCouponSection } from '@/components/cart/CartCouponSection';
import { CartGiftCardSection } from '@/components/cart/CartGiftCardSection';
import { CartGiftWrapOption } from '@/components/cart/CartGiftWrapOption';
import { CartWalletToggleRow } from '@/components/cart/CartWalletToggleRow';
import { CartBundleDealCard, CartBundleDealChip, CartFreeGiftCard, CartFreeGiftChip } from '@/components/cart/cart-offer-banners';
import { cartMessages } from '@/config/cart/cart.config';

jest.mock('@/config/cart/cart.config', () => ({
  ...jest.requireActual('@/config/cart/cart.config'),
  isCartFeatureEnabled: jest.fn(),
}));

const mockUseAuth = jest.fn(() => ({ isAuthenticated: true }));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    discounts: {
      availableDiscounts: [
        {
          offerType: 'store_offer',
          discountCode: 'SAVE10',
          discountDetail: 'Buy 3 at ₹3999',
          amountSaved: 100,
        },
      ],
      unavailableDiscounts: [],
      appliedCode: null,
      appliedAmountSaved: 0,
      payableAfterDiscount: null,
    },
    discountsLoading: false,
    discountsError: null,
    isDiscountMutating: false,
    actions: {
      applyDiscount: jest.fn(),
      removeDiscount: jest.fn(),
    },
  }),
}));

const { isCartFeatureEnabled } = jest.requireMock('@/config/cart/cart.config') as {
  isCartFeatureEnabled: jest.Mock;
};

describe('cart feature flags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isCartFeatureEnabled.mockReturnValue(false);
  });

  it('hides coupon section when offers feature is disabled', () => {
    const { container } = render(<CartCouponSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders coupon section when offers feature is enabled', () => {
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'offers');
    render(<CartCouponSection />);
    expect(screen.getByTestId('cart-coupon-section')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: cartMessages.offersAndCoupons })).toBeInTheDocument();
    expect(screen.queryByTestId('cart-see-all-coupons')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-have-a-code')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(cartMessages.couponPlaceholder)).not.toBeInTheDocument();
  });

  it('hides wallet toggle when wallet feature is disabled', () => {
    const { container } = render(
      <CartWalletToggleRow applied={false} onChange={jest.fn()} balance={100} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('hides wallet toggle for guest users when wallet feature is enabled', () => {
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'wallet');
    mockUseAuth.mockReturnValueOnce({ isAuthenticated: false });

    const { container } = render(
      <CartWalletToggleRow applied={false} onChange={jest.fn()} balance={100} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('hides bundle deal banner when bundle feature is disabled', () => {
    const { container } = render(<CartBundleDealCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it('hides free gift banner when free gift feature is disabled', () => {
    const { container } = render(<CartFreeGiftCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it('hides free gift chip when free gift feature is disabled', () => {
    const { container } = render(<CartFreeGiftChip />);
    expect(container).toBeEmptyDOMElement();
  });

  it('hides bundle deal chip when bundle feature is disabled', () => {
    const { container } = render(<CartBundleDealChip />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders gift card section when giftCard feature is enabled', () => {
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'giftCard');
    render(<CartGiftCardSection />);

    expect(screen.getByText(cartMessages.giftCard)).toBeInTheDocument();
    expect(screen.getByTestId('cart-see-all-gift-cards')).toHaveAttribute('href', '/cart/gift-cards');
    expect(screen.getByText(cartMessages.giftCardApplied)).toBeInTheDocument();
  });

  it('renders gift wrap option when giftWrap feature is enabled', () => {
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'giftWrap');
    const onChange = jest.fn();

    render(<CartGiftWrapOption checked={false} onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox');
    expect(screen.getByTestId('cart-gift-wrap')).toBeInTheDocument();
    expect(screen.getByText(cartMessages.giftWrapLabel)).toBeInTheDocument();

    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders coupon input details when offers feature is enabled', () => {
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'offers');
    render(<CartCouponSection />);

    expect(
      screen.getByRole('heading', { name: cartMessages.offersAndCoupons }),
    ).toBeInTheDocument();
    expect(screen.getByText('SAVE10')).toBeInTheDocument();
    expect(screen.getByText('Buy 3 at ₹3999')).toBeInTheDocument();
    expect(screen.queryByTestId('cart-see-all-coupons')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-have-a-code')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(cartMessages.couponPlaceholder)).not.toBeInTheDocument();
  });
});
