import { render, screen } from '@testing-library/react';

import { StickyAddToCartAddedMotion } from '@/components/product/StickyAddToCartAddedMotion';
import { cartMessages } from '@/config/cart/cart.config';
import { productTheme } from '@/config/product/product.config';

describe('StickyAddToCartAddedMotion', () => {
  it('shows the cart icon and added label', () => {
    render(<StickyAddToCartAddedMotion />);
    expect(screen.getByText(cartMessages.added)).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders one bead for each token color', () => {
    const { container } = render(<StickyAddToCartAddedMotion />);
    expect(container.querySelectorAll('.sticky-atc-added-dot')).toHaveLength(
      productTheme.stickyBarAdded.dotColors.length,
    );
    expect(container.querySelector('.sticky-atc-added-beads')).toBeInTheDocument();
    expect(container.querySelector('.sticky-atc-added-ripple')).toBeInTheDocument();
  });

  it('hides the motion from the accessibility tree', () => {
    const { container } = render(<StickyAddToCartAddedMotion />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses the added-motion wrapper class', () => {
    const { container } = render(<StickyAddToCartAddedMotion />);
    expect(container.firstChild).toHaveClass('sticky-atc-added');
  });
});
