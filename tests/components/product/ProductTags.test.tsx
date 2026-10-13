import { render, screen } from '@testing-library/react';

import { ProductTags } from '@/components/product/ProductTags';
import { productMessages } from '@/config/product/product.config';

describe('ProductTags', () => {
  it('renders the shipping pill when product tags exist', () => {
    render(<ProductTags tags={[{ name: 'badge', value: 'Selling Fast' }]} />);

    expect(screen.getByText(productMessages.shipsIn24Hours)).toBeInTheDocument();
  });

  it('exposes the shipping-promise accessibility label', () => {
    render(<ProductTags tags={[{ name: 'badge', value: 'Selling Fast' }]} />);

    expect(screen.getByLabelText(productMessages.a11y.shipsIn24Hours)).toBeInTheDocument();
  });

  it('does not render when tags are missing', () => {
    const { container } = render(<ProductTags />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(productMessages.shipsIn24Hours)).not.toBeInTheDocument();
  });

  it('does not surface the API selling-fast label', () => {
    render(<ProductTags tags={[{ name: 'badge', value: 'Selling Fast' }]} />);

    expect(screen.queryByText('Selling Fast')).not.toBeInTheDocument();
  });

  it('applies an optional className for parent-owned spacing', () => {
    const { container } = render(
      <ProductTags tags={[{ name: 'badge', value: 'Selling Fast' }]} className="mt-3" />,
    );

    expect(container.firstElementChild).toHaveClass('mt-3');
  });

  it('renders the API selling-fast label on the gold variant', () => {
    render(
      <ProductTags
        tags={[{ name: 'badge', value: 'Selling Fast' }]}
        variant="sellingFast"
      />,
    );

    expect(screen.getByText('Selling Fast')).toBeInTheDocument();
    expect(screen.queryByText(productMessages.shipsIn24Hours)).not.toBeInTheDocument();
  });

  it('does not render ships-in-24h chrome for the gold selling-fast variant', () => {
    render(
      <ProductTags tags={[{ name: 'badge', value: 'Selling Fast' }]} variant="sellingFast" />,
    );

    expect(screen.queryByLabelText(productMessages.a11y.shipsIn24Hours)).not.toBeInTheDocument();
    expect(screen.getByLabelText(productMessages.a11y.sellingFastBadge)).toBeInTheDocument();
  });
});
