import { render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { BottomNavCartTab } from '@/components/layout/BottomNavCartTab';
import { cartMessages } from '@/config/cart/cart.config';

jest.mock('@/hooks/cart/useCartStats', () => ({
  useCartStats: () => ({
    cartCount: 2,
    cartCountHydrated: true,
  }),
}));

jest.mock('@/hooks/useAfterHydration', () => ({
  useAfterHydration: () => true,
}));

jest.mock('@/components/ui/AppLink', () => ({
  AppLink: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('BottomNavCartTab', () => {
  it('marks the cart tab as a fly fallback target', () => {
    render(<BottomNavCartTab active={false} />);
    expect(screen.getByLabelText(`${cartMessages.a11y.openCart}, 2 items`)).toHaveAttribute(
      'data-cart-fly-target',
      'nav',
    );
  });

  it('keeps the cart href', () => {
    render(<BottomNavCartTab active />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/cart');
  });
});
