import { act, fireEvent, render, screen } from '@testing-library/react';

import { CartHeader } from '@/components/cart/CartHeader';
import { cartMessages } from '@/config/cart/cart.config';

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

describe('CartHeader', () => {
  const originalHistoryLength = window.history.length;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    Object.defineProperty(window.history, 'length', {
      configurable: true,
      get: () => originalHistoryLength,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(window.history, 'length', {
      configurable: true,
      get: () => originalHistoryLength,
    });
  });

  it('renders the cart title by default', () => {
    render(<CartHeader />);
    expect(screen.getByRole('heading', { name: cartMessages.pageTitle })).toBeInTheDocument();
  });

  it('renders item count after the title when itemCount is positive', () => {
    render(<CartHeader itemCount={3} />);

    expect(screen.getByTestId('cart-header-item-count')).toHaveTextContent('(3 items)');
    expect(screen.getByTestId('cart-header-item-count')).toHaveClass('text-[#9a9a9a]');
    expect(screen.getByRole('heading', { name: /Cart \(3 items\)/i })).toHaveClass(
      'text-base',
      'leading-6',
      'font-semibold',
    );
  });

  it('uses singular item label for one item', () => {
    render(<CartHeader itemCount={1} />);
    expect(screen.getByTestId('cart-header-item-count')).toHaveTextContent('(1 item)');
  });

  it('hides item count when zero or omitted', () => {
    const { rerender } = render(<CartHeader itemCount={0} />);
    expect(screen.queryByTestId('cart-header-item-count')).not.toBeInTheDocument();

    rerender(<CartHeader />);
    expect(screen.queryByTestId('cart-header-item-count')).not.toBeInTheDocument();
  });

  it('navigates to backHref when history has no prior entry', () => {
    Object.defineProperty(window.history, 'length', {
      configurable: true,
      get: () => 1,
    });

    render(<CartHeader backHref="/collections/best-sellers" />);
    fireEvent.click(screen.getByTestId('cart-header-back'));

    expect(mockBack).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/collections/best-sellers');
  });

  it('calls router.back when history has a prior entry', () => {
    Object.defineProperty(window.history, 'length', {
      configurable: true,
      get: () => 3,
    });

    render(<CartHeader />);
    fireEvent.click(screen.getByTestId('cart-header-back'));

    expect(mockBack).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('falls back to backHref when router.back leaves the URL unchanged', () => {
    Object.defineProperty(window.history, 'length', {
      configurable: true,
      get: () => 3,
    });

    render(<CartHeader backHref="/" />);
    fireEvent.click(screen.getByTestId('cart-header-back'));

    expect(mockBack).toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('hides the back button when showBack is false', () => {
    render(<CartHeader showBack={false} />);
    expect(screen.queryByTestId('cart-header-back')).not.toBeInTheDocument();
  });
});
