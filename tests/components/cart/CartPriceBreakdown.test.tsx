import { render, screen } from '@testing-library/react';

import { CartPriceBreakdown } from '@/components/cart/CartPriceBreakdown';
import { cartMessages } from '@/config/cart/cart.config';
import { userMessages } from '@/config/user/user.config';
import type { CartSummary } from '@/types/cart';

const baseSummary: CartSummary = {
  subtotal: 1000,
  total: 1000,
  tax: 0,
  shipping: 0,
  discount: 0,
  totalItems: 1,
  totalMrp: 1000,
  mrpDiscount: 0,
  sellingPrice: 1000,
  couponDiscount: 0,
  payableTotal: 1000,
};

describe('CartPriceBreakdown', () => {
  it('renders only subtotal, shipping, savings, and estimated total', () => {
    render(<CartPriceBreakdown summary={baseSummary} />);

    expect(screen.getByTestId('cart-price-breakdown')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: cartMessages.orderSummary })).toBeInTheDocument();
    expect(screen.getByText(cartMessages.sellingPrice)).toBeInTheDocument();
    expect(screen.getByTestId('cart-selling-price')).toHaveTextContent('₹1,000');
    expect(screen.getByText(cartMessages.delivery)).toBeInTheDocument();
    expect(screen.getByText(cartMessages.free)).toBeInTheDocument();
    expect(screen.getByTestId('cart-total-savings')).toHaveTextContent('₹0');
    expect(screen.getByText(cartMessages.totalPayable)).toBeInTheDocument();
    expect(screen.getByTestId('cart-payable-total')).toHaveTextContent('₹1,000');
    expect(screen.queryByText(cartMessages.mrp)).not.toBeInTheDocument();
    expect(screen.queryByText(cartMessages.mrpDiscount)).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-prepaid-discount')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-coupon-discount')).not.toBeInTheDocument();
  });

  it('uses payableTotal prop plus gift wrap for the final row', () => {
    render(<CartPriceBreakdown summary={baseSummary} payableTotal={850} giftWrapTotal={50} />);

    expect(screen.getByTestId('cart-payable-total')).toHaveTextContent('₹900');
    expect(screen.queryByTestId('cart-gift-wrap-total')).not.toBeInTheDocument();
  });

  it('does not show wallet or gift wrap rows', () => {
    render(
      <CartPriceBreakdown
        summary={baseSummary}
        giftWrapTotal={50}
        walletToggled
        walletApplied={200}
        walletLoading={false}
      />,
    );

    expect(screen.queryByText(userMessages.walletLabel)).not.toBeInTheDocument();
    expect(screen.queryByText('−₹200')).not.toBeInTheDocument();
  });

  it('does not show a wallet loading skeleton', () => {
    const { container } = render(
      <CartPriceBreakdown summary={baseSummary} walletToggled walletLoading />,
    );

    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument();
  });

  it('shows a Coupon row from coupon_discount', () => {
    render(
      <CartPriceBreakdown
        summary={{
          ...baseSummary,
          couponDiscount: 100,
          sellingPrice: 1000,
          payableTotal: 900,
          total: 900,
        }}
        couponCode="MONSOON3"
      />,
    );

    expect(screen.getByTestId('cart-coupon-discount')).toHaveTextContent(cartMessages.couponDiscount);
    expect(screen.getByText('−₹100')).toBeInTheDocument();
    expect(screen.queryByText(/MONSOON3/i)).not.toBeInTheDocument();
  });

  it('shows selling price, coupon, and payable from API fields without MRP rows', () => {
    render(
      <CartPriceBreakdown
        summary={{
          ...baseSummary,
          totalMrp: 61671,
          mrpDiscount: 21179,
          sellingPrice: 40492,
          couponDiscount: 21179,
          payableTotal: 19313,
          total: 19313,
        }}
        couponCode="bling40"
      />,
    );

    expect(screen.queryByText(cartMessages.mrp)).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-mrp-discount')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-selling-price')).toHaveTextContent('₹40,492');
    expect(screen.getByTestId('cart-coupon-discount')).toHaveTextContent('−₹21,179');
    expect(screen.getByTestId('cart-payable-total')).toHaveTextContent('₹19,313');
  });

  it('hides the coupon row when coupon_discount is zero', () => {
    render(
      <CartPriceBreakdown
        summary={{
          ...baseSummary,
          totalMrp: 1000,
          mrpDiscount: 50,
          sellingPrice: 950,
          couponDiscount: 0,
          payableTotal: 950,
          total: 950,
        }}
      />,
    );

    expect(screen.queryByTestId('cart-coupon-discount')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-mrp-discount')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-total-savings')).toHaveTextContent('₹50');
  });

  it('adds coupon savings into total savings', () => {
    render(
      <CartPriceBreakdown
        summary={{
          ...baseSummary,
          mrpDiscount: 50,
          couponDiscount: 100,
          sellingPrice: 850,
          payableTotal: 850,
        }}
      />,
    );

    expect(screen.getByTestId('cart-total-savings')).toHaveTextContent('₹150');
  });
});
