import { render, screen } from '@testing-library/react';

import { ProductCardRating } from '@/components/product/ProductCardRating';

describe('ProductCardRating', () => {
  it('renders the default PLP chip with Figma padding and typography', () => {
    render(<ProductCardRating avgRating={4.5} reviewCount={125} />);

    const chip = screen.getByTestId('product-card-rating');
    expect(chip).toHaveClass(
      'gap-[3px]',
      'rounded-full',
      'px-1.5',
      'py-px',
      'text-xs',
      'text-[#151515]',
    );
    expect(chip.querySelector('svg')).toHaveClass('h-[11px]', 'w-[11px]');
    expect(chip).toHaveAttribute(
      'aria-label',
      'Product rating: 4.5 out of 5 from 125 reviews',
    );
    expect(chip).toHaveTextContent('4.5');
    expect(chip).toHaveTextContent('|125');
  });

  it('does not retain the invalid padding utility', () => {
    render(<ProductCardRating avgRating={4.8} reviewCount={300} />);

    expect(screen.getByTestId('product-card-rating')).not.toHaveClass('pxy-0.5');
  });

  it('renders compact chip with smaller type and rounded corners', () => {
    render(<ProductCardRating avgRating={4.2} reviewCount={12} variant="compact" />);

    const chip = screen.getByTestId('product-card-rating-compact');
    expect(chip).toHaveClass('text-[6px]', 'rounded', 'gap-0.5');
    expect(chip).not.toHaveClass('rounded-full');
    expect(chip).toHaveAttribute(
      'aria-label',
      'Product rating: 4.2 out of 5 from 12 reviews',
    );
  });

  it('renders when avgRating is exactly 4', () => {
    render(<ProductCardRating avgRating={4} reviewCount={50} />);
    expect(screen.getByTestId('product-card-rating')).toHaveTextContent('4.0');
  });

  it('renders nothing when avgRating is below 4', () => {
    const { container } = render(<ProductCardRating avgRating={3.9} reviewCount={50} />);
    expect(container).toBeEmptyDOMElement();
  });
});
