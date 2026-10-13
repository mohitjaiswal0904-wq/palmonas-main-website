import { resolveGoldDisplayPrice, resolveGoldFinalPrice, resolveGoldShopperPrices } from '@/lib/product/gold-display-price';
import type { MtoPrice } from '@/types/mto-price';

function createMtoPrice(
  totalPrice: number,
  totalPriceWithoutMaking = 0,
): MtoPrice {
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
    showCalculation: true,
    showMakingChargeDiscount: false,
    status: 'ok',
    subtotal: 0,
    title: '',
    totalPrice,
    totalPriceWithoutMaking,
  };
}

describe('resolveGoldDisplayPrice', () => {
  it('uses the live MTO total when it is present', () => {
    expect(resolveGoldDisplayPrice(createMtoPrice(41192), 123)).toBe(41192);
  });

  it('uses the selected variant catalog price when MTO matches listing hydration', () => {
    expect(resolveGoldDisplayPrice(createMtoPrice(29844), 29844)).toBe(29844);
  });

  it('falls back to catalog price when MTO is missing', () => {
    expect(resolveGoldDisplayPrice(undefined, 123)).toBe(123);
  });

  it('falls back to catalog price when MTO total is zero', () => {
    expect(resolveGoldDisplayPrice(createMtoPrice(0), 123)).toBe(123);
  });
});

describe('resolveGoldFinalPrice', () => {
  it('returns the without-making total when it is lower than total_price', () => {
    expect(resolveGoldFinalPrice(createMtoPrice(12807.65, 10886.5))).toBe(10886.5);
    expect(resolveGoldFinalPrice(createMtoPrice(57_090, 54_590))).toBe(54_590);
  });

  it('returns undefined when MTO is missing', () => {
    expect(resolveGoldFinalPrice(undefined)).toBeUndefined();
  });

  it('returns undefined when without-making is missing or equal', () => {
    expect(resolveGoldFinalPrice(createMtoPrice(10_000))).toBeUndefined();
    expect(resolveGoldFinalPrice(createMtoPrice(10_000, 10_000))).toBeUndefined();
  });

  it('returns undefined when without-making is higher than total_price', () => {
    expect(resolveGoldFinalPrice(createMtoPrice(10_000, 12_000))).toBeUndefined();
  });
});
describe('resolveGoldShopperPrices', () => {
  it('strikes through total_price when it is greater than total_price_without_making', () => {
    expect(resolveGoldShopperPrices(createMtoPrice(12807.65, 10886.5), 123)).toEqual({
      price: 10886.5,
      compareAtPrice: 12807.65,
    });
  });

  it('does not invent a strikethrough when making is not in the MTO total', () => {
    expect(resolveGoldShopperPrices(createMtoPrice(10_000), 123)).toEqual({ price: 10_000 });
    expect(resolveGoldShopperPrices(createMtoPrice(10_000, 10_000), 123)).toEqual({
      price: 10_000,
    });
  });

  it('keeps a higher catalog MRP as strikethrough when MTO has no without-making delta', () => {
    expect(resolveGoldShopperPrices(createMtoPrice(12_000), 12_000, 18_000)).toEqual({
      price: 12_000,
      compareAtPrice: 18_000,
    });
    expect(resolveGoldShopperPrices(createMtoPrice(29_844), 29_844, 35_000)).toEqual({
      price: 29_844,
      compareAtPrice: 35_000,
    });
  });

  it('hides strikethrough when catalog MRP is not higher than the selling price', () => {
    expect(resolveGoldShopperPrices(createMtoPrice(20_000), 20_000, 20_000)).toEqual({
      price: 20_000,
    });
    expect(resolveGoldShopperPrices(createMtoPrice(20_000), 20_000, 18_000)).toEqual({
      price: 20_000,
    });
  });

  it('falls back to catalog selling price when MTO is missing', () => {
    expect(resolveGoldShopperPrices(undefined, 41_192)).toEqual({ price: 41_192 });
  });
});
