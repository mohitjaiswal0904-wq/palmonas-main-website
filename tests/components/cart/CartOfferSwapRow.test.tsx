import { fireEvent, render, screen } from '@testing-library/react';

import { CartOfferSwapRow } from '@/components/cart/CartOfferSwapRow';
import { cartMessages } from '@/config/cart/cart.config';

describe('CartOfferSwapRow', () => {
  it('shows the better ticket above Swap and the applied ticket below', () => {
    render(
      <CartOfferSwapRow
        betterCode="STACK3"
        betterDetail="Get any 3"
        extraSavedLabel="+₹200 extra"
        appliedCode="STACK2"
        appliedDetail="Get any 2"
        appliedSavingAmount="₹99"
        onSwap={jest.fn()}
        onRemoveApplied={jest.fn()}
        swapAriaLabel="Swap to STACK3, save ₹200 more"
      />,
    );

    const swap = screen.getByTestId('cart-offer-swap');
    expect(swap).toBeInTheDocument();
    expect(screen.getByText('STACK3')).toBeInTheDocument();
    expect(screen.getByText('+₹200 extra')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: cartMessages.apply })).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-offer-swap-button')).toHaveTextContent(cartMessages.swapOffer);
    expect(screen.getByTestId('cart-offer-row-applied')).toBeInTheDocument();
    expect(screen.getByText('STACK2')).toBeInTheDocument();
  });

  it('fires swap from the middle control', () => {
    const onSwap = jest.fn();
    render(
      <CartOfferSwapRow
        betterCode="STACK3"
        extraSavedLabel="+₹200 extra"
        appliedCode="STACK2"
        onSwap={onSwap}
        onRemoveApplied={jest.fn()}
        swapAriaLabel="Swap to STACK3, save ₹200 more"
      />,
    );

    fireEvent.click(screen.getByTestId('cart-offer-swap-button'));
    expect(onSwap).toHaveBeenCalledTimes(1);
  });

  it('disables Swap while a discount mutation is in flight', () => {
    render(
      <CartOfferSwapRow
        betterCode="STACK3"
        extraSavedLabel="+₹1 extra"
        appliedCode="STACK2"
        disabled
        onSwap={jest.fn()}
        onRemoveApplied={jest.fn()}
        swapAriaLabel="Swap to STACK3, save ₹1 more"
      />,
    );

    expect(screen.getByTestId('cart-offer-swap-button')).toBeDisabled();
  });

  it('still removes the applied offer from the lower ticket', () => {
    const onRemoveApplied = jest.fn();
    render(
      <CartOfferSwapRow
        betterCode="STACK3"
        extraSavedLabel="+₹1 extra"
        appliedCode="STACK2"
        onSwap={jest.fn()}
        onRemoveApplied={onRemoveApplied}
        swapAriaLabel="Swap to STACK3, save ₹1 more"
        removeAriaLabel={cartMessages.a11y.removeCoupon}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.removeCoupon }));
    expect(onRemoveApplied).toHaveBeenCalledTimes(1);
  });
});
