import type { MtoPrice } from '@/types/mto-price';

import { hasGoldPriceBreakup } from '@/lib/product/gold-price-breakup';

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
    makingChargeShow: 0,
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

describe('hasGoldPriceBreakup', () => {
  it('returns false when price is undefined', () => {
    expect(hasGoldPriceBreakup(undefined)).toBe(false);
  });

  it('returns false for empty MTO payloads', () => {
    expect(hasGoldPriceBreakup(createMtoPrice())).toBe(false);
  });

  it('returns true when showCalculation is set', () => {
    expect(hasGoldPriceBreakup(createMtoPrice({ showCalculation: true }))).toBe(true);
  });

  it('returns true when total price and rate are present without showCalculation', () => {
    expect(
      hasGoldPriceBreakup(
        createMtoPrice({
          totalPrice: 12_000,
          pricePerGram: 5_500,
        }),
      ),
    ).toBe(true);
  });
});
