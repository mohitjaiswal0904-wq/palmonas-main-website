import {
  demifinePreDealsConfig,
  demifineStaticOffers,
  diamondGuideContent,
  getProductBundleTitle,
  goldUspImage,
  productUspBadges,
  productUspRules,
  isProductFeatureEnabled,
  productBundleTitles,
  productConfig,
  productMessages,
  productTheme,
  purchaseAssuranceIcons,
  sizeGuideContent,
} from '@/config/product/product.config';
import { productTokens } from '@/config/theme/product.tokens';

describe('product.config', () => {
  it('exposes localization messages for PDP chrome', () => {
    expect(productMessages.inclusiveOfTaxes).toBe('Inclusive of all taxes');
    expect(productMessages.platinumPlated).toBe('Platinum Plated');
    expect(productMessages.usps).toEqual({
      anti_tarnish: 'Anti-Tarnish',
      skin_safe_jewellery: 'Skin Safe Jewellery',
      platinum_plated: 'Platinum Plated',
      gold_plated_14k: '14K Gold Plated',
      sterling_silver_925: '925 Sterling Silver',
      gold_tone_plated: '18K Gold Tone Plated',
      adjustable_rings: 'Adjustable Ring',
    });
    expect(productMessages.diamondGuide).toBe('Diamond Guide');
    expect(productMessages.similarProducts).toBe('Similar Products');
    expect(productMessages.twoDaysReturn).toBe('2 Days Return');
    expect(productMessages.tenDaysExchange).toBe('10 Days Exchange');
    expect(productMessages.cashOnDelivery).toBe('Cash On Delivery');
    expect(productMessages.priceDetails).toBe('Price Details');
    expect(productMessages.grandTotal).toBe('Grand Total');
    expect(productMessages.finalPrice).toBe('Final Price:');
    expect(productMessages.grandTotalInfo).toBe(
      "Displayed prices are calculated based on average weight. Actual weight may differ, and we'll adjust the final amount accordingly.",
    );
    expect(productMessages.a11y.grandTotalInfo).toBe('Price estimation information');
    expect(productMessages.nowLabel).toBe('Fast Delivery');
    expect(productMessages.goldPriceError).toBe('Unable to load live gold pricing. Please try again.');
    expect(productMessages.loadErrorTitle).toBe("Couldn't load this product");
    expect(productMessages.loadErrorCta).toBe('Try again');
    expect(productMessages.moreOffers).toBe('+ {{count}} more');
    expect(productMessages.limitedStock).toEqual({
      prefix: 'Only a ',
      highlight: 'few items',
      suffix: ' left',
    });
    expect(productMessages.sellingFastSuffix).toBe(' sold in the last {{days}} days');
    expect(productMessages.sellingFast).toBe('Selling Fast');
    expect(productMessages.shipsIn24Hours).toBe('Ready to ship');
    expect(productMessages.a11y.shipsIn24Hours).toBe('Ready to ship');
    expect(productMessages.a11y.sellingFastBadge).toBe('Selling Fast');
    expect(productMessages.a11y.stickyBarPrice).toBe('Current product price');
    expect(productMessages.getItByToday).toBe('Get It By Today');
    expect(productMessages.orderWithin).toBe('Order within ');
    expect(productMessages.a11y.openDiamondGuide).toBeTruthy();
    expect(productMessages.a11y.similarProducts).toBe('Similar products');
    expect(productMessages.shopByOffers).toBe('Shop By Offers');
    expect(productMessages.a11y.shopByOffersTabs).toBe('Choose an offer');
    expect(productMessages.a11y.shopByOffersProducts).toBe('Products for this offer');
    expect(productMessages.a11y.purchaseAssurance).toBe('Return, exchange, and cash on delivery');
    expect(productMessages.formatBundleUnitTitle('₹750')).toBe('Get it for ₹750');
    expect(productMessages.formatBundleUnitHint(3, '₹750')).toBe(
      'Add 3 more products to get it for ₹750.',
    );
    expect(productMessages.formatBundleUnitHint(1, '₹950')).toBe(
      'Add 1 more product to get it for ₹950.',
    );
  });

  it('exposes listing-card Get-it-for offer cycle copy', () => {
    expect(productMessages.getItForPrefix).toBe('Get it for ');
    expect(productMessages.getItForSuffix).toBe(' with offers');
    expect(productConfig.timing.cardOfferCycleMs).toBe(5600);
    expect(productConfig.timing.shopByOffersLimit).toBe(12);
  });

  it('exposes PDP bundle rail titles and fallbacks', () => {
    expect(productBundleTitles).toEqual({
      complete_look_product: 'Complete Look',
      shop_the_look: 'Shop the Look',
      save_with_the_set: 'Save with the Set',
    });
    expect(getProductBundleTitle('shop_the_look', 'Shop the Look')).toBe('Shop the Look');
    expect(getProductBundleTitle('complete_look_product', '  ')).toBe('Complete Look');
    expect(getProductBundleTitle('unknown_bundle')).toBe('unknown_bundle');
  });

  it('exposes static diamond and size guide content', () => {
    expect(diamondGuideContent.colour.grades.length).toBe(7);
    expect(diamondGuideContent.clarity.grades.length).toBe(6);
    expect(diamondGuideContent.sheetTitle).toBe('Diamond Details');
    expect(sizeGuideContent.rows.length).toBeGreaterThan(0);
    expect(sizeGuideContent.columns).toHaveLength(4);
  });

  it('exposes product theme tokens from global theme config', () => {
    expect(productTheme).toBe(productTokens);
    expect(productTheme.ink).toBe('#151515');
    expect(productTheme.gold.accent).toBe('#502C3A');
    expect(productTheme.demifine.chipSelected).toBe('#977979');
  });

  it('enables API-ready feature flags by default', () => {
    expect(isProductFeatureEnabled('ratingBadge')).toBe(true);
    expect(isProductFeatureEnabled('stockLabel')).toBe(true);
    expect(isProductFeatureEnabled('diamondGuide')).toBe(true);
    expect(isProductFeatureEnabled('eddInfoTooltip')).toBe(true);
    expect(isProductFeatureEnabled('limitedTimeOfferChrome')).toBe(true);
    expect(isProductFeatureEnabled('pincodeChecker')).toBe(true);
  });

  it('keeps API-gated features disabled until payload exists', () => {
    expect(isProductFeatureEnabled('sellingFastBadge')).toBe(false);
    expect(isProductFeatureEnabled('expressDeliveryStrip')).toBe(false);
    expect(isProductFeatureEnabled('makingChargesBadge')).toBe(false);
    expect(isProductFeatureEnabled('writeProductReview')).toBe(false);
    expect(isProductFeatureEnabled('reviewVotes')).toBe(false);
    expect(productConfig.features.sellingFastBadge.enabled).toBe(false);
    expect(productConfig.features.makingChargesBadge.enabled).toBe(false);
    expect(productConfig.features.writeProductReview.enabled).toBe(false);
    expect(productConfig.features.reviewVotes.enabled).toBe(false);
    expect(productMessages.reviews.writeReviewComingSoon).toBe(
      'Submitting reviews will be enabled soon.',
    );
  });

  it('exposes Shopify purchase-assurance icon URLs', () => {
    expect(purchaseAssuranceIcons.twoDaysReturn.src).toContain('Return_1.png');
    expect(purchaseAssuranceIcons.tenDaysExchange.src).toContain('Exchange_1.png');
    expect(purchaseAssuranceIcons).not.toHaveProperty('cashOnDelivery');
  });

  it('exposes the gold trust strip asset and its badge alt text', () => {
    expect(goldUspImage.src).toContain('https://d2ppgkj0vs05g5.cloudfront.net/');
    expect(goldUspImage.width).toBe(1312);
    expect(goldUspImage.height).toBe(264);
    expect(productMessages.a11y.goldTrustBadges).toContain('BIS Hallmark');
  });

  it('exposes static demifine PDP offers', () => {
    expect(demifineStaticOffers).toHaveLength(2);
    expect(demifineStaticOffers[0]?.code).toBe('B1G1');
    expect(demifineStaticOffers[1]?.code).toBe('EXTRA10');
  });

  it('exposes downloaded demifine USP badge assets', () => {
    expect(productUspBadges.anti_tarnish.src).toBe('/images/product/usps/anti-tarnish.png');
    expect(productUspBadges.platinum_plated.src).toBe('/images/product/usps/platinum-plated.png');
    expect(productUspBadges.adjustable_rings.height).toBe(52);
  });

  it('exposes demifine USP tag fallback rules', () => {
    expect(productUspRules.always).toEqual(['anti_tarnish', 'skin_safe_jewellery']);
    expect(productUspRules.defaultThird).toBe('gold_tone_plated');
    expect(productUspRules.thirdByTag[0]).toEqual({
      id: 'platinum_plated',
      needles: ['platinum_plated_silver'],
    });
  });

  it('exposes static demifine pre-deals promo config', () => {
    expect(demifinePreDealsConfig.trustPillIds).toEqual([
      'antiTarnish',
      'skinSafeJewellery',
      'goldTonePlated',
    ]);
    expect(demifinePreDealsConfig.sellingFast.quantitySold).toBe(1223);
    expect(demifinePreDealsConfig.cashbackPercent).toBe(5);
    expect(demifinePreDealsConfig.freeGift.handle).toBe('7848519926017');
    expect(demifinePreDealsConfig.freeGift.worthAmount).toBe(1495);
    expect(demifinePreDealsConfig.freeGift.minOrderAmount).toBe(2599);
    expect(productMessages.freeGiftPriceFree).toContain('{{worth}}');
  });

  it('exposes gold limited-time offer flag and timing (Cluster B)', () => {
    expect(productConfig.features.goldLimitedTimeOffer).toEqual({ enabled: true });
    expect(isProductFeatureEnabled('goldLimitedTimeOffer')).toBe(true);
    expect(productMessages.limitedTimeOffer).toBe('Limited time Offer');
    expect(productMessages.viewDetails).toBe('View Details');
    expect(productMessages.seeDetails).toBe('see details');
    expect(productMessages.collectOffer).toBe('Collect');
    expect(productMessages.a11y.enlargeFreebieImage).toBe('Enlarge freebie image');
    expect(productMessages.a11y.closeFreebieImage).toBe('Close freebie image');
    expect(productConfig.timing.copiedResetDelayMs).toBe(1500);
    expect(productConfig.gallery.zoom.wheelStepScale).toBe(0.12);
    expect(productConfig).not.toHaveProperty('mock');
  });

  it('exposes All review filter copy', () => {
    expect(productMessages.reviews.mostRelevant).toBe('All');
    expect(productMessages.reviews.mostRecent).toBe('Most Recent');
  });

  it('formats the PDP rating-count jump label', () => {
    expect(productMessages.reviews.formatScrollToReviews(12)).toBe('Jump to 12 reviews');
    expect(productMessages.reviews.a11y.scrollToReviews).toBe('Jump to {{count}} reviews');
  });
});
