import {
  buildButtonGridContainerStyle,
  resolveButtonGridMobileColumns,
} from '@/lib/utils/cms-button-grid';

describe('resolveButtonGridMobileColumns', () => {
  it('uses API columns when provided', () => {
    expect(resolveButtonGridMobileColumns(3)).toBe(3);
  });

  it('falls back when columns are missing or invalid', () => {
    expect(resolveButtonGridMobileColumns(undefined, 2)).toBe(2);
    expect(resolveButtonGridMobileColumns(0, 4)).toBe(4);
  });
});

describe('buildButtonGridContainerStyle', () => {
  it('builds a mobile grid template with optional spacing', () => {
    expect(buildButtonGridContainerStyle(2, { gap: '16px' })).toEqual({
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '16px',
    });
  });
});
