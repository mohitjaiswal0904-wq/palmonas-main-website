import { act, render, screen } from '@testing-library/react';

import { AddToCartFlyLayer } from '@/components/cart/AddToCartFlyLayer';
import { cartTheme } from '@/config/cart/cart.config';
import { subscribeAddToCartFlight, type AddToCartFlight } from '@/lib/cart/add-to-cart-flight';

jest.mock('@/lib/cart/add-to-cart-flight', () => {
  const listeners = new Set<(flight: AddToCartFlight) => void>();

  return {
    subscribeAddToCartFlight: (listener: (flight: AddToCartFlight) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    __emit: (flight: AddToCartFlight) => {
      listeners.forEach((listener) => {
        listener(flight);
      });
    },
  };
});

const emitFlight = (flight: AddToCartFlight): void => {
  (
    jest.requireMock('@/lib/cart/add-to-cart-flight') as {
      __emit: (next: AddToCartFlight) => void;
    }
  ).__emit(flight);
};

describe('AddToCartFlyLayer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders a chip when a flight is published', () => {
    render(<AddToCartFlyLayer />);
    expect(screen.queryByTestId('add-to-cart-fly-layer')).not.toBeInTheDocument();

    act(() => {
      emitFlight({
        id: 1,
        imageUrl: 'https://cdn.example.com/ring.jpg',
        fromX: 20,
        fromY: 210,
        fromLeft: 10,
        fromTop: 200,
        fromWidth: 80,
        fromHeight: 120,
        endScale: 0.3,
        toX: 400,
        toY: 50,
        reducedMotion: false,
      });
    });

    expect(screen.getByTestId('add-to-cart-fly-chip')).toBeInTheDocument();
    expect(subscribeAddToCartFlight).toEqual(expect.any(Function));
  });

  it('removes the chip after the flight duration', () => {
    render(<AddToCartFlyLayer />);
    act(() => {
      emitFlight({
        id: 2,
        fromX: 10,
        fromY: 10,
        fromLeft: 0,
        fromTop: 0,
        fromWidth: 80,
        fromHeight: 120,
        endScale: 0.3,
        toX: 100,
        toY: 20,
        reducedMotion: false,
      });
    });

    expect(screen.getByTestId('add-to-cart-fly-chip')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(cartTheme.addToCartFlight.durationMs);
    });
    expect(screen.queryByTestId('add-to-cart-fly-chip')).not.toBeInTheDocument();
  });

  it('ignores reduced-motion flights', () => {
    render(<AddToCartFlyLayer />);
    act(() => {
      emitFlight({
        id: 3,
        fromX: 10,
        fromY: 10,
        fromLeft: 0,
        fromTop: 0,
        fromWidth: 80,
        fromHeight: 120,
        endScale: 0.3,
        toX: 100,
        toY: 20,
        reducedMotion: true,
      });
    });

    expect(screen.queryByTestId('add-to-cart-fly-layer')).not.toBeInTheDocument();
  });

  it('stays empty when no flights are published', () => {
    const { container } = render(<AddToCartFlyLayer />);
    expect(container).toBeEmptyDOMElement();
  });
});
