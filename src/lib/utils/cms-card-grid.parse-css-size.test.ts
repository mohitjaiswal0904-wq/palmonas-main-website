import {
  CMS_CARD_GRID_LAPTOP_SCALE,
  CMS_CARD_GRID_TAB_SCALE,
  cmsCardGridTestUtils,
} from '@/lib/utils/cms-card-grid';

const { parseCssSize, scaleCssSize } = cmsCardGridTestUtils;

describe('parseCssSize', () => {
  it('parses vw and px values', () => {
    expect(parseCssSize('76vw')).toEqual({ kind: 'length', value: 76, unit: 'vw' });
    expect(parseCssSize('120px')).toEqual({ kind: 'length', value: 120, unit: 'px' });
  });

  it('parses auto and returns undefined for empty input', () => {
    expect(parseCssSize('auto')).toEqual({ kind: 'auto' });
    expect(parseCssSize('')).toBeUndefined();
    expect(parseCssSize(undefined)).toBeUndefined();
  });
});

describe('scaleCssSize', () => {
  it('scales px with tab and laptop multipliers', () => {
    const parsed = parseCssSize('200px')!;

    expect(scaleCssSize(parsed, CMS_CARD_GRID_TAB_SCALE)).toBe('150px');
    expect(scaleCssSize(parsed, CMS_CARD_GRID_LAPTOP_SCALE)).toBe('80px');
  });

  it('preserves auto and keyword values', () => {
    expect(scaleCssSize(parseCssSize('auto')!, CMS_CARD_GRID_TAB_SCALE)).toBe('auto');
  });
});
