import { resolveMakingChargesLabel } from '@/lib/product/making-charges-label';
import { productMessages } from '@/config/product/product.config';
import type { MtoPrice } from '@/types/mto-price';

import { makingChargesLabelFixture } from './gold-pdp.fixtures';

jest.mock('@/config/product/product.config', () => {
  const actual = jest.requireActual('@/config/product/product.config');
  return {
    ...actual,
    isProductFeatureEnabled: jest.fn((key: string) =>
      key === 'makingChargesBadge' ? mockEnabled : actual.isProductFeatureEnabled(key),
    ),
  };
});

let mockEnabled = true;

function createMtoPrice(overrides: Partial<MtoPrice> = {}): MtoPrice {
  return {
    basePrice: 0,
    diamondPrice: 0,
    diamondWeightCarat: 0,
    flatDiscount: 0,
    goldWeightGrams: 0,
    gst: 0,
    makingCharge: 0,
    makingChargeCut: 0,
    makingChargeShow: 500,
    metal: '',
    noOfDiamonds: 0,
    pricePerGram: 0,
    purity: '',
    purityDisplay: '',
    purityRatio: 0,
    showCalculation: false,
    showMakingChargeDiscount: false,
    status: '',
    subtotal: 0,
    title: '',
    totalPrice: 0,
    totalPriceWithoutMaking: 0,
    ...overrides,
  };
}

describe('resolveMakingChargesLabel', () => {
  beforeEach(() => {
    mockEnabled = true;
  });

  it('returns null when feature disabled', () => {
    mockEnabled = false;
    expect(resolveMakingChargesLabel(createMtoPrice({ makingChargeShow: 0 }))).toBeNull();
  });

  it('returns zero label when API signals discount / zero making charge', () => {
    expect(
      resolveMakingChargesLabel(createMtoPrice({ showMakingChargeDiscount: true })),
    ).toBe(makingChargesLabelFixture);
    expect(resolveMakingChargesLabel(createMtoPrice({ makingChargeShow: 0 }))).toBe(
      productMessages.makingChargesZero,
    );
    expect(makingChargesLabelFixture).toBe(productMessages.makingChargesZero);
  });

  it('returns null when price missing', () => {
    expect(resolveMakingChargesLabel(undefined)).toBeNull();
  });

  it('returns null when price present but no zero-charge signal', () => {
    expect(resolveMakingChargesLabel(createMtoPrice({ makingChargeShow: 500 }))).toBeNull();
  });
});
