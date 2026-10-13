/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';

import { CartFreeGiftCard } from '@/components/cart/cart-offer-banners';
import { cartMessages } from '@/config/cart/cart.config';

describe('CartFreeGiftCard progress UI', () => {
  it('hides the gift push when more than one item away', () => {
    render(<CartFreeGiftCard compact variant="footer" cartTotal={200} />);

    expect(screen.queryByTestId('cart-free-gift')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-free-gift-nudge')).not.toBeInTheDocument();
    expect(screen.queryByText(/Add ₹/)).not.toBeInTheDocument();
  });

  it('shows one line when remaining spend is one item away', () => {
    render(<CartFreeGiftCard compact variant="footer" cartTotal={1500} />);

    expect(screen.getByTestId('cart-free-gift-nudge')).toHaveTextContent(
      'Add ₹999 for free studs',
    );
    expect(screen.queryByTestId('cart-free-gift-banner')).not.toBeInTheDocument();
  });

  it('shows the unlocked card after the threshold', () => {
    render(<CartFreeGiftCard compact variant="footer" cartTotal={4500} />);

    expect(screen.getByText(cartMessages.freeGiftTitleUnlocked)).toBeInTheDocument();
    expect(screen.queryByTestId('cart-free-gift-banner')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-gift-item-row')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.a11y.hideFreeGiftDetails })).toBeInTheDocument();
  });

  it('hides gift details from the unlocked chip', () => {
    render(<CartFreeGiftCard compact variant="footer" cartTotal={4500} />);

    fireEvent.click(screen.getByTestId('cart-free-gift-toggle'));
    expect(screen.queryByTestId('cart-gift-item-row')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-free-gift-banner')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.a11y.showFreeGiftDetails })).toBeInTheDocument();
  });

  it('renders sidebar unlocked without the one-item nudge', () => {
    render(<CartFreeGiftCard variant="sidebar" cartTotal={4500} />);

    expect(screen.getByTestId('cart-free-gift')).toBeInTheDocument();
    expect(screen.queryByTestId('cart-free-gift-nudge')).not.toBeInTheDocument();
  });
});
