import { getProductVariantTokens, productTokens } from '@/config/theme/product.tokens';

describe('product.tokens', () => {
  it('exposes readable product typography classes', () => {
    expect(productTokens.typography.pdpTitleClass).toContain('text-base');
    expect(productTokens.typography.pdpBodyClass).toContain('text-sm');
    expect(productTokens.typography.pdpMetaClass).toContain('text-xs');
    expect(productTokens.typography.cardTextClass).toContain('text-xs');
    expect(productTokens.typography.pdpPriceSellingClass).toContain('text-[19px]');
    expect(productTokens.typography.pdpPriceCompareClass).toContain('text-[17px]');
    expect(productTokens.typography.pdpPriceOffClass).toContain('text-[11px]');
    expect(productTokens.typography.pdpRatingStarFilledClass).toContain('text-[#F5B301]');
    expect(productTokens.typography.pdpRatingStarEmptyClass).toContain('text-[#D9D9D9]');
  });

  it('exposes PDP grouping rhythm tokens', () => {
    expect(productTokens.pdpRhythm.stackClass).toContain('gap-6');
    expect(productTokens.pdpRhythm.stackClass).toContain('laptop:gap-8');
    expect(productTokens.pdpRhythm.clusterClass).toContain('gap-2');
    expect(productTokens.pdpRhythm.promoClusterClass).toContain('gap-3');
    expect(productTokens.pdpRhythm.similarSectionClass).toContain('pt-8');
    expect(productTokens.pdpRhythm.purchaseAssuranceSectionClass).toContain('pt-10');
    expect(productTokens.pdpRhythm.purchaseAssuranceSectionClass).toContain('pb-8');
    expect(productTokens.pdpRhythm.purchaseAssuranceListClass).toContain('grid-cols-3');
    expect(productTokens.pdpRhythm.purchaseAssuranceCodGlyphClass).toBe('size-full');
    expect(productTokens.pdpRhythm.purchaseAssuranceCodWrapClass).toBe('opacity-60');
    expect(productTokens.pdpRhythm.purchaseAssuranceCodRingClass).toContain('border-[1.5px]');
    expect(productTokens.pdpRhythm.purchaseAssuranceListClass).not.toContain('divide');
    expect(productTokens.pdpRhythm.similarSectionClass).not.toContain('pt-2');
    expect(productTokens.pdpRhythm.similarCarouselClass).toContain('mt-3');
    expect(productTokens.pdpRhythm.reviewsSectionClass).toContain('pt-4');
    expect(productTokens.pdpRhythm.stickyBarPriceRootMargin).toBe('-80px 0px 0px 0px');
    expect(productTokens.pdpRhythm.stickyBarRowClass).toContain('items-center');
    expect(productTokens.pdpRhythm.stickyBarRowClass).not.toContain('gap-3');
    expect(productTokens.pdpRhythm.stickyBarPriceRevealClass).toBe('sticky-bar-price-reveal');
    expect(productTokens.pdpRhythm.stickyBarPriceRevealInnerClass).toBe(
      'sticky-bar-price-reveal-inner',
    );
    expect(productTokens.pdpRhythm.stickyBarPriceWrapClass).toContain('min-w-0');
    expect(productTokens.pdpRhythm.stickyBarPriceWrapClass).toContain('shrink-0');
    expect(productTokens.pdpRhythm.stickyBarPriceWrapClass).not.toContain('grow');
    expect(productTokens.pdpRhythm.stickyBarPriceWrapClass).toContain('laptop:ml-auto');
    expect(productTokens.pdpRhythm.stickyBarPriceWrapClass).toContain('laptop:text-right');
    expect(productTokens.pdpRhythm.stickyBarPriceClass).toContain('font-bold');
    expect(productTokens.pdpRhythm.stickyBarPriceClass.split(' ')).toContain('flex-nowrap');
    expect(productTokens.pdpRhythm.stickyBarPriceClass).toContain('whitespace-nowrap');
    expect(productTokens.pdpRhythm.stickyBarPriceClass.split(' ')).not.toContain('flex-wrap');
    expect(productTokens.pdpRhythm.stickyBarPriceClass).not.toContain('max-w-[11.5rem]');
    expect(productTokens.pdpRhythm.stickyBarSellingClass).toContain('sticky-bar-selling');
    expect(productTokens.pdpRhythm.stickyBarSellingInnerClass).toContain('sticky-bar-selling-inner');
    expect(productTokens.pdpRhythm.stickyBarCompareClass).toContain('sticky-bar-compare');
    expect(productTokens.pdpRhythm.stickyBarPairWithPriceClass).toContain('min-w-0');
    expect(productTokens.pdpRhythm.stickyBarPairWithPriceClass).toContain('flex-1');
    expect(productTokens.pdpRhythm.stickyBarPairWithPriceClass).toContain('laptop:flex-none');
    expect(productTokens.pdpRhythm.stickyBarPairWithPriceClass).toContain('laptop:ml-0');
    expect(productTokens.pdpRhythm.infoColumnClass).toContain('pt-6');
    expect(productTokens.pdpRhythm.infoColumnClass).not.toContain('pt-4');
    expect(productTokens.pdpRhythm.shopByOffersSectionClass).toContain('gap-3');
    expect(productTokens.pdpRhythm.shopByOffersSectionClass).toContain('py-6');
    expect(productTokens.pdpRhythm.galleryZoomDockClass).toContain('h-1/4');
    expect(productTokens.pdpRhythm.galleryZoomThumbClass).toContain('opacity-40');
    expect(productTokens.pdpRhythm.galleryZoomThumbActiveClass).toContain('opacity-100');
  });

  it('exposes shared PDP neutrals', () => {
    expect(productTokens.titleMuted).toBe('#4A4A4A');
    expect(productTokens.compareAt).toBe('#595959');
    expect(productTokens.textMuted).toBe('#595959');
    expect(productTokens.selectedColourHint).toBe('#6B6B6B');
    expect(productTokens.success).toBe('#008236');
    expect(productTokens.coupon).toBe('#008236');
    expect(productTokens.cardOfferPromo).toBe('#008236');
    expect(productTokens.cardOfferCycle.pillBorder).toBe('#E9D6AE');
    expect(productTokens.cardOfferCycle.copyPrice).toBe('#33291A');
    expect(productTokens.cardOfferCycle.trackClass).toContain('overflow-hidden');
    expect(productTokens.cardOfferCycle.infoGridClass).toContain('grid-cols-[minmax(0,1fr)_auto]');
    expect(productTokens.cardOfferCycle.infoGridClass).toContain('gap-y-1.5');
    expect(productTokens.cardOfferCycle.infoStackClass).toContain('gap-2');
    expect(productTokens.cardOfferCycle.promoClass).toContain('col-span-2');
    expect(productTokens.cardOfferCycle.copyClass).toContain('whitespace-nowrap');
    expect(productTokens.cardOfferCycle.copyClass).not.toContain('truncate');
    expect(productTokens.cardOfferCycle.pillClass).toContain('border-transparent');
    expect(productTokens.cardOfferCycle.iconClass).toContain('h-[11px]');
    expect(productTokens.cardOfferMore).toBe('#595959');
    expect(productTokens.shopByOffers.surface).toBe('#FCFBF9');
    expect(productTokens.shopByOffers.tabIdleBorder).toBe('#DDD7CF');
    expect(productTokens.shopByOffers.tabIdleText).toBe('#4B4540');
    expect(productTokens.shopByOffers.headingClass).toContain('capitalize');
    expect(productTokens.shopByOffers.tabClass).toContain('rounded-full');
    expect(productTokens.shopByOffers.tabClass).toContain('h-9');
    expect(productTokens.shopByOffers.tabClass).toContain('shrink-0');
    expect(productTokens.shopByOffers.tabClass).not.toContain('flex-1');
    expect(productTokens.shopByOffers.itemClassName).toContain('w-[48vw]');
    expect(productTokens.uspBorder).toBe('#FF4C00');
    expect(productTokens.uspStrip.listClass).toContain('justify-start');
    expect(productTokens.uspStrip.listClass).toContain('overflow-x-auto');
    expect(productTokens.uspStrip.listClass).toContain('flex-nowrap');
    expect(productTokens.uspStrip.listClass).not.toContain('flex-wrap');
    expect(productTokens.uspStrip.listClass).toContain('gap-4');
    expect(productTokens.uspStrip.itemClass).toContain('h-12');
    expect(productTokens.uspStrip.itemClass).toContain('laptop:h-[45px]');
    expect(productTokens.uspStrip.imageClass).toContain('h-full');
    expect(productTokens.uspStrip.imageClass).toContain('object-contain');
    expect(productTokens.nowAccent).toBe('#B44724');
    expect(productTokens.nowSurface).toBe('#FFF4E1');
    expect(productTokens.nowBannerGradient).toContain('#ffccbc');
    expect(productTokens.dealsPillBorder).toBe('#b3c4ff');
    expect(productTokens.dealsHeadingClass).toContain('font-semibold');
    expect(productTokens.dealsPanelGradient).toContain('rgba(255, 159, 118, 0.1)');
    expect(productTokens.offerDivider).toBe('#f4f4f4');
    expect(productTokens.offerDescription).toBe('#595959');
    expect(productTokens.offerCard.collect).toBe('#008236');
    expect(productTokens.offerCard.shadow).toBe('none');
    expect(productTokens.offerCard.wash).toBe('none');
    expect(productTokens.offerCard.stripBorder).toBe('#b3c4ff');
    expect(productTokens.offerCard.cardClass).toContain('rounded-2xl');
    expect(productTokens.trustPillBorder).toBe('#fff0df');
    expect(productTokens.sellingFastAccent).toBe('#B91C1C');
    expect(productTokens.sellingFastBanner.wrapClass).toContain('inline-flex');
    expect(productTokens.sellingFastBanner.barClass).toContain('selling-fast-shine');
    expect(productTokens.sellingFastBanner.countColor).toBe('#B91C1C');
    expect(productTokens.sellingFastBanner.countClass).toContain('font-bold');
    expect(productTokens.stickyBarPairClass).toContain('grid-cols-2');
    expect(productTokens.stickyBarPairClass).toContain('laptop:ml-auto');
    expect(productTokens.stickyBarPairClass).toContain('laptop:w-fit');
    expect(productTokens.stickyBarPairClass).not.toContain('laptop:w-auto');
    expect(productTokens.stickyBarCtaWidthClass).toContain('w-full');
    expect(productTokens.stickyBarCtaWidthClass).toContain('whitespace-nowrap');
    expect(productTokens.stickyBarAtcShineClass).toContain('sticky-bar-atc-shine');
    expect(productTokens.stickyBarAdded.durationMs).toBe(3000);
    expect(productTokens.stickyBarAdded.wrapClass).toContain('sticky-atc-added');
    expect(productTokens.stickyBarAdded.beadsClass).toContain('sticky-atc-added-beads');
    expect(productTokens.stickyBarAdded.cartClass).toContain('absolute');
    expect(productTokens.stickyBarAdded.cartSuccess).toBe('#FFFFFF');
    expect(productTokens.stickyBarAdded.dotColors).toEqual([
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
    ]);
    expect(productTokens.stickyBarStepperRevealClass).toBe('a2c-qty-reveal');
    expect(productTokens.cashbackBannerBg).toBe('#f0fdf4');
    expect(productTokens.freeGiftBanner.wrapClass).toContain('rounded-xl');
    expect(productTokens.freeGiftBanner.badgeClass).toContain('free-gift-badge-shake');
    expect(productTokens.freeGiftBanner.badgeBg).toBe('#502C3A');
    expect(productTokens.oosStatus).toBe('#A33B35');
    expect(productTokens.tagBadge.text).toBe('#2C3D73');
    expect(productTokens.tagBadge.ringGradient).toContain('#5B6FA8');
    expect(productTokens.sellingFastTag.text).toBe('#BF7300');
    expect(productTokens.sellingFastTag.ringGradient).toContain('#FF9900');
    expect(productTokens.tagAccent).toBe('#2C3D73');
    expect(productTokens.reviewAvatarText).toBe('#5C3D3D');
    expect(productTokens.walletBenefitsSheetTitle).toContain('text-[20px]');
    expect(productTokens.walletBenefitsSheetTitle).toContain('leading-[30px]');
    expect(productTokens.walletBenefitsSheetTitle).toContain('font-bold');
    expect(productTokens.walletBenefitsItemTitle).toContain('text-[16px]');
    expect(productTokens.walletBenefitsItemTitle).toContain('leading-[24px]');
    expect(productTokens.walletBenefitsItemTitle).toContain('font-bold');
    expect(productTokens.offerFilterChip.fill).toBe('#ECE2DF');
    expect(productTokens.offerFilterChip.border).toBe('#C4B8B8');
    expect(productTokens.offerFilterChip.baseClass).toContain('border-2');
    expect(productTokens.offerFilterChip.baseClass).toContain('px-4');
    expect(productTokens.offerFilterChip.selectedClass).toContain('bg-[#ECE2DF]');
    expect(productTokens.offerFilterChip.selectedClass).toContain('border-[#C4B8B8]');
    expect(productTokens.offerFilterChip.idleClass).toContain('bg-white');
    expect(productTokens.offerFilterChip.selectedClass).not.toContain('px-');
    expect(productTokens.offerFilterChip.idleClass).not.toContain('px-');
  });

  it('resolves gold accent tokens', () => {
    expect(getProductVariantTokens('gold').cta).toBe('#502C3A');
    expect(getProductVariantTokens('gold').link).toBe('#502C3A');
  });

  it('resolves demifine accent tokens', () => {
    expect(getProductVariantTokens('demifine').cta).toBe('#151515');
    expect(productTokens.demifine.chipSelectedBg).toBe('#ECE2DF');
  });

  it('keeps gold and demifine CTAs distinct', () => {
    expect(getProductVariantTokens('gold').cta).not.toBe(getProductVariantTokens('demifine').cta);
  });

  it('exposes named metal fill classes', () => {
    expect(productTokens.metalColors.classByName.gold).toBe('bg-[#D4AF37]');
    expect(productTokens.metalColors.classByName.silver).toBe('bg-[#C0C0C0]');
  });

  it('exposes a fallback metal fill class', () => {
    expect(productTokens.metalColors.fallbackClass).toBe('bg-[#D9D9D9]');
  });

  it('exposes product-card swatch layout tokens', () => {
    expect(productTokens.cardSwatches.minVisible).toBe(2);
    expect(productTokens.cardSwatches.maxVisible).toBe(3);
    expect(productTokens.cardSwatches.chipSizePx).toBe(10);
    expect(productTokens.cardSwatches.trackClass).toContain('h-2.5');
  });

  it('exposes listing-card quantity stepper tokens', () => {
    expect(productTokens.cardQuantity.track).toBe('#E6E6E6');
    expect(productTokens.cardQuantity.plus).toBe('#151515');
    expect(productTokens.cardQuantity.trackClass).toContain('h-[22px]');
    expect(productTokens.cardQuantity.buttonClass).toContain('size-3.5');
    expect(productTokens.cardQuantity.valueClass).toContain('size-4');
    expect(productTokens.cardQuantity.loaderClass).toContain('h-3.5');
  });

  it('keeps listing-card A2C, OOS, and qty CTAs the same 22px height', () => {
    expect(productTokens.cardCta.addButtonClass).toContain('size-[22px]');
    expect(productTokens.cardCta.addPressClass).toBe('card-atc-press');
    expect(productTokens.cardCta.addButtonClass).not.toContain('w-[14%]');
    expect(productTokens.cardCta.addIconClass).toContain('size-3.5');
    expect(productTokens.cardCta.oosButtonClass).toContain('size-[22px]');
    expect(productTokens.cardCta.oosButtonClass).not.toContain('w-[12%]');
    expect(productTokens.cardQuantity.trackClass).toContain('h-[22px]');
  });

  it('exposes PDP in-cart quantity CTA tokens', () => {
    expect(productTokens.pdpQuantity.track).toBe('#151515');
    expect(productTokens.pdpQuantity.trackClass).toContain('min-h-12');
    expect(productTokens.pdpQuantity.trackClass).toContain('rounded-[10px]');
    expect(productTokens.pdpQuantity.buttonClass).toContain('size-5');
    expect(productTokens.pdpQuantity.valueClass).toContain('text-[14px]');
    expect(productTokens.pdpQuantity.valueClass).toContain('text-white');
    expect(productTokens.pdpQuantity.loaderClass).toContain('border-t-white');
  });

  it('exposes listing-card ribbon badge tokens', () => {
    expect(productTokens.cardBadge.background).toBe('#C2185B');
    expect(productTokens.cardBadge.layoutClass).toContain('product-badge-left');
    expect(productTokens.cardBadge.layoutClass).toContain('clip-path');
    expect(productTokens.cardBadge.labelClass).toContain('text-white');
  });

  it('keeps the listing-card badge flush top-left as a short swallowtail ribbon', () => {
    expect(productTokens.cardBadge.layoutClass).toContain('top-0');
    expect(productTokens.cardBadge.layoutClass).toContain('left-0');
    expect(productTokens.cardBadge.layoutClass).toContain('py-0.5');
    expect(productTokens.cardBadge.layoutClass).toContain('laptop:py-1');
    expect(productTokens.cardBadge.layoutClass).toContain('pl-1.5');
    expect(productTokens.cardBadge.layoutClass).toContain('pr-3.5');
    expect(productTokens.cardBadge.layoutClass).toContain('laptop:pl-2.5');
    expect(productTokens.cardBadge.layoutClass).toContain('laptop:pr-[22px]');
    expect(productTokens.cardBadge.layoutClass).toContain('justify-center');
    expect(productTokens.cardBadge.layoutClass).not.toContain('max-w-[120px]');
    expect(productTokens.cardBadge.layoutClass).not.toContain('rounded-tl');
    expect(productTokens.cardBadge.labelClass).toContain('text-center');
    expect(productTokens.cardBadge.labelClass).toContain('text-xs');
    expect(productTokens.cardBadge.labelClass).toContain('laptop:text-sm');
    expect(productTokens.cardBadge.labelClass).not.toContain('text-[8px]');
    expect(productTokens.cardBadge.labelClass).not.toContain('text-[#B5B4B3]');
  });

  it('exposes making-charges fixed-width layout token', () => {
    expect(productTokens.makingCharges.gradient).toContain('#ffd9e3');
    expect(productTokens.makingCharges.layoutClass).toContain('w-[160px]');
    expect(productTokens.makingCharges.layoutClass).toContain('laptop:w-[230px]');
  });

  it('keeps limited-offer bar compact and gradient extended (PW-621)', () => {
    expect(productTokens.limitedOffer.barClass).toContain('py-1.5');
    expect(productTokens.limitedOffer.barClass).toContain('laptop:py-2');
    expect(productTokens.limitedOffer.barClass).not.toContain('pt-3.5');
    expect(productTokens.limitedOffer.titleClass).toContain('text-[13px]');
    expect(productTokens.limitedOffer.titleEmphasisClass).toBe('font-bold');
    expect(productTokens.limitedOffer.titleEmphasisColor).toBe(productTokens.ink);
    expect(productTokens.limitedOffer.flashClass).toContain('size-[24px]');
    expect(productTokens.limitedOffer.flashClass).toContain('laptop:size-[30px]');
    expect(productTokens.limitedOffer.flashClass).toContain('bg-cover');
    expect(productTokens.limitedOffer.freebieImageClass).toContain('size-11');
    expect(productTokens.limitedOffer.freebieImageClass).toContain('laptop:size-12');
    expect(productTokens.limitedOffer.bannerGradient).toContain('92%');
    expect(productTokens.limitedOffer.flashSrc).toBe('/images/product/limited-offer/flash.png');
  });

  it('exposes limited-offer ribbon geometry tokens', () => {
    expect(productTokens.limitedOffer.ribbon).toBe('#440C22');
    expect(productTokens.limitedOffer.titleClass).toContain('laptop:text-sm');
    expect(productTokens.limitedOffer).not.toHaveProperty('ribbonRotate');
  });

  it('offsets the PDP reviews anchor below the sticky header', () => {
    expect(productTokens.reviews.sectionAnchorClass).toContain('scroll-mt-28');
    expect(productTokens.reviews.sectionAnchorClass).toContain('laptop:scroll-mt-24');
  });

  it('exposes platinum plated listing-card tokens', () => {
    expect(productTokens.platinumPlated.border).toBe('#5BB8FF');
    expect(productTokens.platinumPlated.text).toBe('#2476B5');
    expect(productTokens.platinumPlated.iconSrc).toBe('/images/product/platinum-plated.svg');
    expect(productTokens.platinumPlated.strokeClass).toContain('p-[0.5px]');
    expect(productTokens.platinumPlated.layoutClass).toContain('w-fit');
    expect(productTokens.platinumPlated.layoutClass).toContain('leading-none');
    expect(productTokens.platinumPlated.layoutClass).toContain('overflow-hidden');
    expect(productTokens.platinumPlated.radius).toBe('47px');
    expect(productTokens.platinumPlated.fill).toBe('rgba(91, 184, 255, 0.1)');
    expect(productTokens.platinumPlated.gradient.split('linear-gradient').length - 1).toBe(3);
    expect(productTokens.platinumPlated.gradient).toContain('90deg');
    expect(productTokens.platinumPlated.strokeGradient).toContain('#5BB8FF');
    expect(productTokens.platinumPlated.strokeGradient).toContain('#FFFFFF');
    expect(productTokens.platinumPlated.borderImageSource).toBe(
      productTokens.platinumPlated.strokeGradient,
    );
    expect(productTokens.platinumPlated.iconClass).toContain('w-[13px]');
    expect(productTokens.platinumPlated.iconClass).toContain('overflow-hidden');
  });
});
