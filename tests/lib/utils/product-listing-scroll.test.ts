import { scrollProductListingIntoView } from '@/lib/utils/product-listing-scroll';

describe('scrollProductListingIntoView', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 500, writable: true });
    jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('scrolls so the listing sits just below the sticky offset', () => {
    const listingEl = document.createElement('div');
    jest.spyOn(listingEl, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      bottom: 400,
      left: 0,
      right: 0,
      width: 0,
      height: 200,
      x: 0,
      y: 200,
      toJSON: () => ({}),
    });

    const didScroll = scrollProductListingIntoView(listingEl, 64);

    expect(didScroll).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 636, behavior: 'auto' });
  });

  it('clamps negative targets to 0', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 10, writable: true });
    const listingEl = document.createElement('div');
    jest.spyOn(listingEl, 'getBoundingClientRect').mockReturnValue({
      top: 20,
      bottom: 40,
      left: 0,
      right: 0,
      width: 0,
      height: 20,
      x: 0,
      y: 20,
      toJSON: () => ({}),
    });

    scrollProductListingIntoView(listingEl, 64);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('returns false when listing element is missing', () => {
    expect(scrollProductListingIntoView(null, 64)).toBe(false);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('returns false when listing element is missing without sticky offset', () => {
    expect(scrollProductListingIntoView(null)).toBe(false);
  });
});
