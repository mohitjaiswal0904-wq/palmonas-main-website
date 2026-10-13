import { render, screen } from '@testing-library/react';

import { ProductCardBadge } from '@/components/product/ProductCardBadge';
import { productTheme } from '@/config/product/product.config';

describe('ProductCardBadge', () => {
  it('renders the provided label', () => {
    render(<ProductCardBadge label="Bestseller" />);

    expect(screen.getByText('Bestseller')).toHaveClass('text-xs', 'laptop:text-sm');
  });

  it('applies the ribbon layout, shine hook class, and theme background', () => {
    const { container } = render(<ProductCardBadge label="Bestseller" />);
    const badge = container.firstElementChild;

    expect(badge).toHaveClass('product-badge-left');
    expect(badge).toHaveClass('absolute', 'top-0', 'left-0', 'overflow-hidden');
    expect(badge).toHaveStyle({ backgroundColor: productTheme.cardBadge.background });
  });

  it('uses a custom ribbon color and label class when provided', () => {
    const { container } = render(
      <ProductCardBadge label="Dhanteras pick" background="#B8862B" labelClassName="text-[#FFF8EE]" />,
    );

    expect(container.firstElementChild).toHaveStyle({ backgroundColor: '#B8862B' });
    expect(screen.getByText('Dhanteras pick')).toHaveClass('text-[#FFF8EE]');
  });

  it('merges a custom className without dropping the shine hook class', () => {
    const { container } = render(<ProductCardBadge label="New Arrival" className="z-[9]" />);
    const badge = container.firstElementChild;

    expect(badge).toHaveClass('product-badge-left', 'z-[9]');
    expect(screen.getByText('New Arrival')).toBeInTheDocument();
  });

  it('does not render the previous lightning-bolt icon', () => {
    const { container } = render(<ProductCardBadge label="Bestseller" />);

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
