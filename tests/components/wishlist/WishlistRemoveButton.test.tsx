import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WishlistRemoveButton } from '@/components/wishlist/WishlistRemoveButton';

describe('WishlistRemoveButton', () => {
  it('renders with an accessible remove label', () => {
    render(<WishlistRemoveButton productName="Gold Ring" onRemoveRequest={jest.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Remove Gold Ring from wishlist' }),
    ).toBeInTheDocument();
  });

  it('renders the delete icon asset', () => {
    render(<WishlistRemoveButton productName="Gold Ring" onRemoveRequest={jest.fn()} />);

    expect(screen.getByRole('presentation', { hidden: true })).toHaveAttribute('width', '16');
  });

  it('calls onRemoveRequest when clicked', async () => {
    const user = userEvent.setup();
    const onRemoveRequest = jest.fn();

    render(<WishlistRemoveButton productName="Gold Ring" onRemoveRequest={onRemoveRequest} />);

    await user.click(screen.getByRole('button', { name: 'Remove Gold Ring from wishlist' }));

    expect(onRemoveRequest).toHaveBeenCalledTimes(1);
  });

  it('does not call onRemoveRequest before interaction', () => {
    const onRemoveRequest = jest.fn();

    render(<WishlistRemoveButton productName="Gold Ring" onRemoveRequest={onRemoveRequest} />);

    expect(onRemoveRequest).not.toHaveBeenCalled();
  });
});
