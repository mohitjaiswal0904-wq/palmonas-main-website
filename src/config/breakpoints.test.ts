import { breakpoints, minWidthQuery } from '@/config/breakpoints';

describe('breakpoints', () => {
  it('minWidthQuery returns mobile-first min-width media query', () => {
    expect(minWidthQuery('tab')).toBe('(min-width: 768px)');
  });

  it('defines breakpoints in ascending order', () => {
    const widths = Object.values(breakpoints);
    expect(widths).toEqual([...widths].sort((a, b) => a - b));
  });
});
