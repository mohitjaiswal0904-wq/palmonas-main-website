import { render, screen } from '@testing-library/react';

import { ProductTagBadge } from '@/components/product/ProductTagBadge';
import { productMessages, productTheme } from '@/config/product/product.config';

describe('ProductTagBadge', () => {
  it('renders the ships-in-24-hours label', () => {
    render(<ProductTagBadge />);

    expect(screen.getByText(productMessages.shipsIn24Hours)).toBeInTheDocument();
  });

  it('applies indigo shipping colours from the tag token', () => {
    render(<ProductTagBadge />);
    const label = screen.getByText(productMessages.shipsIn24Hours);

    expect(label).toHaveStyle({ color: productTheme.tagBadge.text });
    expect(label.parentElement).toHaveStyle({
      backgroundImage: productTheme.tagBadge.fillGradient,
    });
  });

  it('does not render the previous selling-fast copy', () => {
    render(<ProductTagBadge />);

    expect(screen.queryByText('Selling Fast')).not.toBeInTheDocument();
  });

  it('uses a clock icon instead of the lightning bolt', () => {
    const { container } = render(<ProductTagBadge />);

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('svg circle')).toBeInTheDocument();
    expect(screen.queryByText(/selling fast/i)).not.toBeInTheDocument();
  });

  it('renders the original selling-fast pill for gold', () => {
    render(<ProductTagBadge variant="sellingFast" label="Selling Fast" />);

    expect(screen.getByText(productMessages.sellingFast)).toBeInTheDocument();
    expect(screen.queryByText(productMessages.shipsIn24Hours)).not.toBeInTheDocument();
  });

  it('applies orange selling-fast colours from the gold tag token', () => {
    render(<ProductTagBadge variant="sellingFast" label="Selling Fast" />);
    const label = screen.getByText(productMessages.sellingFast);

    expect(label).toHaveStyle({ color: productTheme.sellingFastTag.text });
    expect(label.parentElement).toHaveStyle({
      backgroundImage: productTheme.sellingFastTag.fillGradient,
    });
  });

  it('falls back to selling-fast copy when the gold label is empty', () => {
    render(<ProductTagBadge variant="sellingFast" label="   " />);

    expect(screen.getByText(productMessages.sellingFast)).toBeInTheDocument();
  });

  it('uses a lightning icon on the gold selling-fast pill', () => {
    const { container } = render(<ProductTagBadge variant="sellingFast" label="Selling Fast" />);

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('svg circle')).not.toBeInTheDocument();
  });
});
