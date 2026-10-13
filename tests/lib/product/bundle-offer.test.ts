import { parseBuyNAtOffer } from '@/lib/product/bundle-offer';
import type { ProductOffer } from '@/types/product';

const offer = (name: string): ProductOffer => ({
  key: 'offer',
  name,
  description: 'Special discount on purchase of 4 items',
  code: 'BLING4',
  type: 'DISCOUNT',
  discountValue: 2999,
  placeholder: [],
});

describe('parseBuyNAtOffer', () => {
  it('splits a Buy-N-At bundle into quantity and unit price', () => {
    expect(parseBuyNAtOffer(offer('Buy 4 At ₹2999'))).toEqual({
      quantity: 4,
      bundlePrice: 2999,
      unitPrice: 749.75,
    });
  });

  it('parses comma-formatted bundle totals', () => {
    expect(parseBuyNAtOffer(offer('Buy 4 At ₹2,999'))).toEqual({
      quantity: 4,
      bundlePrice: 2999,
      unitPrice: 749.75,
    });
  });

  it('parses Get-any-N-for bundle titles', () => {
    expect(parseBuyNAtOffer(offer('Get any 2 for ₹1899'))).toEqual({
      quantity: 2,
      bundlePrice: 1899,
      unitPrice: 949.5,
    });
    expect(parseBuyNAtOffer(offer('Get any 3 for ₹2699'))).toEqual({
      quantity: 3,
      bundlePrice: 2699,
      unitPrice: 2699 / 3,
    });
  });

  it('returns null when the offer is not a multi-buy deal', () => {
    expect(parseBuyNAtOffer(offer('Extra 10% Off'))).toBeNull();
    expect(parseBuyNAtOffer(offer('Get it for ₹3,266'))).toBeNull();
  });

  it('returns null when quantity is less than two', () => {
    expect(parseBuyNAtOffer(offer('Buy 1 At ₹2999'))).toBeNull();
  });
});
