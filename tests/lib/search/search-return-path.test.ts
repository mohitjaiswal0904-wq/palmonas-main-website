import {
  captureSearchReturnPathFromLocation,
  consumeSearchReturnPath,
  setSearchReturnPath,
} from '@/lib/search/search-return-path';

describe('search-return-path', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('stores a non-search path', () => {
    setSearchReturnPath('/products/ring');
    expect(consumeSearchReturnPath()).toBe('/products/ring');
  });

  it('ignores search paths when setting', () => {
    setSearchReturnPath('/search?q=gold');
    expect(consumeSearchReturnPath()).toBe('/');
  });

  it('captures the current location', () => {
    window.history.replaceState({}, '', '/products/celeste-ring?color=gold');
    captureSearchReturnPathFromLocation();
    expect(consumeSearchReturnPath()).toBe('/products/celeste-ring?color=gold');
  });

  it('defaults to home when nothing was stored', () => {
    expect(consumeSearchReturnPath()).toBe('/');
  });

  it('clears the stored path after consume', () => {
    setSearchReturnPath('/collections/rings');
    expect(consumeSearchReturnPath()).toBe('/collections/rings');
    expect(consumeSearchReturnPath()).toBe('/');
  });
});
