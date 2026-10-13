import { render, screen } from '@testing-library/react';

import { AddToCartFlyChip } from '@/components/cart/AddToCartFlyChip';
import type { AddToCartFlight } from '@/lib/cart/add-to-cart-flight';

const flight: AddToCartFlight = {
  id: 1,
  imageUrl: 'https://cdn.example.com/ring.jpg',
  fromX: 20,
  fromY: 210,
  fromLeft: 10,
  fromTop: 200,
  fromWidth: 80,
  fromHeight: 120,
  endScale: 0.3,
  toX: 400,
  toY: 50,
  reducedMotion: false,
};

describe('AddToCartFlyChip', () => {
  it('sizes the clone to the source card', () => {
    render(<AddToCartFlyChip flight={flight} />);
    const chip = screen.getByTestId('add-to-cart-fly-chip');
    expect(chip).toHaveStyle({ width: '80px', height: '120px', left: '10px', top: '200px' });
  });

  it('uses the product image as the flyer fill', () => {
    render(<AddToCartFlyChip flight={flight} />);
    expect(screen.getByTestId('add-to-cart-fly-chip')).toHaveStyle({
      backgroundImage: 'url(https://cdn.example.com/ring.jpg)',
    });
  });

  it('omits the image fill when no url is provided', () => {
    render(<AddToCartFlyChip flight={{ ...flight, imageUrl: undefined }} />);
    expect(screen.getByTestId('add-to-cart-fly-chip').style.backgroundImage).toBe('');
  });

  it('starts at identity transform before the first frame', () => {
    render(<AddToCartFlyChip flight={flight} />);
    expect(screen.getByTestId('add-to-cart-fly-chip').className).toContain('cart-fly-chip');
  });
});
