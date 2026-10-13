import { fireEvent, render, screen } from '@testing-library/react';

import { ProductCardQuantityStepper } from '@/components/product/ProductCardQuantityStepper';
import { cartMessages } from '@/config/cart/cart.config';

describe('ProductCardQuantityStepper', () => {
  it('renders the current quantity and increases it', () => {
    const onIncrease = jest.fn();

    render(
      <ProductCardQuantityStepper
        quantity={2}
        onDecrease={jest.fn()}
        onIncrease={onIncrease}
        onRemove={jest.fn()}
      />,
    );

    expect(screen.getByTestId('product-card-quantity-stepper')).toHaveTextContent('2');
    expect(screen.getByTestId('product-card-quantity-stepper')).toHaveClass('h-[22px]');
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.increaseQuantity }));
    expect(onIncrease).toHaveBeenCalledTimes(1);
  });

  it('decreases when quantity is greater than one', () => {
    const onDecrease = jest.fn();
    const onRemove = jest.fn();

    render(
      <ProductCardQuantityStepper
        quantity={3}
        onDecrease={onDecrease}
        onIncrease={jest.fn()}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.decreaseQuantity }));
    expect(onDecrease).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('removes the line instead of decreasing at quantity one', () => {
    const onDecrease = jest.fn();
    const onRemove = jest.fn();

    render(
      <ProductCardQuantityStepper
        quantity={1}
        onDecrease={onDecrease}
        onIncrease={jest.fn()}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.decreaseQuantity }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onDecrease).not.toHaveBeenCalled();
  });

  it('renders the full-width PDP tone with white quantity text', () => {
    render(
      <ProductCardQuantityStepper
        tone="pdp"
        quantity={2}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
        onRemove={jest.fn()}
      />,
    );

    const stepper = screen.getByTestId('product-pdp-quantity-stepper');
    expect(stepper).toHaveTextContent('2');
    expect(stepper).toHaveClass('min-h-12', 'w-full', 'rounded-[10px]');
    expect(stepper).toHaveStyle({ backgroundColor: '#151515' });
  });

  it('overrides the PDP track fill when a track color is provided', () => {
    render(
      <ProductCardQuantityStepper
        tone="pdp"
        trackColor="#502C3A"
        quantity={1}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
        onRemove={jest.fn()}
      />,
    );

    expect(screen.getByTestId('product-pdp-quantity-stepper')).toHaveStyle({
      backgroundColor: '#502C3A',
    });
  });

  it('shows a loader instead of the quantity while updating', () => {
    render(
      <ProductCardQuantityStepper
        quantity={2}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
        onRemove={jest.fn()}
        isLoading
      />,
    );

    const stepper = screen.getByTestId('product-card-quantity-stepper');
    expect(stepper).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status', { name: cartMessages.a11y.updatingQuantity })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.a11y.increaseQuantity })).toHaveClass(
      'invisible',
    );
  });

  it('keeps the quantity visible when not loading', () => {
    render(
      <ProductCardQuantityStepper
        quantity={4}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
        onRemove={jest.fn()}
      />,
    );

    expect(screen.getByTestId('product-card-quantity-stepper')).not.toHaveAttribute('aria-busy');
    expect(screen.queryByRole('status', { name: cartMessages.a11y.updatingQuantity })).not.toBeInTheDocument();
    expect(screen.getByTestId('product-card-quantity-stepper')).toHaveTextContent('4');
  });

  it('does not fire quantity actions while loading', () => {
    const onDecrease = jest.fn();
    const onIncrease = jest.fn();
    const onRemove = jest.fn();

    render(
      <ProductCardQuantityStepper
        quantity={2}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        onRemove={onRemove}
        isLoading
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.decreaseQuantity }));
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.increaseQuantity }));
    expect(onDecrease).not.toHaveBeenCalled();
    expect(onIncrease).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('does not fire quantity actions when disabled', () => {
    const onDecrease = jest.fn();
    const onIncrease = jest.fn();
    const onRemove = jest.fn();

    render(
      <ProductCardQuantityStepper
        quantity={1}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        onRemove={onRemove}
        disabled
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.decreaseQuantity }));
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.increaseQuantity }));
    expect(onDecrease).not.toHaveBeenCalled();
    expect(onIncrease).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('plays the ATC reveal animation when requested and idle', () => {
    render(
      <ProductCardQuantityStepper
        tone="pdp"
        quantity={1}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
        onRemove={jest.fn()}
        animateReveal
      />,
    );

    expect(screen.getByTestId('product-pdp-quantity-stepper')).toHaveClass('a2c-qty-reveal');
  });

  it('holds the ATC reveal until the stepper is idle', () => {
    render(
      <ProductCardQuantityStepper
        tone="pdp"
        quantity={1}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
        onRemove={jest.fn()}
        animateReveal
        isLoading
      />,
    );

    expect(screen.getByTestId('product-pdp-quantity-stepper')).not.toHaveClass('a2c-qty-reveal');
  });
});
