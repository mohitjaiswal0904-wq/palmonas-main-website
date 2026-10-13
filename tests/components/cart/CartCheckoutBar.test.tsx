import { render, screen } from '@testing-library/react';

import { CartCheckoutBar } from '@/components/cart/CartCheckoutBar';
import { cartMessages } from '@/config/cart/cart.config';

describe('CartCheckoutBar', () => {
  it('omits price from mobile CTA label by default', () => {
    render(<CartCheckoutBar total={1999} onCheckout={jest.fn()} />);

    const button = screen.getByRole('button', { name: cartMessages.continueToCheckout });
    expect(button).not.toHaveTextContent('₹');
    expect(screen.getByTestId('cart-checkout-payment-logos')).toBeInTheDocument();
  });

  it('includes price when showPrice is true', () => {
    render(<CartCheckoutBar total={1999} onCheckout={jest.fn()} showPrice />);

    expect(screen.getByRole('button')).toHaveTextContent('₹1,999');
  });

  it('renders embedded variant without sticky footer padding', () => {
    const { container } = render(
      <CartCheckoutBar total={1999} onCheckout={jest.fn()} variant="embedded" />,
    );

    expect(container.firstChild).not.toHaveClass('border-t');
  });
});
