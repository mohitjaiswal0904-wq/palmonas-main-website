import { fireEvent, render, screen } from '@testing-library/react';

import { CartAppliedOfferCard } from '@/components/cart/CartAppliedOfferCard';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';

describe('CartAppliedOfferCard', () => {
  it('uses the same ticket row as available offers', () => {
    render(
      <CartAppliedOfferCard
        code="stack2"
        detail="Get any 2 for ₹1899"
        savingAmount="₹99"
      />,
    );

    const card = screen.getByTestId('cart-offer-row-applied');
    expect(card).toHaveClass('h-11', 'rounded-xl', 'border-dashed');
    expect(card).toHaveStyle({ borderColor: cartTheme.couponTicketBorderAvailable });
    expect(screen.getByTestId('coupon-ticket-stub')).toHaveAttribute('data-variant', 'notch');
    expect(screen.getByText(cartMessages.appliedStub)).toBeInTheDocument();
    expect(screen.getByText('STACK2')).toBeInTheDocument();
    expect(screen.getByText('Get any 2 for ₹1899')).toBeInTheDocument();
    expect(screen.getByTestId('cart-coupon-saving-amount')).toHaveTextContent('−₹99');
    expect(screen.getByTestId('cart-coupon-saving')).toHaveTextContent(cartMessages.savedLabel);
  });

  it('places Remove on the ticket and has no Change action', () => {
    const onRemove = jest.fn();
    render(<CartAppliedOfferCard code="SAVE10" onRemove={onRemove} />);

    expect(screen.getByText(cartMessages.applied)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.removeCoupon }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(cartMessages.changeOffer)).not.toBeInTheDocument();
  });
});
