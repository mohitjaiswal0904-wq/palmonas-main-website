import {
  registerSearchMobileSlideExit,
  requestSearchMobileSlideExit,
} from '@/lib/search/search-mobile-slide';

describe('search-mobile-slide', () => {
  afterEach(() => {
    // Ensure no leftover shell handler leaks across tests (module singleton).
    registerSearchMobileSlideExit(() => false)();
  });

  it('runs navigate immediately when no shell is registered', () => {
    const navigate = jest.fn();

    expect(requestSearchMobileSlideExit(navigate)).toBe(false);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('delegates to the registered shell handler', () => {
    const navigate = jest.fn();
    const handler = jest.fn(() => true);
    const unsubscribe = registerSearchMobileSlideExit(handler);

    expect(requestSearchMobileSlideExit(navigate)).toBe(true);
    expect(handler).toHaveBeenCalledWith(navigate);
    expect(navigate).not.toHaveBeenCalled();

    unsubscribe();
  });

  it('falls back to immediate navigate after unsubscribe', () => {
    const navigate = jest.fn();
    const unsubscribe = registerSearchMobileSlideExit(() => true);
    unsubscribe();

    expect(requestSearchMobileSlideExit(navigate)).toBe(false);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('replaces the previous handler when a new shell registers', () => {
    const first = jest.fn(() => true);
    const second = jest.fn(() => true);
    const unsubscribeFirst = registerSearchMobileSlideExit(first);
    const unsubscribeSecond = registerSearchMobileSlideExit(second);

    requestSearchMobileSlideExit(jest.fn());

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);

    unsubscribeFirst();
    unsubscribeSecond();
  });
});
