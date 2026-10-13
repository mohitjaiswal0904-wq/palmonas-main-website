import { render, screen } from '@testing-library/react';

import { ProductPageSkeleton } from '@/components/product/ProductPageSkeleton';

describe('ProductPageSkeleton', () => {
  it('marks the main region as busy', () => {
    render(<ProductPageSkeleton />);

    expect(screen.getByLabelText('Loading product')).toHaveAttribute('aria-busy', 'true');
  });

  it('exposes a test id for route loading checks', () => {
    render(<ProductPageSkeleton />);

    expect(screen.getByTestId('product-page-skeleton')).toBeInTheDocument();
  });

  it('renders the product layout placeholders', () => {
    const { container } = render(<ProductPageSkeleton />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('uses a main landmark', () => {
    render(<ProductPageSkeleton />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('uses the PDP grouping rhythm in the info column', () => {
    const { container } = render(<ProductPageSkeleton />);
    const info = container.querySelector('[data-testid="product-page-skeleton"] > div > div:last-child');

    expect(info?.className).toContain('gap-6');
    expect(info?.className).toContain('pt-6');
    expect(info?.className).not.toContain('space-y-4');
  });
});
