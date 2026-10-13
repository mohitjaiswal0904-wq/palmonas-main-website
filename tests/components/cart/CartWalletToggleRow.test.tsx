import { render, screen } from '@testing-library/react';

import { CartWalletToggleRow } from '@/components/cart/CartWalletToggleRow';
import { cartMessages } from '@/config/cart/cart.config';

const mockUseAuth = jest.fn(() => ({ isAuthenticated: true }));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('CartWalletToggleRow', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
  });
  it('calls onChange when checkbox is toggled', () => {
    const onChange = jest.fn();
    render(<CartWalletToggleRow applied={false} onChange={onChange} balance={700} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    checkbox.click();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows wallet balance label with Figma styles', () => {
    render(<CartWalletToggleRow applied={false} onChange={jest.fn()} balance={700} />);

    const toggle = screen.getByTestId('cart-wallet-toggle');
    expect(toggle).toHaveClass('border-y', 'py-5');
    expect(screen.getByText(new RegExp(cartMessages.walletBalance))).toHaveClass(
      'text-sm',
      'text-[#45556c]',
    );
    expect(screen.getByText(/700/)).toBeInTheDocument();
  });

  it('hides wallet row for guest users', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    const { container } = render(
      <CartWalletToggleRow applied={false} onChange={jest.fn()} balance={700} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows skeleton while wallet loads', () => {
    render(
      <CartWalletToggleRow applied={false} onChange={jest.fn()} balance={0} loading />,
    );

    expect(screen.getByTestId('cart-wallet-toggle-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
