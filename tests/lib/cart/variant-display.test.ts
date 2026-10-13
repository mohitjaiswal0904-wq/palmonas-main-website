import {
  formatProductCartLineLabel,
  formatVariantLabel,
  getVariantDisplayLines,
} from '@/lib/cart/variant-display';

describe('formatProductCartLineLabel', () => {
  it('uses the variant title when it has a size', () => {
    expect(formatProductCartLineLabel({ variantTitle: '6' })).toBe('Size : 6');
  });

  it('joins colour and size from a slash title', () => {
    expect(formatVariantLabel('Gold / 7')).toBe('Colour : Gold');
    expect(formatProductCartLineLabel({ variantTitle: 'Gold / 7' })).toBe('Colour : Gold');
  });

  it('falls back to size when the title is missing', () => {
    expect(formatProductCartLineLabel({ size: '8' })).toBe('Size : 8');
  });

  it('returns empty when no usable option fields exist', () => {
    expect(formatProductCartLineLabel({})).toBe('');
    expect(formatProductCartLineLabel({ variantTitle: 'Default Title' })).toBe('');
  });
});

describe('getVariantDisplayLines — chain colour / length', () => {
  it('labels colour and length when the second segment matches L cm x W mm', () => {
    expect(getVariantDisplayLines('Black / L-60 cm x W-3 mm')).toEqual([
      { label: 'Colour', value: 'Black' },
      { label: 'Length', value: 'L-60 cm x W-3 mm' },
    ]);
  });

  it('shows length only for a single dimension title', () => {
    expect(getVariantDisplayLines('L-50 cm x L-3 mm')).toEqual([
      { label: 'Length', value: 'L-50 cm x L-3 mm' },
    ]);
  });

  it('falls back to heuristics when the second segment is not a chain dimension', () => {
    expect(getVariantDisplayLines('Rose Gold / 7')).toEqual([
      { label: 'Colour', value: 'Rose Gold' },
      { label: 'Size', value: '7' },
    ]);
  });

  it('does not treat a non-matching second segment as length', () => {
    expect(getVariantDisplayLines('Black / Matte')).toEqual([
      { label: 'Colour', value: 'Black' },
      { label: 'Colour', value: 'Matte' },
    ]);
  });
});
