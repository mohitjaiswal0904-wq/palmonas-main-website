import { fireEvent, render, screen } from '@testing-library/react';

import { CartMobileStickyFooter } from '@/components/cart/CartMobileStickyFooter';
import { cartMessages } from '@/config/cart/cart.config';

jest.mock('@/components/cart/cart-offer-banners', () => ({
  CartBundleDealCard: () => <div data-testid="cart-bundle-deal-banner" />,
  CartFreeGiftCard: () => <div data-testid="cart-free-gift-banner" />,
}));

const mockResolveStickyOfferType = jest.fn();

jest.mock('@/components/cart/CartCheckoutSidebar', () => ({
  resolveStickyOfferType: () => mockResolveStickyOfferType(),
}));

describe('CartMobileStickyFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveStickyOfferType.mockReturnValue('bundle');
  });

  it('renders bundle banner and checkout CTA', () => {
    render(
      <CartMobileStickyFooter total={100} onCheckout={jest.fn()} />,
    );

    expect(screen.getByTestId('cart-bundle-deal-banner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.continueToCheckout })).toBeInTheDocument();
  });

  it('renders free gift banner when sticky offer type is freeGift', () => {
    mockResolveStickyOfferType.mockReturnValue('freeGift');

    render(
      <CartMobileStickyFooter total={100} onCheckout={jest.fn()} />,
    );

    expect(screen.getByTestId('cart-free-gift-banner')).toBeInTheDocument();
  });

  it('reports footer height to keep Order Summary clear', () => {
    const onHeightChange = jest.fn();

    render(
      <CartMobileStickyFooter total={100} onCheckout={jest.fn()} onHeightChange={onHeightChange} />,
    );

    expect(onHeightChange).toHaveBeenCalled();
  });

  it('calls onCheckout from sticky CTA', () => {
    const onCheckout = jest.fn();

    render(
      <CartMobileStickyFooter total={100} onCheckout={onCheckout} />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.continueToCheckout }));
    expect(onCheckout).toHaveBeenCalled();
  });
});
