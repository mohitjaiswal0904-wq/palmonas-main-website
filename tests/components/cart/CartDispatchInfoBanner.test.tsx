import { render, screen } from '@testing-library/react';

import { CartDispatchInfoBanner } from '@/components/cart/CartDispatchInfoBanner';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';

describe('CartDispatchInfoBanner', () => {
  it('renders dispatch and free shipping copy from config', () => {
    render(<CartDispatchInfoBanner />);

    expect(screen.getByTestId('cart-dispatch-info-banner')).toBeInTheDocument();
    expect(screen.getByText(cartMessages.dispatchInfoTitle)).toBeInTheDocument();
    expect(screen.getByText(cartMessages.dispatchInfoSubtitle)).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: cartMessages.a11y.dispatchInfo }),
    ).toHaveStyle({
      backgroundColor: cartTheme.dispatchBannerBg,
      borderColor: cartTheme.dispatchBannerBorder,
    });
  });

  it('renders a truck mark with three stroked paths', () => {
    const { container } = render(<CartDispatchInfoBanner />);
    const paths = container.querySelectorAll('svg path');

    expect(paths).toHaveLength(3);
    paths.forEach((path) => {
      expect(path).toHaveAttribute('stroke-width', '1.25');
    });
  });
});
