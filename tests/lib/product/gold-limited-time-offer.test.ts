import {
  resolveGoldLimitedTimeOffer,
  type GoldLimitedTimeOfferView,
} from '@/lib/product/gold-limited-time-offer';
import type { ProductOffer } from '@/types/product';

jest.mock('@/config/product/product.config', () => {
  const actual = jest.requireActual('@/config/product/product.config');
  return {
    ...actual,
    isProductFeatureEnabled: jest.fn((key: string) =>
      key === 'goldLimitedTimeOffer' ? mockEnabled : actual.isProductFeatureEnabled(key),
    ),
  };
});

let mockEnabled = true;

const mockOffer: ProductOffer = {
  key: 'GOLD3000',
  name: 'Flat 15% off on MRP',
  description: 'Flat 15% off on orders below Rs 20k/-',
  code: 'GOLD3000',
  type: 'DISCOUNT',
  discountValue: 3000,
  placeholder: [{ text: 'Limited deal', style: 'normal' }],
};

const freebieOffer: ProductOffer = {
  key: 'MANGALSUTRA252',
  name: 'Freebie worth ₹9200',
  description: 'Free gold pendant worth Rs 9200/- for orders above 20k',
  code: 'MANGALSUTRA252',
  type: 'FREEBIE',
  discountValue: 25,
  discountCategory: 'display',
  placeholder: [],
  freebieImageUrl:
    'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/08/Frame-2613392-1-cbfc584c.png',
  freebieRoute: '/products/8943146729729',
};

describe('resolveGoldLimitedTimeOffer', () => {
  beforeEach(() => {
    mockEnabled = true;
  });

  it('returns null when feature disabled', () => {
    mockEnabled = false;
    expect(resolveGoldLimitedTimeOffer([mockOffer])).toBeNull();
    expect(resolveGoldLimitedTimeOffer([])).toBeNull();
  });

  it('returns null when offers empty', () => {
    expect(resolveGoldLimitedTimeOffer([])).toBeNull();
  });

  it('maps API name and description with coupon when applicable', () => {
    const result = resolveGoldLimitedTimeOffer([mockOffer]);
    expect(result).toEqual({
      title: 'Flat 15% off on MRP',
      description: 'Flat 15% off on orders below Rs 20k/-',
      code: 'GOLD3000',
      showCouponCode: true,
      freebieImageUrl: '',
      freebieRoute: '',
      showViewDetails: false,
    } satisfies GoldLimitedTimeOfferView);
  });

  it('hides coupon code for display-only offers', () => {
    const result = resolveGoldLimitedTimeOffer([
      {
        ...mockOffer,
        discountCategory: 'display',
        code: 'MANGALSUTRA251',
        key: 'MANGALSUTRA251',
      },
    ]);

    expect(result).toEqual({
      title: 'Flat 15% off on MRP',
      description: 'Flat 15% off on orders below Rs 20k/-',
      code: '',
      showCouponCode: false,
      freebieImageUrl: '',
      freebieRoute: '',
      showViewDetails: false,
    } satisfies GoldLimitedTimeOfferView);
  });

  it('prefers freebie offers with images and maps View Details', () => {
    const result = resolveGoldLimitedTimeOffer([mockOffer, freebieOffer]);

    expect(result).toEqual({
      title: 'Freebie worth ₹9200',
      description: 'View Details',
      code: '',
      showCouponCode: false,
      freebieImageUrl: freebieOffer.freebieImageUrl ?? '',
      freebieRoute: '/products/8943146729729',
      showViewDetails: true,
    } satisfies GoldLimitedTimeOfferView);
  });

  it('returns null when API offer has no name and no description', () => {
    const result = resolveGoldLimitedTimeOffer([
      {
        ...mockOffer,
        name: '',
        description: '',
        placeholder: [],
        key: 'B2G1',
        code: 'B2G1',
      },
    ]);

    expect(result).toBeNull();
  });

  it('uses placeholder text for description when description empty', () => {
    const result = resolveGoldLimitedTimeOffer([
      {
        ...mockOffer,
        description: '',
        placeholder: [{ text: 'Extra savings this week', style: 'normal' }],
      },
    ]);

    expect(result?.description).toBe('Extra savings this week');
    expect(result?.title).toBe('Flat 15% off on MRP');
  });

  it('returns null when no offer fields are usable', () => {
    const result = resolveGoldLimitedTimeOffer([
      {
        key: '',
        name: '',
        description: '',
        code: '',
        type: 'DISCOUNT',
        placeholder: [],
      },
    ]);

    expect(result).toBeNull();
  });
});
