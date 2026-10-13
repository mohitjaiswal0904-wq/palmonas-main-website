import { fireEvent, render, screen } from '@testing-library/react';

import { AppLink } from '@/components/navigation/AppLink';

const mockStartNavigation = jest.fn();

jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({
      href,
      children,
      onClick,
      ...rest
    }: {
      href: string;
      children?: React.ReactNode;
      onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a href={typeof href === 'string' ? href : '#'} onClick={onClick} {...rest}>
        {children}
      </a>
    ),
  };
});

jest.mock('@/providers/navigation/NavigationPendingProvider', () => ({
  useNavigationPending: () => ({
    pendingHref: null,
    startNavigation: mockStartNavigation,
    clearNavigation: jest.fn(),
  }),
}));

describe('AppLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls startNavigation on unmodified click', () => {
    render(
      <AppLink href="/products/demo">
        Product
      </AppLink>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Product' }));

    expect(mockStartNavigation).toHaveBeenCalledWith('/products/demo');
  });

  it('skips startNavigation for modified clicks', () => {
    render(
      <AppLink href="/products/demo">
        Product
      </AppLink>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Product' }), { metaKey: true });

    expect(mockStartNavigation).not.toHaveBeenCalled();
  });

  it('skips startNavigation for target blank', () => {
    render(
      <AppLink href="/products/demo" target="_blank">
        Product
      </AppLink>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Product' }));

    expect(mockStartNavigation).not.toHaveBeenCalled();
  });

  it('still forwards onClick handlers', () => {
    const onClick = jest.fn();
    render(
      <AppLink href="/cart" onClick={onClick}>
        Cart
      </AppLink>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Cart' }));

    expect(onClick).toHaveBeenCalled();
    expect(mockStartNavigation).toHaveBeenCalledWith('/cart');
  });
});
