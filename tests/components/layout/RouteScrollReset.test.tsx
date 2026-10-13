import { act, render } from '@testing-library/react';

import { RouteScrollReset } from '@/components/layout/RouteScrollReset';

const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('RouteScrollReset', () => {
  const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.hash = '';
  });

  afterAll(() => {
    scrollToSpy.mockRestore();
  });

  it('does not scroll on first commit', () => {
    mockUsePathname.mockReturnValue('/collections/best-sellers');

    render(<RouteScrollReset />);

    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('scrolls to the top when the pathname changes', () => {
    mockUsePathname.mockReturnValue('/collections/best-sellers');
    const { rerender } = render(<RouteScrollReset />);

    mockUsePathname.mockReturnValue('/collections/new-arrivals');
    rerender(<RouteScrollReset />);

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('leaves scroll alone when only the query changed', () => {
    mockUsePathname.mockReturnValue('/collections/best-sellers');
    const { rerender } = render(<RouteScrollReset />);

    // Filter/sort navigations keep the pathname — the shopper must stay put.
    rerender(<RouteScrollReset />);

    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('leaves scroll alone for back/forward navigation', () => {
    mockUsePathname.mockReturnValue('/collections/best-sellers');
    const { rerender } = render(<RouteScrollReset />);

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    mockUsePathname.mockReturnValue('/collections/new-arrivals');
    rerender(<RouteScrollReset />);

    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('leaves scroll alone when the destination has a hash target', () => {
    mockUsePathname.mockReturnValue('/collections/best-sellers');
    const { rerender } = render(<RouteScrollReset />);

    window.location.hash = '#size-guide';
    mockUsePathname.mockReturnValue('/products/ring');
    rerender(<RouteScrollReset />);

    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('scrolls again on a later pathname change after a back navigation', () => {
    mockUsePathname.mockReturnValue('/a');
    const { rerender } = render(<RouteScrollReset />);

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    mockUsePathname.mockReturnValue('/b');
    rerender(<RouteScrollReset />);
    expect(scrollToSpy).not.toHaveBeenCalled();

    // The popstate flag must be one-shot, or every later click stops resetting.
    mockUsePathname.mockReturnValue('/c');
    rerender(<RouteScrollReset />);

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });
});
