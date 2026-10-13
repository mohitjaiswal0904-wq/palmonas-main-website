import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AccountMenuItem } from '@/components/account/common/AccountMenuItem';
import { ACCOUNT_PRIMARY_MENU_ITEMS } from '@/components/account/common/account-menu.config';

describe('AccountMenuItem', () => {
  const walletItem = ACCOUNT_PRIMARY_MENU_ITEMS.find((item) => item.id === 'wallet');
  const wishlistItem = ACCOUNT_PRIMARY_MENU_ITEMS.find((item) => item.id === 'wishlist');

  if (!walletItem) {
    throw new Error('wallet menu item missing from config');
  }

  if (!wishlistItem) {
    throw new Error('wishlist menu item missing from config');
  }

  it('calls onSelect with the menu id and href', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(<AccountMenuItem item={walletItem} onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: walletItem.title }));

    expect(onSelect).toHaveBeenCalledWith('wallet', '/account/wallet');
  });

  it('sends the public wishlist href for the wishlist item', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(<AccountMenuItem item={wishlistItem} onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: wishlistItem.title }));

    expect(onSelect).toHaveBeenCalledWith('wishlist', '/wishlist');
  });

  it('renders as a button rather than a hard navigation anchor', () => {
    render(<AccountMenuItem item={walletItem} onSelect={jest.fn()} />);

    expect(screen.getByRole('button', { name: walletItem.title })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('marks the active item for a11y and applies active styling', () => {
    render(<AccountMenuItem item={walletItem} isActive onSelect={jest.fn()} />);

    const button = screen.getByRole('button', { name: walletItem.title });
    expect(button).toHaveAttribute('aria-current', 'page');
    expect(button.className).toMatch(/bg-\[#(?:F5EBE6|FAFAFA)\]/);
  });

  it('omits aria-current when inactive', () => {
    render(<AccountMenuItem item={walletItem} onSelect={jest.fn()} />);

    expect(screen.getByRole('button', { name: walletItem.title })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
