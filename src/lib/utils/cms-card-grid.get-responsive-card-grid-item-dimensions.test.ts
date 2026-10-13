import { getResponsiveCardGridItemDimensions } from '@/lib/utils/cms-card-grid';

describe('getResponsiveCardGridItemDimensions', () => {
  it('builds runtime width utilities instead of a shared css class', () => {
    const result = getResponsiveCardGridItemDimensions('76vw', 'auto');

    expect(result.className).toContain('shrink-0');
    expect(result.className).toContain('w-[76vw]');
    expect(result.className).toContain('tab:w-[57vw]');
    expect(result.className).toContain('laptop:w-[30.4vw]');
    expect(result.className).not.toContain('h-[');
  });

  it('matches legacy 80vw → 60vw → 32vw progression', () => {
    const result = getResponsiveCardGridItemDimensions('80vw');

    expect(result.className).toContain('w-[80vw]');
    expect(result.className).toContain('tab:w-[60vw]');
    expect(result.className).toContain('laptop:w-[32vw]');
  });

  it('includes height utilities when API height is a length', () => {
    const result = getResponsiveCardGridItemDimensions('55vw', '120px');

    expect(result.className).toContain('w-[55vw]');
    expect(result.className).toContain('h-[120px]');
    expect(result.className).toContain('tab:h-[90px]');
    expect(result.className).toContain('laptop:h-[48px]');
  });

  it('returns only shrink-0 when width and height are missing', () => {
    expect(getResponsiveCardGridItemDimensions().className).toBe('shrink-0');
  });
});
