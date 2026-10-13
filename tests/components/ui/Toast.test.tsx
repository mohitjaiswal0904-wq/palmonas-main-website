import { render, screen } from '@testing-library/react';

import { Toast } from '@/components/ui/Toast';

describe('Toast', () => {
  it('renders normal toast copy with status role', () => {
    render(<Toast>Saved to cart</Toast>);

    expect(screen.getByText('Saved to cart')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders success styling and icon', () => {
    render(<Toast type="success">Added</Toast>);

    const toast = screen.getByRole('status');
    expect(toast).toHaveClass('bg-[#e6f6ea]', 'border-[#6fc686]/50');
    expect(toast.querySelector('svg')).toHaveClass('text-[#00a02b]');
  });

  it('renders danger styling on the same light pill', () => {
    render(<Toast type="danger">Failed</Toast>);

    const toast = screen.getByRole('status');
    expect(toast).toHaveClass('bg-[#fdeceb]', 'text-palmonas-ink', 'rounded');
    expect(toast).not.toHaveClass('text-white');
  });

  it('applies zoom animation class when requested', () => {
    render(
      <Toast type="danger" animationType="zoom-in">
        Failed
      </Toast>,
    );

    expect(screen.getByRole('status')).toHaveClass('toast-animate-zoom-in');
  });

  it('forwards ref to the root element', () => {
    const ref = { current: null as HTMLDivElement | null };

    render(<Toast ref={ref}>Hello</Toast>);

    expect(ref.current?.tagName).toBe('DIV');
  });
});
