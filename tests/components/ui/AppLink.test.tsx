import { fireEvent, render, screen } from '@testing-library/react';

import { AppLink } from '@/components/ui/AppLink';

const mockStartNavigation = jest.fn();
const mockPrefetch = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ prefetch: mockPrefetch }),
}));

jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({
      href,
      children,
      onClick,
      prefetch,
      ...rest
    }: {
      href: string;
      children?: React.ReactNode;
      onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
      prefetch?: boolean;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        href={typeof href === 'string' ? href : '#'}
        onClick={onClick}
        data-prefetch={prefetch === undefined ? undefined : String(prefetch)}
        {...rest}
      >
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

  it('renders an anchor for the given href', () => {
    render(<AppLink href="/cart">Cart</AppLink>);

    expect(screen.getByRole('link', { name: 'Cart' })).toHaveAttribute('href', '/cart');
  });

  it('defaults prefetch off to avoid RSC prefetch storms', () => {
    render(<AppLink href="/collections/rings">Rings</AppLink>);

    expect(screen.getByRole('link', { name: 'Rings' })).toHaveAttribute('data-prefetch', 'false');
  });

  it('calls startNavigation on unmodified click', () => {
    render(<AppLink href="/products/demo">Product</AppLink>);

    fireEvent.click(screen.getByRole('link', { name: 'Product' }));

    expect(mockStartNavigation).toHaveBeenCalledWith('/products/demo');
  });

  it('skips startNavigation for modified clicks', () => {
    render(<AppLink href="/products/demo">Product</AppLink>);

    fireEvent.click(screen.getByRole('link', { name: 'Product' }), { metaKey: true });

    expect(mockStartNavigation).not.toHaveBeenCalled();
  });

  it('skips startNavigation for static routes like about', () => {
    render(<AppLink href="/about">About</AppLink>);

    fireEvent.click(screen.getByRole('link', { name: 'About' }));

    expect(mockStartNavigation).not.toHaveBeenCalled();
  });

  it('prefetches the destination on pointer down', () => {
    render(<AppLink href="/products/demo">Product</AppLink>);

    fireEvent.pointerDown(screen.getByRole('link', { name: 'Product' }));

    expect(mockPrefetch).toHaveBeenCalledWith('/products/demo');
  });
});
