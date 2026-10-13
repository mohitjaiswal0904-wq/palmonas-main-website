import { act, render, screen } from '@testing-library/react';

import { NavCountBadge, buildNavCountAriaLabel } from '@/components/layout/NavCountBadge';

jest.mock('@/lib/cart/add-to-cart-flight', () => {
  let holds = 0;
  const listeners = new Set<(next: number) => void>();

  return {
    subscribeCartBadgeHold: (listener: (next: number) => void) => {
      listeners.add(listener);
      listener(holds);
      return () => {
        listeners.delete(listener);
      };
    },
    visibleCartBadgeCount: (actual: number, holdCount: number) => Math.max(0, actual - holdCount),
    __setHolds: (next: number) => {
      holds = next;
      listeners.forEach((listener) => {
        listener(holds);
      });
    },
  };
});

const setHolds = (next: number): void => {
  (
    jest.requireMock('@/lib/cart/add-to-cart-flight') as {
      __setHolds: (value: number) => void;
    }
  ).__setHolds(next);
};

describe('NavCountBadge', () => {
  it('hides when the live count is zero', () => {
    const { container } = render(<NavCountBadge count={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the live count when no flight is held', () => {
    render(<NavCountBadge count={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('keeps the previous count while a flight is in the air', () => {
    render(<NavCountBadge count={3} />);
    act(() => {
      setHolds(1);
    });
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('hides the badge when every new item is still flying', () => {
    render(<NavCountBadge count={1} />);
    act(() => {
      setHolds(1);
    });
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('builds an item count label after hydration', () => {
    expect(buildNavCountAriaLabel('Cart', 2, true)).toBe('Cart, 2 items');
    expect(buildNavCountAriaLabel('Cart', 2, false)).toBe('Cart');
  });
});
