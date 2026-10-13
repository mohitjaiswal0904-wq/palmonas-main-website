import { render, screen } from '@testing-library/react';

import { ProductPurchaseAssurance } from '@/components/product/ProductPurchaseAssurance';
import { productMessages, productTheme } from '@/config/product/product.config';

describe('ProductPurchaseAssurance', () => {
  it('renders return, exchange, and COD copy in a labelled region', () => {
    render(<ProductPurchaseAssurance />);

    const region = screen.getByRole('region', { name: productMessages.a11y.purchaseAssurance });
    expect(region).toHaveClass('pt-10', 'pb-8');
    expect(region).toBeInTheDocument();
    expect(screen.getByText(productMessages.twoDaysReturn)).toBeInTheDocument();
    expect(screen.getByText(productMessages.tenDaysExchange)).toBeInTheDocument();
    expect(screen.getByText(productMessages.cashOnDelivery)).toBeInTheDocument();
  });

  it('uses the PDP rhythm tokens and keeps icons decorative', () => {
    const { container } = render(<ProductPurchaseAssurance />);

    expect(screen.getByRole('list')).toHaveClass('grid-cols-3');
    expect(container.querySelectorAll('img')).toHaveLength(2);
    expect(container.querySelector('.opacity-60')).toContainElement(
      container.querySelector('.rounded-full'),
    );
    expect(container.querySelector('.rounded-full')).toHaveStyle({
      color: productTheme.textMuted,
      borderColor: productTheme.textMuted,
    });
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText(productMessages.twoDaysReturn)).toHaveStyle({
      color: productTheme.textMuted,
    });
  });

  it('does not use the screenshot divider-column layout', () => {
    const { container } = render(<ProductPurchaseAssurance />);

    expect(container.querySelector('[class*="divide"]')).toBeNull();
    expect(container.querySelector('[class*="border-x"]')).toBeNull();
  });

  it('exposes exactly three assurance items', () => {
    render(<ProductPurchaseAssurance />);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
