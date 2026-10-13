import { render, screen } from '@testing-library/react';

import { PlatinumPlatedBadge } from '@/components/product/PlatinumPlatedBadge';
import { productMessages, productTheme } from '@/config/product/product.config';

describe('PlatinumPlatedBadge', () => {
  it('renders the platinum plated label and seal', () => {
    const { container } = render(<PlatinumPlatedBadge />);
    const icon = container.querySelector('svg');

    expect(screen.getByText(productMessages.platinumPlated)).toBeInTheDocument();
    expect(icon).toHaveAttribute('viewBox', '0 0 13 13');
  });

  it('uses the Figma pill chrome', () => {
    const { container } = render(<PlatinumPlatedBadge />);
    const stroke = container.firstElementChild;
    const fill = stroke?.firstElementChild;

    expect(stroke).toHaveClass('w-fit', 'self-start', 'p-[0.5px]');
    expect(stroke).not.toHaveClass('rounded-r-none');
    expect(stroke).toHaveStyle({
      borderRadius: productTheme.platinumPlated.radius,
      background: productTheme.platinumPlated.strokeGradient,
    });
    expect(fill).toHaveStyle({
      color: productTheme.platinumPlated.text,
      background: productTheme.platinumPlated.gradient,
    });
  });

  it('hides the seal from assistive tech', () => {
    const { container } = render(<PlatinumPlatedBadge />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps the seal at the Figma 13×12 leaf size', () => {
    const { container } = render(<PlatinumPlatedBadge />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('width', '13');
    expect(icon).toHaveAttribute('height', '13');
    expect(icon?.parentElement).toHaveClass('h-3', 'w-[13px]', 'overflow-hidden');
  });
});
