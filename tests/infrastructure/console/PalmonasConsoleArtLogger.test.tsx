/** @jest-environment jsdom */

import { render } from '@testing-library/react';

const mockLogPalmonasConsoleArt = jest.fn();

jest.mock('@/lib/console/palmonas-console-art', () => ({
  ...jest.requireActual('@/lib/console/palmonas-console-art'),
  logPalmonasConsoleArt: (...args: unknown[]) => mockLogPalmonasConsoleArt(...args),
}));

describe('PalmonasConsoleArtLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('logs art on mount and every five minutes', async () => {
    const { PalmonasConsoleArtLogger } = await import(
      '@/infrastructure/console/PalmonasConsoleArtLogger'
    );

    render(<PalmonasConsoleArtLogger />);

    expect(mockLogPalmonasConsoleArt).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(5 * 60 * 1000);

    expect(mockLogPalmonasConsoleArt).toHaveBeenCalledTimes(2);
  });

  it('clears the interval on unmount', async () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    const { PalmonasConsoleArtLogger } = await import(
      '@/infrastructure/console/PalmonasConsoleArtLogger'
    );

    const { unmount } = render(<PalmonasConsoleArtLogger />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    jest.advanceTimersByTime(5 * 60 * 1000);

    expect(mockLogPalmonasConsoleArt).toHaveBeenCalledTimes(1);

    clearIntervalSpy.mockRestore();
  });
});
