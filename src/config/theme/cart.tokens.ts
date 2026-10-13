import { productTokens } from '@/config/theme/product.tokens';

/** Cart UI color tokens (Figma-aligned) — aliases shared product tokens where hex matches. */
export const cartTokens = {
  successGreen: productTokens.success,
  outOfStock: productTokens.oosStatus,
  /** Cart-line image badge (OOS pill on the thumbnail). */
  outOfStockBadge: '#E11D2E',
  outOfStockBadgeClass:
    'absolute inset-x-0 top-0 z-[2] flex w-full items-center justify-center px-1 py-0.5 text-center text-[8px] leading-none font-semibold text-white laptop:py-1 laptop:text-[10px]',
  /** Mute OOS line content; badges stay full opacity outside this wrapper. */
  outOfStockMutedClass: 'pointer-events-none opacity-50',
  offerAppliedBg: 'rgba(0, 160, 43, 0.1)',
  quantityTrack: productTokens.demifine.chipSelectedBg,
  quantityPlus: productTokens.demifine.chipSelected,
  checkoutCta: productTokens.ink,
  textPrimary: '#1f1f1f',
  textSecondary: '#334155',
  textMuted: '#afafaf',
  borderLight: '#e2e8f0',
  couponAppliedSolid: productTokens.success,
  couponAvailableBg: '#E5F6EA',
  /** Offers & Coupons panel (Figma 3734:51307). */
  couponSectionGradient: 'linear-gradient(180deg, #F3FFF6 0%, #FFFFFF 42%)',
  couponSectionBorder: 'rgba(0, 160, 43, 0.18)',
  couponSectionShadow: '0px 1px 4px 0px rgba(0, 160, 43, 0.06)',
  couponSectionClass: 'flex w-full flex-col rounded-2xl border',
  couponFooterLinkClass: 'text-[11px] font-medium no-underline',
  couponMoreOffersWrapClass: 'flex w-full justify-center',
  couponMoreOffersClass:
    'inline-flex items-center gap-1 text-center text-[12px] font-medium tracking-[0.02em] no-underline underline-offset-4 hover:underline',
  couponSwapButtonClass:
    'shrink-0 rounded-full px-3 py-1 text-center text-[10px] leading-3.5 font-semibold text-white disabled:opacity-60',
  couponIconBg: 'rgba(0, 160, 43, 0.15)',
  couponSavingText: '#3d7a52',
  couponSavingRowClass: 'inline-flex items-center gap-1 rounded-full px-2 py-1',
  couponSavingLabelClass: 'text-[11px] leading-none font-semibold tracking-[0.02em]',
  couponSavingHighlightClass: 'text-[13px] leading-none font-semibold tracking-tight',
  couponAppliedCardBg: '#FBFDFB',
  couponAppliedCardClass: 'flex w-full overflow-hidden rounded-2xl border',
  couponAppliedAccentClass: 'w-[3px] shrink-0 self-stretch',
  couponAppliedBodyClass: 'flex min-w-0 flex-1 items-center justify-between gap-3 px-3.5 py-3.5',
  couponAppliedCodeClass: 'truncate text-[13px] font-semibold tracking-[0.14em]',
  couponAppliedMetaClass: 'mt-1 truncate text-[11px] leading-4',
  couponAppliedStatusClass: 'mt-2 text-[10px] font-medium tracking-[0.16em] uppercase',
  couponAppliedActionClass:
    'text-[11px] font-medium underline-offset-2 hover:underline disabled:opacity-60',
  couponAppliedCountBg: productTokens.success,
  couponAvailableCountBg: 'rgba(255, 255, 255, 0.8)',
  couponAvailableCountText: '#3d7a52',
  couponAddItemsBg: 'rgba(0, 160, 43, 0.2)',
  couponAddItemsText: productTokens.success,
  couponInputBorder: 'rgba(0, 160, 43, 0.22)',
  couponInputClass:
    'h-full min-w-0 flex-1 bg-transparent px-2.5 text-[11px] leading-4 text-[#151515] outline-none placeholder:text-[11px] placeholder:text-[#9aa3af] disabled:opacity-60',
  couponTicketBorderApplied: productTokens.success,
  couponTicketBorderAvailable: 'rgba(0, 160, 43, 0.2)',
  couponTicketNotch: '#E8FFEE',
  couponTicketStubGradient:
    'linear-gradient(180deg, #2D8F4E 0%, #2B914B 10%, #289249 20%, #259446 30%, #229643 40%, #1F983F 50%, #1B993C 60%, #179B38 70%, #119D34 80%, #099E30 90%, #00A02B 100%)',
  couponTicketDetail: '#5a7a66',
  couponAppliedBadgeBg: '#ecfdf5',
  couponAppliedBadgeText: '#006045',
  /** Applied line-discount pill (Figma 4054:48433). */
  lineDiscountAppliedBg: '#006045',
  lineDiscountAppliedText: '#ffffff',
  couponRemoveBg: '#fff5f7',
  couponRemoveBorder: 'rgba(224, 81, 122, 0.4)',
  couponRemoveText: '#c01d4a',
  couponFailPanelClass: 'rounded-lg border px-2.5 py-2',
  couponFailErrorClass: 'text-[11px] leading-4 font-medium',
  couponFailHintClass: 'mt-1 text-[10px] leading-3.5 font-medium',
  couponSeeAllBg: 'rgba(0, 160, 43, 0.1)',
  orderSummaryCardClass: 'flex w-full flex-col overflow-hidden rounded-2xl border bg-white p-4',
  orderSummaryCardBorder: '#e8e8e8',
  orderSummaryTitleClass: 'text-[15px] leading-[22.5px] font-semibold',
  orderSummaryRowsClass: 'flex flex-col gap-2.5 pt-3.5',
  orderSummaryRowClass: 'flex items-center justify-between',
  orderSummaryLabelClass: 'text-[13px] leading-[19.5px] font-normal',
  orderSummaryValueClass: 'text-[13px] leading-[19.5px] font-medium',
  orderSummaryLabel: '#6b6b6b',
  orderSummaryValue: '#151515',
  orderSummaryPositive: '#16a34a',
  orderSummaryMuted: '#9a9a9a',
  orderSummaryInfoIcon: '#B0B0B0',
  orderSummaryDivider: '#ececec',
  orderSummaryTotalWrapClass: 'flex items-center justify-between border-t pt-3.5',
  orderSummaryTotalLabelClass: 'text-[15px] leading-[22.5px] font-semibold',
  orderSummaryTotalValueClass: 'text-base leading-6 font-semibold',
  couponSeeAllText: '#006045',
  inputBg: '#f8fafc',
  formInputBg: '#f8fafc',
  formInputPlaceholder: '#64748b',
  addressBarBg: '#F8F8F8',
  addressBarEmptyBg: '#f8fafc',
  addressBarFilledBg: '#f8fafc',
  ltoBadgeBg: productTokens.surfaceWhite,
  ltoBadgeGradient: 'linear-gradient(90deg, #FFF 0%, rgba(255, 255, 255, 0.00) 100%)',
  giftCardBonus: '#E17100',
  /** Earned free-gift product row (Figma 3862:94976). */
  giftItemBg: '#fafafa',
  giftItemBorder: '#ececec',
  giftItemDetail: '#6b6b6b',
  giftItemBadgeBg: '#e9f8ed',
  giftItemBadgeText: '#008236',
  redemptionPanelBg: productTokens.stickyBarBg,
  bundleChipGradient:
    'linear-gradient(90deg, rgba(255, 159, 118, 0.3) 0%, rgba(179, 196, 255, 0.3) 51%, rgba(255, 255, 255, 0.3) 100%)',
  ltoGradient:
    'linear-gradient(90deg, rgba(255, 159, 118, 0.3) 0%, rgba(179, 196, 255, 0.3) 51%, rgba(255, 255, 255, 0.3) 100%), linear-gradient(90deg, #F4F4F4 0%, #F4F4F4 100%)',
  giftCardGradient:
    'linear-gradient(90deg, #FFEBB4 0%, #FFFBE9 100%), linear-gradient(90deg, rgba(223, 223, 223, 0.2) 0%, rgba(223, 223, 223, 0.2) 100%)',
  /** Dispatch + free shipping callout (kept for later). */
  dispatchBannerBg: '#f4f7fb',
  dispatchBannerBorder: '#d7e2ee',
  dispatchBannerIconBg: '#3d5a73',
  dispatchBannerTitle: '#2a3f52',
  dispatchBannerSubtitle: '#3d5a73',
  /** Space under Order Summary so the fixed mobile footer never covers it. */
  mobileStickyFooterFallbackPx: 112,
  mobileStickyFooterGapPx: 16,
  /** GPay badge background on checkout CTA (Figma 3802:53797). */
  checkoutPaymentGpayBg: '#f5f5f5',
  /**
   * Variant picker chrome (Figma 4040:48863) — add, qty update, and remove.
   * Bottom sheet below `tab`; centered dialog from `tab` up.
   */
  chooseOptionsOverlay: {
    backdropClass:
      'z-modal-backdrop fixed inset-0 flex items-end justify-center tab:items-center tab:p-4',
    shellClass:
      'z-modal relative flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-[20px] bg-white tab:max-h-[90dvh] tab:max-w-[396px] tab:rounded-[13px]',
    headerClass: 'flex h-[65px] shrink-0 items-center justify-between border-b px-4',
    headerBorder: productTokens.borderHairline,
    titleClass: 'text-lg leading-7 font-normal capitalize',
    titleColor: productTokens.ink,
    closeClass: 'flex size-8 items-center justify-center text-base',
    bodyClass: 'overflow-y-auto p-4',
    imageWrapClass: 'relative size-14 shrink-0 overflow-hidden rounded-lg',
    imageBg: productTokens.stickyBarBg,
    compareAt: '#8A8A8A',
    actionBorder: '#E8E8E8',
    inStock: '#00A63E',
  },
  /** Collection-page add-to-cart fly-into-bag chip. */
  addToCartFlight: {
    durationMs: 760,
    swallowDurationMs: 280,
    landSizePx: 24,
    arcLiftPx: 56,
    chipSizeClass: '',
    chipClass:
      'cart-fly-chip pointer-events-none fixed z-fixed origin-center overflow-hidden rounded-sm bg-white shadow-md',
    layerClass: 'pointer-events-none fixed inset-0 z-fixed',
    swallowClass: 'cart-fly-swallow',
    badgePopClass: 'cart-fly-badge-pop',
  },
} as const;
