import { act, fireEvent, render, screen } from '@testing-library/react';

import { SearchMobileSlideShell } from '@/components/search/SearchMobileSlideShell';
import { requestSearchMobileSlideExit } from '@/lib/search/search-mobile-slide';

describe('SearchMobileSlideShell', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('starts off-screen on mobile then slides up into view', () => {
    const pending: FrameRequestCallback[] = [];
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      pending.push(callback);
      return pending.length;
    });

    render(
      <SearchMobileSlideShell>
        <div>Search body</div>
      </SearchMobileSlideShell>,
    );

    const shell = screen.getByTestId('search-mobile-slide-shell');
    expect(shell).toHaveAttribute('data-slide-phase', 'closed');
    expect(shell).toHaveClass('fixed', 'inset-0', 'translate-y-full', 'flex', 'flex-col', 'overflow-hidden');
    expect(shell).toHaveClass('duration-200', 'ease-out', 'transition-transform');
    expect(shell).not.toHaveClass('opacity-0');
    expect(shell).toHaveClass('laptop:static', 'laptop:translate-y-0');

    act(() => {
      pending.shift()?.(0);
      pending.shift()?.(0);
    });

    expect(screen.getByTestId('search-mobile-slide-shell')).toHaveAttribute(
      'data-slide-phase',
      'open',
    );
    expect(screen.getByTestId('search-mobile-slide-shell')).toHaveClass('translate-y-0');
    expect(screen.getByTestId('search-mobile-slide-shell')).not.toHaveClass('translate-y-full');
    expect(screen.getByText('Search body')).toBeInTheDocument();
  });

  it('slides down then runs navigation on exit request', () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    const navigate = jest.fn();

    render(
      <SearchMobileSlideShell>
        <div>Search body</div>
      </SearchMobileSlideShell>,
    );

    expect(screen.getByTestId('search-mobile-slide-shell')).toHaveAttribute(
      'data-slide-phase',
      'open',
    );

    act(() => {
      requestSearchMobileSlideExit(navigate);
    });

    const shell = screen.getByTestId('search-mobile-slide-shell');
    expect(shell).toHaveAttribute('data-slide-phase', 'closing');
    expect(shell).toHaveClass('translate-y-full', 'ease-in');
    expect(navigate).not.toHaveBeenCalled();

    fireEvent.transitionEnd(shell, { propertyName: 'transform' });

    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('keeps desktop layout classes that disable the sheet transform', () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });

    render(
      <SearchMobileSlideShell>
        <div>Desktop search</div>
      </SearchMobileSlideShell>,
    );

    expect(screen.getByTestId('search-mobile-slide-shell')).toHaveClass(
      'laptop:static',
      'laptop:z-auto',
      'laptop:overflow-visible',
      'laptop:transition-none',
    );
  });

  it('renders children inside the animated shell', () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });

    render(
      <SearchMobileSlideShell>
        <p>Popular Search</p>
      </SearchMobileSlideShell>,
    );

    expect(screen.getByText('Popular Search')).toBeInTheDocument();
  });

  it('applies reduced-motion safe transition classes', () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });

    render(
      <SearchMobileSlideShell>
        <div>Content</div>
      </SearchMobileSlideShell>,
    );

    expect(screen.getByTestId('search-mobile-slide-shell')).toHaveClass(
      'motion-reduce:transition-none',
    );
  });

  it('transitions to open-settled on transitionend and removes transform classes', () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });

    render(
      <SearchMobileSlideShell>
        <div>Content</div>
      </SearchMobileSlideShell>,
    );

    const shell = screen.getByTestId('search-mobile-slide-shell');
    expect(shell).toHaveAttribute('data-slide-phase', 'open');
    expect(shell).toHaveClass('translate-y-0', 'transition-transform', 'will-change-transform');

    fireEvent.transitionEnd(shell, { propertyName: 'transform' });

    expect(shell).toHaveAttribute('data-slide-phase', 'open-settled');
    expect(shell).not.toHaveClass('translate-y-0');
    expect(shell).not.toHaveClass('transition-transform');
    expect(shell).not.toHaveClass('will-change-transform');
  });

  it('slides down from open-settled state on exit request', () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    const navigate = jest.fn();

    render(
      <SearchMobileSlideShell>
        <div>Content</div>
      </SearchMobileSlideShell>,
    );

    const shell = screen.getByTestId('search-mobile-slide-shell');
    fireEvent.transitionEnd(shell, { propertyName: 'transform' });
    expect(shell).toHaveAttribute('data-slide-phase', 'open-settled');

    act(() => {
      requestSearchMobileSlideExit(navigate);
    });

    expect(shell).toHaveAttribute('data-slide-phase', 'closing');
    expect(shell).toHaveClass('translate-y-full', 'ease-in', 'transition-transform', 'will-change-transform');

    fireEvent.transitionEnd(shell, { propertyName: 'transform' });
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
