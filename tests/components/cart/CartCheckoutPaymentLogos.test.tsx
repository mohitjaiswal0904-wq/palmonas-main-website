import { render, screen } from '@testing-library/react';

import { CartCheckoutPaymentLogos } from '@/components/cart/CartCheckoutPaymentLogos';
import { cartCheckoutPaymentLogos } from '@/config/cart/cart.config';

describe('CartCheckoutPaymentLogos', () => {
  it('renders Paytm, PhonePe, and GPay badge assets from config', () => {
    render(<CartCheckoutPaymentLogos />);

    const logos = screen.getByTestId('cart-checkout-payment-logos');
    expect(logos).toHaveAttribute('aria-hidden', 'true');

    const images = logos.querySelectorAll('img');
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('src', cartCheckoutPaymentLogos.paytm);
    expect(images[1]).toHaveAttribute('src', cartCheckoutPaymentLogos.phonepe);
    expect(images[2]).toHaveAttribute('src', cartCheckoutPaymentLogos.gpay);
  });
});
