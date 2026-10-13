import {
  CART_CACHE_MS,
  cartConfig,
  cartMessages,
  cartTheme,
  formatCartHeaderItemCount,
  formatLineDiscountAppliedLabel,
  formatRemoveVariantA11y,
  formatRemoveVariantQty,
  formatStickyAddToCartA11y,
  formatStickyAddToCartLabel,
  formatVariantLabel,
  getCheckoutProvider,
  getCartCheckoutUtmParams,
  getCheckoutUtmParams,
  getVariantDisplayLines,
  isCartFeatureEnabled,
  isCheckoutEnabled,
  isShopifyCheckoutFallbackEnabled,
} from '@/config/cart/cart.config';
import { cartTokens } from '@/config/theme/cart.tokens';

describe('cart.config', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('exposes cache timing constants', () => {
    expect(CART_CACHE_MS).toBe(300_000);
    expect(cartConfig.statsThrottleMs).toBe(5_000);
  });

  it('checkout is enabled for sandbox QA', () => {
    expect(isCheckoutEnabled()).toBe(true);
    expect(cartMessages.errors.checkoutSdkNotReady).toBeTruthy();
    expect(cartConfig.checkout.scriptVersion).toBe('v4');
    expect(cartConfig.checkout.provider).toBe('gokwik');
    expect(cartConfig.checkout.shopifyFallback).toBe(false);
    expect(getCheckoutProvider()).toBe('gokwik');
    expect(isShopifyCheckoutFallbackEnabled()).toBe(false);
    expect(cartMessages.toasts.openingShopifyCheckout).toBeTruthy();
    expect(cartMessages.errors.checkoutUrlMissing).toBeTruthy();
  });

  it('address feature is disabled with mock data available', () => {
    expect(cartConfig.features.address.enabled).toBe(false);
    expect(cartConfig.mock.addresses.length).toBeGreaterThan(0);
  });

  it('exposes cart messages for localization', () => {
    expect(cartMessages.errors.addItem).toBe('Failed to add item to cart');
    expect(cartMessages.toasts.addItem).toBe('Product has been added to your cart');
    expect(cartMessages.validation.outOfStock).toBe('Product is currently out of stock');
    expect(cartMessages.outOfStockCta).toBe('OUT OF STOCK');
    expect(cartMessages.outOfStock).toBe('Out of Stock');
    expect(cartMessages.a11y.outOfStock).toBe('Out of stock');
    expect(cartMessages.a11y.openCart).toBe('Open cart');
    expect(cartMessages.a11y.viewProduct).toBe('View {name}');
    expect(cartMessages.removeVariantTitle).toBe('Choose options');
    expect(cartMessages.inCartVariants).toBe('In your cart');
    expect(cartMessages.addAnotherVariant).toBe('Add another');
    expect(cartMessages.a11y.removeVariant).toBe('Remove {label}, quantity {count}');
    expect(cartMessages.totalPayable).toBe('Estimated Total');
    expect(cartMessages.mrp).toBe('MRP total');
    expect(cartMessages.sellingPrice).toBe('Cart Subtotal');
    expect(cartMessages.mrpDiscount).toBe('Discount on MRP');
    expect(cartMessages.prepaidDiscount).toBe('Prepaid Discount');
    expect(cartMessages.prepaidPending).toBe('To be calculated');
    expect(cartMessages.totalSavings).toBe('Total savings');
    expect(cartMessages.a11y.prepaidInfo).toBe('Prepaid discount is calculated at checkout');
    expect(cartMessages.discounts.storeOffers).toBe('Store Offers');
    expect(cartMessages.discounts.paymentOffers).toBe('Payment Offers');
    expect(cartMessages.discounts.empty).toBe(
      'Add eligible items to your cart to unlock available offers',
    );
    expect(cartMessages.discounts.unavailableHint).toBe(
      'Add the required items to unlock this offer',
    );
    expect(cartMessages.couponWithCode).toBe('Coupon ({code})');
    expect(cartMessages.discounts.saveAmount).toBe('Save ₹{amount}');
    expect(cartMessages.errors.fetchDiscounts).toBeTruthy();
    expect(cartMessages.errors.applyDiscount).toBeTruthy();
    expect(cartMessages.errors.couponNotApplicable).toBe(
      'This coupon is not applicable for these cart products.',
    );
    expect(cartMessages.toasts.couponRemoved).toBeTruthy();
    expect(cartMessages.a11y.applyCoupon).toBeTruthy();
    expect(cartMessages.a11y.updatingQuantity).toBe('Updating quantity');
    expect(cartMessages.lineDiscountApplied).toBe('{title} Applied');
    expect(cartMessages.lineDiscountPercentApplied).toBe('Flat {percent}% Off Applied');
    expect(cartMessages.a11y.lineDiscountsApplied).toBe('Applied discounts');
    expect(cartMessages.freeGiftOneItemNudge).toBe('Add ₹{amount} for free studs');
    expect(cartMessages.savedLabel).toBe('Saved');
    expect(cartMessages.haveACode).toBe('Have a code?');
    expect(cartMessages.moreOffers).toBe('More offers');
    expect(cartMessages.changeOffer).toBe('Change');
    expect(cartMessages.swapOffer).toBe('Swap');
    expect(cartMessages.swapExtraSaved).toBe('+{amount} extra');
    expect(cartConfig.mock.freeGift?.oneItemMaxRemaining).toBe(1999);
  });

  it('exposes mock feature preview data', () => {
    expect(cartConfig.mock.offers.length).toBeGreaterThan(0);
    expect(cartConfig.mock.giftCard?.balance).toBeGreaterThan(0);
    expect(cartConfig.mock.limitedTimeOffers?.endsInMinutes).toBeGreaterThan(0);
    expect(cartConfig.mock.coupons?.length).toBeGreaterThan(0);
  });

  it('exposes Figma-aligned theme tokens from global theme config', () => {
    expect(cartTheme).toBe(cartTokens);
    expect(cartTheme.successGreen).toBe('#00A02B');
    expect(cartTheme.outOfStock).toBe('#A33B35');
    expect(cartTheme.outOfStockBadge).toBe('#E11D2E');
    expect(cartTheme.outOfStockBadgeClass).toContain('inset-x-0');
    expect(cartTheme.outOfStockBadgeClass).toContain('w-full');
    expect(cartTheme.outOfStockMutedClass).toContain('opacity-50');
    expect(cartTheme.checkoutCta).toBe('#151515');
    expect(cartTheme.couponAppliedSolid).toBe('#00A02B');
    expect(cartTheme.couponAvailableBg).toBe('#E5F6EA');
    expect(cartTheme.couponSectionBorder).toBe('rgba(0, 160, 43, 0.18)');
    expect(cartTheme.couponSeeAllText).toBe('#006045');
    expect(cartTheme.lineDiscountAppliedBg).toBe('#006045');
    expect(cartTheme.lineDiscountAppliedText).toBe('#ffffff');
    expect(cartTheme.couponRemoveText).toBe('#c01d4a');
    expect(cartTheme.offerAppliedBg).toBe('rgba(0, 160, 43, 0.1)');
    expect(cartTheme.inputBg).toBe('#f8fafc');
    expect(cartTheme.formInputBg).toBe('#f8fafc');
    expect(cartTheme.formInputPlaceholder).toBe('#64748b');
    expect(cartTheme.giftCardBonus).toBe('#E17100');
    expect(cartTheme.giftItemBg).toBe('#fafafa');
    expect(cartTheme.giftItemBadgeText).toBe('#008236');
    expect(cartMessages.giftItemYours).toBe('Yours');
    expect(cartConfig.mock.freeGift?.gift?.name).toBe('Plain Ball Stud Earrings');
    expect(cartConfig.mock.freeGift?.gift?.handle).toBe('7848519926017');
    expect(cartConfig.mock.freeGift?.gift?.worthAmount).toBe(1495);
    expect(cartTheme.giftCardGradient).toContain('#FFEBB4');
    expect(cartTheme.redemptionPanelBg).toBe('#F7F7F7');
    expect(cartTheme.quantityTrack).toBe('#ECE2DF');
    expect(cartTheme.quantityPlus).toBe('#977979');
    expect(cartTheme.addressBarBg).toBe('#F8F8F8');
    expect(cartTheme.ltoBadgeBg).toBe('#FFFFFF');
    expect(cartTheme.ltoBadgeGradient).toBe(
      'linear-gradient(90deg, #FFF 0%, rgba(255, 255, 255, 0.00) 100%)',
    );
    expect(cartTheme.ltoGradient).toContain('#F4F4F4');
    expect(cartTheme.ltoGradient).toContain('0.3');
    expect(cartTheme.addToCartFlight.durationMs).toBe(760);
    expect(cartTheme.addToCartFlight.swallowClass).toBe('cart-fly-swallow');
    expect(cartTheme.addToCartFlight.chipClass).toContain('cart-fly-chip');
    expect(cartMessages.orderSummary).toBe('Order Summary');
    expect(cartMessages.recommendedForYou).toBe('Limited Time Offer');
    expect(cartConfig.recommendedUpsell.productIds).toEqual([
      '9165338640641',
      '9012638253313',
      '8992895303937',
    ]);
    expect(isCartFeatureEnabled('recommendedUpsell')).toBe(true);
    expect(cartMessages.seeAllCoupons).toBe('See all coupons');
    expect(cartMessages.offersAndCoupons).toBe('Offers & Coupons');
    expect(cartMessages.offerStub).toBe('OFFER');
    expect(cartMessages.appliedStub).toBe('APPLIED');
    expect(cartMessages.itemCount).toBe('({count} items)');
    expect(cartMessages.itemCountOne).toBe('({count} item)');
    expect(formatCartHeaderItemCount(3)).toBe('(3 items)');
    expect(formatCartHeaderItemCount(1)).toBe('(1 item)');
    expect(formatRemoveVariantQty(2)).toBe('Qty 2');
    expect(formatStickyAddToCartLabel(0)).toBe('Add to Cart');
    expect(formatStickyAddToCartLabel(2)).toBe('Add to Cart (2)');
    expect(formatStickyAddToCartA11y(0)).toBe('Add to cart');
    expect(formatStickyAddToCartA11y(2)).toBe('Add to cart, 2 already in cart');
    expect(formatRemoveVariantA11y('Size : 6', 1)).toBe('Remove Size : 6, quantity 1');
    expect(formatLineDiscountAppliedLabel('mega40')).toBe('mega40 Applied');
    expect(formatLineDiscountAppliedLabel('Flat 40% Off', 40)).toBe('Flat 40% Off Applied');
    expect(formatLineDiscountAppliedLabel('Already Applied')).toBe('Already Applied');
    expect(formatLineDiscountAppliedLabel('')).toBe('');
    expect(cartMessages.allOffers).toBe('All Offers');
    expect(cartConfig.mock.allOffers?.length).toBeGreaterThan(0);
    expect(cartConfig.mock.allGiftCards?.length).toBeGreaterThan(0);
    expect(cartConfig.mock.limitedTimeOffers?.products?.[0]?.swatches?.length).toBe(3);
  });

  it('formats variant labels with Colour prefix', () => {
    expect(formatVariantLabel('Rose Gold')).toBe('Colour : Rose Gold');
    expect(formatVariantLabel('8')).toBe('Size : 8');
    expect(formatVariantLabel('')).toBe('');
    expect(formatVariantLabel('Default Title')).toBe('');
  });

  it('parses variant titles into Colour and Size display lines', () => {
    expect(getVariantDisplayLines('Rose Gold')).toEqual([{ label: 'Colour', value: 'Rose Gold' }]);
    expect(getVariantDisplayLines('8')).toEqual([{ label: 'Size', value: '8' }]);
    expect(getVariantDisplayLines('A')).toEqual([{ label: 'Letter', value: 'A' }]);
    expect(getVariantDisplayLines('b')).toEqual([{ label: 'Letter', value: 'b' }]);
    expect(getVariantDisplayLines('Rose Gold / B')).toEqual([
      { label: 'Colour', value: 'Rose Gold' },
      { label: 'Letter', value: 'B' },
    ]);
    expect(getVariantDisplayLines('Default Title')).toEqual([]);
    expect(getVariantDisplayLines('Rose Gold / 7')).toEqual([
      { label: 'Colour', value: 'Rose Gold' },
      { label: 'Size', value: '7' },
    ]);
    expect(getVariantDisplayLines('9KT Yellow Gold / 7')).toEqual([
      { label: 'Colour', value: '9KT Yellow Gold' },
      { label: 'Size', value: '7' },
    ]);
    expect(getVariantDisplayLines('Black / L-60 cm x W-3 mm')).toEqual([
      { label: 'Colour', value: 'Black' },
      { label: 'Length', value: 'L-60 cm x W-3 mm' },
    ]);
  });

  it('reports enabled cart feature flags from config', () => {
    expect(cartConfig.recommendedUpsell.productIds).toEqual([
      '9165338640641',
      '9012638253313',
      '8992895303937',
    ]);
    expect(isCartFeatureEnabled('offers')).toBe(true);
    expect(isCartFeatureEnabled('recommendedUpsell')).toBe(true);
    expect(isCartFeatureEnabled('wallet')).toBe(false);
    expect(isCartFeatureEnabled('address')).toBe(false);
    expect(isCartFeatureEnabled('limitedTimeOffers')).toBe(false);
  });

  it('prefixes buy-now checkout utm_source as new_website_{original}', () => {
    expect(getCheckoutUtmParams()).toEqual({
      utm_source: 'new_website',
      utm_medium: 'web',
      utm_campaign: 'web_checkout',
    });
    expect(getCheckoutUtmParams({ utm_source: 'direct', utm_campaign: 'sale' }, 'buy_now')).toEqual(
      {
        utm_source: 'new_website_direct',
        utm_medium: 'web',
        utm_campaign: 'sale',
      },
    );
  });

  it('prefixes landing utm_source for cart checkout (e.g. meta → new_website_meta)', () => {
    localStorage.setItem(
      cartConfig.constants.landingUtmStorageKey,
      JSON.stringify({ utm_source: 'meta', utm_medium: 'email', utm_campaign: 'monsoon' }),
    );

    expect(getCartCheckoutUtmParams()).toEqual({
      utm_source: 'new_website_meta',
      utm_medium: 'email',
      utm_campaign: 'monsoon',
    });
  });

  it('uses new_website when cart landing UTMs omit source', () => {
    localStorage.setItem(
      cartConfig.constants.landingUtmStorageKey,
      JSON.stringify({ utm_medium: 'email', utm_campaign: 'monsoon' }),
    );

    expect(getCartCheckoutUtmParams()).toEqual({
      utm_source: 'new_website',
      utm_medium: 'email',
      utm_campaign: 'monsoon',
    });
  });

  it('returns false for disabled or missing feature flags', () => {
    expect(isCartFeatureEnabled('bundleDeal' as keyof typeof cartConfig.features)).toBe(
      cartConfig.features.bundleDeal?.enabled === true,
    );
    expect(formatVariantLabel('')).toBe('');
  });
});
