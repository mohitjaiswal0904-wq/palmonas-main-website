import { render, screen } from '@testing-library/react';

import {
  CartRouteChromeGate,
  shouldHideSiteChromeBelowLaptop,
} from '@/components/layout/CartRouteChromeGate';

const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('shouldHideSiteChromeBelowLaptop', () => {
  it('hides chrome on cart and account shell routes', () => {
    expect(shouldHideSiteChromeBelowLaptop('/cart')).toBe(true);
    expect(shouldHideSiteChromeBelowLaptop('/cart/offers')).toBe(true);
    expect(shouldHideSiteChromeBelowLaptop('/account')).toBe(true);
    expect(shouldHideSiteChromeBelowLaptop('/account/wallet')).toBe(true);
  });

  it('keeps chrome on account login/register and other routes', () => {
    expect(shouldHideSiteChromeBelowLaptop('/account/login')).toBe(false);
    expect(shouldHideSiteChromeBelowLaptop('/account/register')).toBe(false);
    expect(shouldHideSiteChromeBelowLaptop('/products/ring')).toBe(false);
    expect(shouldHideSiteChromeBelowLaptop('/')).toBe(false);
  });
});

describe('CartRouteChromeGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hides site chrome below laptop on /cart', () => {
    mockUsePathname.mockReturnValue('/cart');

    render(
      <CartRouteChromeGate>
        <header>Site header</header>
      </CartRouteChromeGate>,
    );

    const gate = screen.getByTestId('cart-route-chrome-gate');
    expect(gate).toHaveClass('hidden', 'laptop:block');
    expect(gate).toHaveAttribute('data-cart-route', 'true');
    expect(screen.getByText('Site header')).toBeInTheDocument();
  });

  it('hides site chrome below laptop on /account', () => {
    mockUsePathname.mockReturnValue('/account');

    render(
      <CartRouteChromeGate>
        <header>Site header</header>
      </CartRouteChromeGate>,
    );

    expect(screen.getByTestId('cart-route-chrome-gate')).toHaveClass('hidden', 'laptop:block');
  });

  it('does not hide chrome on product routes', () => {
    mockUsePathname.mockReturnValue('/products/lunar-flow');

    render(
      <CartRouteChromeGate>
        <header>Site header</header>
      </CartRouteChromeGate>,
    );

    const gate = screen.getByTestId('cart-route-chrome-gate');
    expect(gate).toHaveClass('contents');
    expect(gate).not.toHaveClass('hidden');
    expect(gate).not.toHaveAttribute('data-cart-route');
  });

  it('does not hide chrome on home', () => {
    mockUsePathname.mockReturnValue('/');

    render(
      <CartRouteChromeGate>
        <header>Site header</header>
      </CartRouteChromeGate>,
    );

    expect(screen.getByTestId('cart-route-chrome-gate')).toHaveClass('contents');
    expect(screen.getByTestId('cart-route-chrome-gate')).not.toHaveClass('hidden');
  });
});
