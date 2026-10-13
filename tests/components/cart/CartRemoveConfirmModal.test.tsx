import { fireEvent, render, screen } from '@testing-library/react';

import { CartRemoveConfirmModal } from '@/components/cart/CartRemoveConfirmModal';
import { cartMessages } from '@/config/cart/cart.config';

describe('CartRemoveConfirmModal', () => {
  it('renders title and both action buttons when open', () => {
    render(
      <CartRemoveConfirmModal
        open
        onRemove={jest.fn()}
        onMoveToWishlist={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText(cartMessages.removeConfirm.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.removeConfirm.remove })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: cartMessages.removeConfirm.moveToWishlist }),
    ).toBeInTheDocument();
  });

  it('calls onRemove when Remove is clicked', () => {
    const onRemove = jest.fn();
    render(
      <CartRemoveConfirmModal
        open
        onRemove={onRemove}
        onMoveToWishlist={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.removeConfirm.remove }));
    expect(onRemove).toHaveBeenCalled();
  });

  it('calls onMoveToWishlist when Move to Wishlist is clicked', () => {
    const onMoveToWishlist = jest.fn();
    render(
      <CartRemoveConfirmModal
        open
        onRemove={jest.fn()}
        onMoveToWishlist={onMoveToWishlist}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.removeConfirm.moveToWishlist }));
    expect(onMoveToWishlist).toHaveBeenCalled();
  });

  it('calls onCancel when backdrop close is clicked', () => {
    const onCancel = jest.fn();
    render(
      <CartRemoveConfirmModal
        open
        onRemove={jest.fn()}
        onMoveToWishlist={jest.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByLabelText('Close'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('disables both buttons while remove action is loading', () => {
    render(
      <CartRemoveConfirmModal
        open
        loadingAction="remove"
        onRemove={jest.fn()}
        onMoveToWishlist={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    const removeButton = screen.getByRole('button', { name: cartMessages.removeConfirm.remove });
    const wishlistButton = screen.getByRole('button', {
      name: cartMessages.removeConfirm.moveToWishlist,
    });

    expect(removeButton).toBeDisabled();
    expect(wishlistButton).toBeDisabled();
    expect(removeButton).toHaveAttribute('aria-busy', 'true');
    expect(wishlistButton).not.toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText(cartMessages.removeConfirm.remove)).not.toBeInTheDocument();
    expect(screen.getByText(cartMessages.removeConfirm.moveToWishlist)).toBeInTheDocument();
  });

  it('shows loading only on wishlist button when wishlist action is loading', () => {
    render(
      <CartRemoveConfirmModal
        open
        loadingAction="wishlist"
        onRemove={jest.fn()}
        onMoveToWishlist={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    const removeButton = screen.getByRole('button', { name: cartMessages.removeConfirm.remove });
    const wishlistButton = screen.getByRole('button', {
      name: cartMessages.removeConfirm.moveToWishlist,
    });

    expect(removeButton).toBeDisabled();
    expect(wishlistButton).toBeDisabled();
    expect(removeButton).not.toHaveAttribute('aria-busy', 'true');
    expect(wishlistButton).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText(cartMessages.removeConfirm.remove)).toBeInTheDocument();
    expect(screen.queryByText(cartMessages.removeConfirm.moveToWishlist)).not.toBeInTheDocument();
  });
});
