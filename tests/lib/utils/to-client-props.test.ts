import { toClientProps } from '@/lib/utils/to-client-props';

describe('toClientProps', () => {
  it('omits undefined object fields', () => {
    const result = toClientProps({
      name: 'Mangalsutra',
      freebieImageUrl: undefined,
      sku: null,
    });

    expect(result).toEqual({ name: 'Mangalsutra', sku: null });
    expect('freebieImageUrl' in result).toBe(false);
  });

  it('omits undefined fields nested in arrays', () => {
    const result = toClientProps({
      offers: [{ key: 'SAVE', freebieRoute: undefined }],
    });
    const offer = result.offers[0];

    expect(offer).toEqual({ key: 'SAVE' });
    expect(offer && 'freebieRoute' in offer).toBe(false);
  });

  it('keeps numbers including zero', () => {
    expect(toClientProps({ discountValue: 0, max: 206187.86 })).toEqual({
      discountValue: 0,
      max: 206187.86,
    });
  });

  it('round-trips nested listing payloads', () => {
    const payload = {
      productsPages: [
        {
          items: [{ id: '1', offers: [{ key: 'A', placeholder: [{ text: '₹1', style: 'bold' }] }] }],
        },
      ],
    };

    expect(toClientProps(payload)).toEqual(payload);
  });

  it('throws on circular references', () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;

    expect(() => toClientProps(circular)).toThrow(TypeError);
  });

  it('drops functions so the clone stays JSON-only', () => {
    expect(toClientProps({ id: '1', fn: () => 1 })).toEqual({ id: '1' });
  });
});
