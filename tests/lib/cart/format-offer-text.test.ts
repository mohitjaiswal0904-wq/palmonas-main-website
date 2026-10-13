import { toOfferDisplayCaps } from '@/lib/cart/format-offer-text';

describe('toOfferDisplayCaps', () => {
  it('uppercases mixed-case offer codes', () => {
    expect(toOfferDisplayCaps('buy3')).toBe('BUY3');
  });

  it('uppercases multi-word offer titles', () => {
    expect(toOfferDisplayCaps('Buy One get one free')).toBe('BUY ONE GET ONE FREE');
  });

  it('keeps already-uppercased strings', () => {
    expect(toOfferDisplayCaps('DISCOUNT')).toBe('DISCOUNT');
  });

  it('returns empty string for empty input', () => {
    expect(toOfferDisplayCaps('')).toBe('');
  });
});
