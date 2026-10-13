import { act, fireEvent, render, screen } from '@testing-library/react';

import {
  NavigationPendingProvider,
  useNavigationPending,
} from '@/providers/navigation/NavigationPendingProvider';

const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

function PendingProbe({ targetHref = '/products/demo' }: { targetHref?: string }) {
  const { pendingHref, startNavigation, clearNavigation } = useNavigationPending();
  return (
    <div>
      <button type="button" onClick={() => startNavigation(targetHref)}>
        Start
      </button>
      <button type="button" onClick={() => startNavigation(targetHref)}>
        Same start
      </button>
      <button type="button" onClick={clearNavigation}>
        Clear
      </button>
      <span data-testid="pending">{pendingHref ?? 'none'}</span>
    </div>
  );
}

describe('NavigationPendingProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUsePathname.mockReturnValue('/collections/bestsellers');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sets pending href immediately and shows the overlay after a short delay', () => {
    render(
      <NavigationPendingProvider>
        <PendingProbe />
      </NavigationPendingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    expect(screen.getByTestId('pending')).toHaveTextContent('/products/demo');
    expect(screen.queryByTestId('navigation-pending-overlay')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(180);
    });

    expect(screen.getByTestId('navigation-pending-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('product-page-skeleton')).toBeInTheDocument();
  });

  it('does not paint the overlay when the destination commits before the delay', () => {
    const { rerender } = render(
      <NavigationPendingProvider>
        <PendingProbe />
      </NavigationPendingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    mockUsePathname.mockReturnValue('/products/demo');
    rerender(
      <NavigationPendingProvider>
        <PendingProbe />
      </NavigationPendingProvider>,
    );

    act(() => {
      jest.advanceTimersByTime(180);
    });

    expect(screen.getByTestId('pending')).toHaveTextContent('none');
    expect(screen.queryByTestId('navigation-pending-overlay')).not.toBeInTheDocument();
  });

  it('skips pending when target matches current location', () => {
    mockUsePathname.mockReturnValue('/products/demo');

    render(
      <NavigationPendingProvider>
        <PendingProbe />
      </NavigationPendingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    expect(screen.getByTestId('pending')).toHaveTextContent('none');
    expect(screen.queryByTestId('navigation-pending-overlay')).not.toBeInTheDocument();
  });

  it('clears pathname pending when search params are added after arrival', () => {
    const { rerender } = render(
      <NavigationPendingProvider>
        <PendingProbe targetHref="/cart" />
      </NavigationPendingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByTestId('pending')).toHaveTextContent('/cart');

    mockUsePathname.mockReturnValue('/cart');
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('utm_source=new_website&utm_medium=web&utm_campaign=web_checkout'),
    );
    rerender(
      <NavigationPendingProvider>
        <PendingProbe targetHref="/cart" />
      </NavigationPendingProvider>,
    );

    expect(screen.getByTestId('pending')).toHaveTextContent('none');
    expect(screen.queryByTestId('navigation-pending-overlay')).not.toBeInTheDocument();
  });

  it('clears pending when pathname matches target', () => {
    const { rerender } = render(
      <NavigationPendingProvider>
        <PendingProbe />
      </NavigationPendingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByTestId('pending')).toHaveTextContent('/products/demo');

    mockUsePathname.mockReturnValue('/products/demo');
    rerender(
      <NavigationPendingProvider>
        <PendingProbe />
      </NavigationPendingProvider>,
    );

    expect(screen.getByTestId('pending')).toHaveTextContent('none');
    expect(screen.queryByTestId('navigation-pending-overlay')).not.toBeInTheDocument();
  });

  it('clears pending on bfcache pageshow', () => {
    render(
      <NavigationPendingProvider>
        <PendingProbe />
      </NavigationPendingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    act(() => {
      jest.advanceTimersByTime(180);
    });
    expect(screen.getByTestId('navigation-pending-overlay')).toBeInTheDocument();

    act(() => {
      const event = new Event('pageshow') as PageTransitionEvent;
      Object.defineProperty(event, 'persisted', { value: true });
      window.dispatchEvent(event);
    });

    expect(screen.getByTestId('pending')).toHaveTextContent('none');
    expect(screen.queryByTestId('navigation-pending-overlay')).not.toBeInTheDocument();
  });

  it('clears pending on browser back / swipe-back', () => {
    render(
      <NavigationPendingProvider>
        <PendingProbe />
      </NavigationPendingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    act(() => {
      jest.advanceTimersByTime(180);
    });
    expect(screen.getByTestId('navigation-pending-overlay')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(screen.getByTestId('pending')).toHaveTextContent('none');
    expect(screen.queryByTestId('navigation-pending-overlay')).not.toBeInTheDocument();
  });

  it('clears pending after timeout', () => {
    render(
      <NavigationPendingProvider>
        <PendingProbe />
      </NavigationPendingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByTestId('pending')).toHaveTextContent('/products/demo');

    act(() => {
      jest.advanceTimersByTime(12_000);
    });

    expect(screen.getByTestId('pending')).toHaveTextContent('none');
  });

  it('holds search-only pending until clearNavigation after URL matches', () => {
    mockUsePathname.mockReturnValue('/');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    const { rerender } = render(
      <NavigationPendingProvider>
        <PendingProbe targetHref="/?category=gold" />
      </NavigationPendingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByTestId('pending')).toHaveTextContent('/?category=gold');
    act(() => {
      jest.advanceTimersByTime(180);
    });
    expect(screen.getByTestId('home-page-skeleton')).toBeInTheDocument();

    mockUseSearchParams.mockReturnValue(new URLSearchParams('category=gold'));
    rerender(
      <NavigationPendingProvider>
        <PendingProbe targetHref="/?category=gold" />
      </NavigationPendingProvider>,
    );

    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(screen.getByTestId('pending')).toHaveTextContent('/?category=gold');
    expect(screen.getByTestId('navigation-pending-overlay')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByTestId('pending')).toHaveTextContent('none');
  });

  it('clears search-only pending after timeout', () => {
    mockUsePathname.mockReturnValue('/');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    render(
      <NavigationPendingProvider>
        <PendingProbe targetHref="/?category=gold" />
      </NavigationPendingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByTestId('pending')).toHaveTextContent('/?category=gold');

    act(() => {
      jest.advanceTimersByTime(12_000);
    });

    expect(screen.getByTestId('pending')).toHaveTextContent('none');
  });
});
