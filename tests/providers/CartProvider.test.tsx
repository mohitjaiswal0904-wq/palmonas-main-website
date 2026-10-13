import { render, screen } from '@testing-library/react';

import { CartProvider } from '@/providers/CartProvider';
import { registerCheckoutToast } from '@/infrastructure/checkout';

import { createUseToastMock } from '@tests/test-utils/mock-use-toast';

const toastMock = createUseToastMock();

jest.mock('@/config/cart/cart.config', () => ({
  ...jest.requireActual('@/config/cart/cart.config'),
  isCheckoutEnabled: () => false,
}));

jest.mock('@/providers/cart/CartStatsProvider', () => ({
  CartStatsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: () => toastMock,
}));

jest.mock('@/providers/cart/PostAuthSync', () => ({
  PostAuthSync: () => <div data-testid="post-auth-sync" />,
}));

describe('CartProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children and post-auth sync', () => {
    render(
      <CartProvider>
        <span>child</span>
      </CartProvider>,
    );

    expect(screen.getByText('child')).toBeInTheDocument();
    expect(screen.getByTestId('post-auth-sync')).toBeInTheDocument();
  });

  it('registers checkout toast handler on mount', () => {
    render(
      <CartProvider>
        <span>child</span>
      </CartProvider>,
    );

    registerCheckoutToast((message) => toastMock.showWarning(message));
    expect(toastMock.showWarning).not.toHaveBeenCalled();
  });
});
