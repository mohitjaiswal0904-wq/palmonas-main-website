/** PDP UI color tokens (Figma-aligned) — gold vs demifine accents. */
export const productTokens = {
  typography: {
    pdpTitleClass: 'text-base laptop:text-xl',
    pdpBodyClass: 'text-sm',
    pdpMetaClass: 'text-xs',
    cardTextClass: 'text-xs',
    /** PDP header price row — ~20% larger than the previous 14/16/20/23 sizes. */
    pdpPriceCompareClass: 'text-[17px] font-normal line-through laptop:text-2xl',
    pdpPriceSellingClass: 'text-[19px] font-bold laptop:text-[28px]',
    pdpPriceOffClass:
      'text-[11px] laptop:text-[11px] inline-flex min-h-[18px] items-center justify-center rounded-full px-2 py-[2px] leading-none font-bold text-white laptop:px-2 laptop:py-[3px]',
    pdpRatingStarsClass: 'flex shrink-0 items-center gap-px',
    pdpRatingStarSlotClass: 'relative inline-block h-[11px] w-[11px] shrink-0',
    pdpRatingStarIconClass: 'block h-[11px] w-[11px]',
    pdpRatingStarEmptyClass: 'text-[#D9D9D9]',
    pdpRatingStarFilledClass: 'text-[#F5B301]',
    pdpRatingStarFillClipClass: 'absolute inset-y-0 left-0 overflow-hidden',
  },
  /**
   * PDP grouping rhythm. Tight inside a related cluster; loose between unrelated groups.
   */
  pdpRhythm: {
    stackClass: 'flex min-w-0 flex-col gap-6 laptop:gap-8',
    clusterClass: 'flex w-full min-w-0 flex-col gap-2',
    promoClusterClass: 'flex w-full min-w-0 flex-col gap-3',
    similarSectionClass: 'laptop:px-8 laptop:pt-10 laptop:pb-8 px-0 pt-8 pb-4',
    purchaseAssuranceSectionClass:
      'laptop:mx-auto laptop:max-w-[1200px] laptop:px-10 laptop:pt-12 laptop:pb-10 mx-auto max-w-[1200px] px-4 pt-10 pb-8',
    purchaseAssuranceListClass: 'grid grid-cols-3 gap-4 laptop:gap-10',
    purchaseAssuranceItemClass: 'flex min-w-0 flex-col items-center gap-2 text-center',
    purchaseAssuranceIconClass: 'size-7 shrink-0 laptop:size-8',
    purchaseAssuranceCodRingClass:
      'box-border inline-flex items-center justify-center rounded-full border-[1.5px] p-[18%]',
    purchaseAssuranceCodGlyphClass: 'size-full',
    purchaseAssuranceCodWrapClass: 'opacity-60',
    purchaseAssuranceLabelClass: 'text-xs font-normal leading-snug laptop:text-sm',
    similarCarouselClass: 'laptop:mt-4 mt-3 w-full',
    shopByOffersSectionClass: 'flex w-full flex-col gap-3 py-6 laptop:py-10',
    reviewsSectionClass:
      'laptop:px-10 laptop:pb-14 laptop:pt-4 mx-auto max-w-[1200px] px-4 pt-4 pb-8',
    /** Treat the header price as hidden once it sits under the site header. */
    stickyBarPriceRootMargin: '-80px 0px 0px 0px',
    stickyBarRowClass: 'flex w-full items-center',
    stickyBarPriceWrapClass: 'min-w-0 shrink-0 text-left laptop:ml-auto laptop:text-right',
    stickyBarPriceClass:
      'flex flex-nowrap items-baseline gap-x-0 whitespace-nowrap text-base font-bold leading-tight laptop:text-xl',
    stickyBarSellingClass: 'sticky-bar-selling whitespace-nowrap',
    stickyBarSellingInnerClass: 'sticky-bar-selling-inner whitespace-nowrap',
    stickyBarCompareClass:
      'sticky-bar-compare relative inline-block whitespace-nowrap text-sm font-normal',
    stickyBarPairWithPriceClass:
      'w-auto min-w-0 flex-1 laptop:ml-0 laptop:w-fit laptop:min-w-[188px] laptop:flex-none',
    stickyBarPriceRevealClass: 'sticky-bar-price-reveal',
    stickyBarPriceRevealInnerClass: 'sticky-bar-price-reveal-inner',
    /** Mobile gap from gallery to buy column matches the loose section gap. */
    infoColumnClass:
      'laptop:self-start laptop:min-w-[416px] laptop:overflow-visible laptop:px-0 laptop:pt-0 laptop:pr-[45px] min-w-0 overflow-visible px-4 pt-6',
    galleryZoomDockClass:
      'flex h-1/4 min-h-0 w-full shrink-0 flex-col justify-center gap-3 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2',
    galleryZoomThumbsClass: 'flex min-h-0 w-full items-center gap-2 overflow-x-auto',
    galleryZoomThumbClass:
      'relative size-16 shrink-0 overflow-hidden rounded-md bg-white/10 opacity-40 transition-opacity',
    galleryZoomThumbActiveClass: 'opacity-100 ring-2 ring-white',
  },
  ink: '#151515',
  titleMuted: '#4A4A4A',
  compareAt: '#595959',
  /** Secondary copy (offers, dates, +N more) — WCAG AAA on white. */
  textMuted: '#595959',
  /** Selected metal colour hint beside “Select Metal Colour” (Figma 3514:43880). */
  selectedColourHint: '#6B6B6B',
  chipIdle: '#EFEFEF',
  chipBorderIdle: '#D6D6D6',
  borderHairline: '#EFEFEF',
  borderSubtle: 'rgba(80, 44, 58, 0.15)',
  success: '#008236',
  coupon: '#008236',
  /**
   * Listing-card offer promo (gold and demifine share this).
   * Prod PLP: regular-weight green name, gray "+ N more".
   */
  cardOfferPromo: '#008236',
  cardOfferMore: '#595959',
  /**
   * Listing-card offer cycle (Figma 3896:45125) — vertical text carousel between the green line and gold pill.
   */
  cardOfferCycle: {
    /**
     * Price + qty on row 1; offer promo spans both columns so the gold pill is not clipped by the stepper.
     */
    infoStackClass: 'flex min-w-0 flex-1 flex-col gap-2',
    infoGridClass:
      'mobile:pr-5 grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1.5 pr-2 pl-2',
    priceContentsClass: 'contents',
    priceRowClass: 'order-1 flex min-w-0 items-center gap-[2px] leading-none',
    actionsClass: 'relative z-10 order-2 shrink-0',
    promoClass: 'order-3 col-span-2 min-w-0',
    trackClass:
      'card-offer-cycle relative isolate grid w-fit max-w-full items-stretch overflow-hidden',
    originalClass:
      'card-offer-cycle-original col-start-1 row-start-1 flex h-full min-w-0 items-center',
    pillClass:
      'card-offer-cycle-pill col-start-1 row-start-1 inline-flex h-full w-fit max-w-full items-center gap-1 rounded-full border border-transparent px-[2.5px] py-[2px]',
    pillGradient: 'linear-gradient(90deg, rgb(251, 240, 217) 0%, rgb(255, 255, 255) 100%)',
    pillBorder: '#E9D6AE',
    pillShadow: '0px 1px 1px rgba(150, 115, 50, 0.1)',
    copyClass:
      'whitespace-nowrap text-[8px] leading-[8px] laptop:text-[10px] laptop:leading-[10px]',
    copyMuted: '#7A6A51',
    copyPrice: '#33291A',
    iconClass: 'relative block h-[11px] w-[11px] shrink-0 overflow-hidden',
    percentClass:
      'absolute inset-0 flex items-center justify-center text-[6px] leading-none font-bold text-white',
  },
  /**
   * PDP Shop By Offers band (Figma 4066:50699) — offer tabs + collection product rail.
   */
  shopByOffers: {
    surface: '#FCFBF9',
    headingClass:
      'px-4 text-base font-medium capitalize laptop:px-8 laptop:text-center laptop:text-[28px] laptop:leading-none',
    tabRowClass: 'flex w-full gap-2 overflow-x-auto overflow-y-visible px-4 laptop:px-8',
    tabClass:
      'inline-flex h-9 shrink-0 items-center justify-center rounded-full border px-4 text-xs font-bold whitespace-nowrap',
    tabIdleBorder: '#DDD7CF',
    tabIdleText: '#4B4540',
    carouselClass: 'mt-0 w-full',
    itemClassName:
      'w-[48vw] max-w-[180px] min-w-[140px] shrink-0 snap-start laptop:w-[20vw] laptop:max-w-none laptop:min-w-0',
  },
  surfaceWhite: '#FFFFFF',
  eddTooltipBg: '#E1E1E1',
  stickyBarBg: '#F7F7F7',
  stickyBarShadow: '0px -2px 6px rgba(0, 0, 0, 0.15)',
  /** Sticky bar Buy Now + ATC/stepper sit in equal columns; shrink-wrap to the right on laptop. */
  stickyBarPairClass:
    'grid w-full grid-cols-2 gap-2 laptop:ml-auto laptop:w-fit laptop:grid-cols-[140px_140px]',
  stickyBarCtaWidthClass: 'h-[42px] min-h-[42px] w-full min-w-0 whitespace-nowrap',
  stickyBarAtcShineClass: 'sticky-bar-atc-shine relative isolate overflow-hidden',
  /** In-button cart swallow after a successful sticky-bar add (reference ATC motion). */
  stickyBarAdded: {
    durationMs: 3000,
    wrapClass:
      'sticky-atc-added pointer-events-none relative flex h-full w-full items-center justify-center overflow-hidden',
    rippleClass: 'sticky-atc-added-ripple',
    cartClass: 'sticky-atc-added-cart absolute left-1/2 top-1/2 z-[1] size-5',
    labelClass:
      'sticky-atc-added-label absolute inset-0 z-[2] flex items-center justify-center text-[14px] font-semibold',
    beadsClass:
      'sticky-atc-added-beads pointer-events-none absolute z-[3] flex items-center gap-[3px]',
    dotClass: 'sticky-atc-added-dot size-[5px] shrink-0 rounded-full',
    cartColor: '#FFFFFF',
    cartSuccess: '#FFFFFF',
    labelColor: '#FFFFFF',
    dotColors: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'] as const,
  },
  /** Applied once when ATC morphs into the quantity stepper. */
  stickyBarStepperRevealClass: 'a2c-qty-reveal',
  nowAccent: '#B44724',
  nowBannerGradient:
    'linear-gradient(90deg, #ffffff 0%, #ffccbc 100%), linear-gradient(90deg, #fff4e1 0%, #fff4e1 100%)',
  /** Warm cream from the free-delivery banner — store strip, not the NOW gradient. */
  nowSurface: '#FFF4E1',
  uspBorder: '#FF4C00',
  uspGradient:
    'linear-gradient(89.8deg, rgba(219, 80, 20, 0.1) 0.15%, rgba(193, 183, 255, 0.1) 43.9%, rgba(255, 255, 255, 0.1) 76%), linear-gradient(90deg, rgba(255, 190, 162, 0.1) 0%, rgba(255, 190, 162, 0.1) 100%)',
  /**
   * Equal-height Shopify USP badges — source files have different intrinsic widths.
   * Laptop height is 70% of the previous 64px strip; phone stays 48px.
   */
  uspStrip: {
    listClass:
      'flex w-full min-w-0 flex-nowrap items-center justify-start gap-4 overflow-x-auto overflow-y-visible laptop:gap-5',
    itemClass: 'flex h-12 w-auto shrink-0 items-center justify-start laptop:h-[45px]',
    imageClass: 'h-full w-auto max-w-full object-contain',
  },
  /**
   * Making-charges pill (Figma 960:33497).
   * Fixed widths so pink sits under copy and fades after the text.
   */
  makingCharges: {
    gradient: 'linear-gradient(90deg, #ffd9e3 0%, #ffffff 77%)',
    layoutClass:
      'w-[160px] rounded-r-md px-1.5 py-[3px] text-xs laptop:w-[230px] laptop:rounded-r-lg laptop:px-2.5 laptop:py-1 laptop:text-sm',
  },
  /** @deprecated Prefer `makingCharges.gradient`. */
  makingChargesGradient: 'linear-gradient(90deg, #ffd9e3 0%, #ffffff 77%)',
  /**
   * Gold limited-time offer chrome (Figma 963:61942 mobile / 960:33505 desktop).
   * Flat ribbon SVGs (no rotate) — paths in LimitedOfferRibbon.
   * Flash asset: Figma 960:33507 (Pngtree glossy yellow bolt).
   */
  limitedOffer: {
    ribbon: '#440C22',
    subtitle: '#595959',
    /** Wash reaches further right than USP-style 76% cut (PW-621). */
    bannerGradient:
      'linear-gradient(88.9deg, rgba(219, 80, 20, 0.1) 0.15%, rgba(193, 183, 255, 0.1) 50%, rgba(255, 255, 255, 0.08) 92%)',
    /** ~85% chrome (PW-621 B): tight bar, type, flash track content. */
    barClass:
      'flex min-w-0 items-center gap-1 px-1.5 py-1.5 laptop:gap-1.5 laptop:px-2 laptop:py-2',
    titleClass: 'text-[13px] leading-snug font-normal laptop:text-sm',
    titleEmphasisClass: 'font-bold',
    /** Rupee amounts in freebie titles stay ink even when the title uses gold accent. */
    titleEmphasisColor: '#151515',
    subtitleClass: 'max-w-full text-xs leading-snug',
    codeClass: 'text-xs font-bold tracking-wide whitespace-nowrap',
    flashSrc: '/images/product/limited-offer/flash.png',
    /**
     * Figma flash (960:33507 desktop / 963:61944 mobile):
     * `bg-cover bg-center` matches Dev Mode `background: url() … 50% / cover`.
     */
    flashClass:
      'size-[24px] shrink-0 aspect-square self-center bg-cover bg-center bg-no-repeat laptop:size-[30px]',
    /** Freebie product thumb on the LTO bar (Figma 3514:43913). */
    freebieImageClass: 'size-11 shrink-0 object-cover laptop:size-12',
  },
  /** @deprecated Prefer `limitedOffer.*`. */
  limitedOfferRibbon: '#440C22',
  /** @deprecated Prefer `limitedOffer.subtitle`. */
  limitedOfferSubtitle: '#595959',
  /** @deprecated Prefer `limitedOffer.bannerGradient`. */
  offerBannerGradient:
    'linear-gradient(88.9deg, rgba(219, 80, 20, 0.1) 0.15%, rgba(193, 183, 255, 0.1) 50%, rgba(255, 255, 255, 0.08) 92%)',
  dealsBg: '#f0f9f4',
  dealsPillBorder: '#b3c4ff',
  dealsHeadingClass:
    'flex w-full min-w-0 items-center gap-1.5 text-sm font-semibold laptop:text-base',
  dealsPillGradient:
    'linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(90.1deg, rgba(0, 173, 46, 0.05) 10.52%, rgba(255, 250, 247, 0.05) 99.99%)',
  dealsPanelGradient:
    'linear-gradient(to right, rgba(255, 159, 118, 0.1), rgba(179, 196, 255, 0.1))',
  offerDivider: '#f4f4f4',
  offerDescription: '#595959',
  /**
   * PDP deal card (ticket layout). Copy stays API-driven; these are chrome only.
   */
  offerCard: {
    border: '#E4E9F7',
    shadow: 'none',
    wash: 'none',
    ticketStroke: '#C9B48A',
    ticketFill: '#fff0df',
    percentBg: '#008236',
    stripBg: '#f0f9f4',
    stripBorder: '#b3c4ff',
    collect: '#008236',
    cardClass:
      'relative flex h-full min-h-0 flex-col gap-3 overflow-visible rounded-2xl border bg-white px-3 pt-4 pb-3',
    titleClass: 'text-[15px] leading-snug font-semibold',
    bodyClass: 'text-xs leading-normal',
    stripClass:
      'relative flex min-h-[42px] items-center justify-between overflow-visible rounded-lg border border-dashed px-4 py-2',
    notchClass:
      'pointer-events-none absolute top-1/2 size-3 -translate-y-1/2 rounded-full border border-dashed bg-white',
  },
  trustPillBorder: '#fff0df',
  trustPillIconBg: '#fff0df',
  trustPillText: '#3e3e3e',
  sellingFastAccent: '#B91C1C',
  sellingFastBanner: {
    countColor: '#B91C1C',
    wrapClass: 'inline-flex max-w-full',
    /** Shine sweep lives on `.selling-fast-shine` in globals.css. */
    barClass:
      'selling-fast-shine relative isolate flex min-w-0 items-center overflow-hidden rounded-full py-1.5',
    countClass: 'font-bold tabular-nums',
  },
  /** @deprecated Prefer {@link productTokens.sellingFastBanner}. */
  sellingFastBorderGradient:
    'linear-gradient(90deg, rgb(185, 28, 28) 0%, rgba(185, 28, 28, 0.45) 35%, rgba(185, 28, 28, 0.12) 65%, rgba(185, 28, 28, 0) 100%)',
  oosStatus: '#A33B35',
  oosStatusClass: 'text-[#A33B35]',
  /**
   * Gold PDP header selling-fast pill (pre-ships-in-24h chrome).
   */
  sellingFastTag: {
    text: '#BF7300',
    ringGradient: 'linear-gradient(to right, #FF9900, #FFFFFF)',
    fillGradient: 'linear-gradient(to right, #FFE8CC, #FFF5EB, #FFFFFF)',
    wrapClass: 'inline-flex rounded-full p-[0.5px]',
    innerClass: 'inline-flex items-center gap-1.5 rounded-full py-[3px] pr-10 pl-2',
    labelClass: 'text-[12px] font-semibold',
  },
  /**
   * PDP header shipping-promise pill. Indigo complements gold/cream trust pills
   * and sits apart from wine selling-fast and mint cashback.
   */
  tagBadge: {
    text: '#2C3D73',
    ringGradient: 'linear-gradient(to right, #5B6FA8, #FFFFFF)',
    fillGradient: 'linear-gradient(to right, #E4E9F7, #F5F7FC, #FFFFFF)',
    wrapClass: 'inline-flex rounded-full p-[0.5px]',
    innerClass: 'inline-flex items-center gap-1.5 rounded-full py-[3px] pr-6 pl-2',
    labelClass: 'text-[12px] font-semibold',
  },
  /** @deprecated Prefer {@link productTokens.tagBadge.text}. */
  tagAccent: '#2C3D73',
  reviewAvatarText: '#5C3D3D',
  cashbackBannerBg: '#f0fdf4',
  /** PDP free-gift product card under the delivery checker. */
  freeGiftBanner: {
    gradient: 'linear-gradient(105deg, #fff8e8 0%, #ffffff 46%, #f3fbf6 100%)',
    border: 'rgba(180, 130, 40, 0.35)',
    shadow: 'none',
    wrapClass:
      'relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-solid p-3',
    imageWrapClass:
      'relative size-16 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5',
    imageClass: 'size-full object-cover',
    badgeClass:
      'free-gift-badge-shake absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] uppercase',
    badgeBg: '#502C3A',
    badgeText: '#FFFFFF',
    freeClass: 'text-[13px] font-bold',
    worthClass: 'text-[12px] line-through opacity-60',
  },
  /** Wallet Benefits sheet heading — Figma 20/30 bold, #151515 (SF Pro maps to Nunito). */
  walletBenefitsSheetTitle: 'font-sf-bold text-[20px] leading-[30px] font-bold not-italic',
  /** Wallet Benefits row titles — Figma 16/24 bold, #151515. */
  walletBenefitsItemTitle: 'font-sf-bold text-[16px] leading-[24px] font-bold not-italic',
  gold: {
    accent: '#502C3A',
    accentHover: '#3f2330',
    cta: '#502C3A',
    link: '#502C3A',
  },
  demifine: {
    accent: '#151515',
    accentHover: '#000000',
    cta: '#151515',
    chipSelected: '#977979',
    chipSelectedBg: '#ECE2DF',
    link: '#151515',
  },
  /**
   * Listing-card platinum plated pill (Figma 4092:54369).
   */
  platinumPlated: {
    border: '#5BB8FF',
    text: '#2476B5',
    fill: 'rgba(91, 184, 255, 0.1)',
    radius: '47px',
    /** Figma inspect: three stacked 90deg washes. */
    gradient:
      'linear-gradient(90deg, rgba(91, 184, 255, 0.10) 0.15%, rgba(255, 255, 255, 0.10) 97.82%), linear-gradient(90deg, rgba(91, 184, 255, 0.10) 0.15%, rgba(255, 255, 255, 0.10) 97.82%), linear-gradient(90deg, rgba(91, 184, 255, 0.10) 0.15%, rgba(255, 255, 255, 0.10) 97.82%)',
    /** Stroke fades blue → white so the right edge blends into the card. */
    strokeGradient: 'linear-gradient(90deg, #5BB8FF 0.15%, #FFFFFF 97.82%)',
    borderImageSource: 'linear-gradient(90deg, #5BB8FF 0.15%, #FFFFFF 97.82%)',
    iconSrc: '/images/product/platinum-plated.svg',
    strokeClass: 'inline-flex w-fit max-w-full shrink-0 self-start p-[0.5px]',
    layoutClass:
      'inline-flex w-fit max-w-full items-center justify-center gap-0.5 overflow-hidden px-0.5 py-[1.5px] text-[9px] leading-none',
    iconClass: 'relative block h-3 w-[13px] shrink-0 overflow-hidden',
    labelClass: 'text-[9px] leading-[10px] font-normal capitalize',
  },
  /**
   * Named metal fill classes for product color chips.
   * `@/lib/utils/product-colors` looks these up — do not copy the map in lib.
   */
  metalColors: {
    fallbackClass: 'bg-[#D9D9D9]',
    classByName: {
      'gold': 'bg-[#D4AF37]',
      'rose gold': 'bg-[#E8B8A8]',
      'silver': 'bg-[#C0C0C0]',
      'yellow gold': 'bg-[#FFD700]',
      'white gold': 'bg-[#F5F5F5]',
      'black': 'bg-[#151515]',
      'white': 'bg-[#FFFFFF]',
      'blue': 'bg-[#4A90D9]',
      'green': 'bg-[#4CAF50]',
      'red': 'bg-[#D14343]',
      'pink': 'bg-[#F4A6C6]',
      'brown': 'bg-[#8B5E3C]',
      'copper': 'bg-[#B87333]',
      'platinum': 'bg-[#E5E4E2]',
    },
  },
  /**
   * Product-card metal swatches (Figma collection/search cards).
   * Mapping logic stays in `@/lib/utils/product-colors` — counts and sizes live here.
   */
  cardSwatches: {
    minVisible: 2,
    maxVisible: 3,
    chipSizePx: 10,
    overlapPx: 2,
    trackClass: 'relative h-2.5 shrink-0 overflow-visible tab:h-3',
    chipClass: 'tab:h-3 tab:w-3 absolute top-0 h-2.5 w-2.5 overflow-hidden rounded-full',
  },
  /**
   * Listing-card A2C / OOS plus (shared height with the in-cart qty chip).
   * Fixed 22px — not `%` of card width — so the control lines up with the 12px price row.
   */
  cardCta: {
    addButtonClass:
      'relative z-10 flex laptop:size-[33px] size-[22px] shrink-0 items-center justify-center rounded-[4px] border border-[#151515] bg-[#151515] text-white tab:border-[1.5px]',
    addPressClass: 'card-atc-press',
    addIconClass: 'size-3.5 text-white',
    addLoaderClass: 'size-3.5 text-white',
    oosButtonClass:
      'relative z-10 flex size-[22px] shrink-0 cursor-not-allowed items-center justify-center rounded-[4px] border border-[#9CA3AF] bg-white text-[#9CA3AF] tab:border-[1.5px]',
    oosIconClass: 'size-3.5',
  },
  /**
   * Listing-card quantity stepper (Figma 3856:92847).
   * Track is 22px to match {@link productTokens.cardCta}; inner +/− stay 14px (`size-3.5`).
   */
  cardQuantity: {
    track: '#E6E6E6',
    plus: '#151515',
    trackClass: 'flex h-[22px] laptop:h-[33px] items-center gap-[5px] rounded px-1',
    buttonClass:
      'flex laptop:size-5 size-3.5 shrink-0 items-center justify-center rounded-[3.5px] text-[10px] leading-none font-bold',
    valueClass:
      'flex size-4 shrink-0 items-center justify-center text-[10px] leading-none font-bold capitalize text-[#151515]',
    loaderClass: 'h-3.5 w-3.5',
  },
  /**
   * PDP in-cart quantity CTA (Figma 3862:93745).
   * Buttons stay 20px (`size-5`) to match the 19.4px Figma leaves.
   */
  pdpQuantity: {
    track: '#151515',
    trackClass:
      'flex min-h-12 w-full items-center justify-center gap-[7px] overflow-hidden rounded-[10px]',
    buttonClass:
      'flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-white text-[12px] leading-none font-bold text-[#151515]',
    valueClass:
      'flex size-[22px] shrink-0 items-center justify-center text-[14px] leading-none font-bold capitalize text-white',
    loaderClass: 'h-5 w-5 border-white/30 border-t-white',
  },
  /**
   * Listing-card ribbon badge (top-left swallowtail). Shine lives on `.product-badge-left`.
   */
  cardBadge: {
    background: '#C2185B',
    layoutClass:
      'product-badge-left absolute top-0 left-0 z-[5] flex w-fit items-center justify-center overflow-hidden py-0.5 pr-3.5 pl-1.5 [clip-path:polygon(0_0,100%_0,calc(100%-8px)_50%,100%_100%,0_100%)] laptop:py-1 laptop:pr-[22px] laptop:pl-2.5 laptop:[clip-path:polygon(0_0,100%_0,calc(100%-12px)_50%,100%_100%,0_100%)]',
    labelClass:
      'relative z-[2] text-center text-xs leading-none font-semibold text-white laptop:text-sm',
  },
  /**
   * Ratings & Reviews typography (Figma mobile 976:88480–88487, 976:88533 / desktop 1078:53381, 1078:53470).
   * Pair with global {@link themeFonts.sans} — do not load another font here.
   */
  reviews: {
    /** 976:88480 — Nunito Regular 16 / normal, capitalize */
    mobileSectionTitle:
      'font-sans min-w-0 flex-1 text-[16px] leading-normal font-normal text-[#151515] capitalize',
    /** 976:88484 — Nunito Regular 16 / 24, tracking -0.3125px */
    mobileRating:
      'font-sans whitespace-nowrap text-[16px] leading-6 font-normal tracking-[-0.3125px] text-[#151515]',
    /** 976:88485 — ~20px gold star */
    mobileStar: 'size-5 shrink-0',
    /** 976:88487 — Nunito Regular 16 / 24 */
    mobileCount:
      'font-sans whitespace-nowrap text-[16px] leading-6 font-normal tracking-[-0.3125px] text-[#4A4A4A]',
    desktopSectionTitle:
      'font-sans heading-preserve-case text-2xl leading-8 font-bold whitespace-nowrap text-[#151515]',
    /** 976:88533 mobile Regular 16/24; desktop 1078:53470 Semibold 18/28 */
    feedCount:
      'font-sans whitespace-nowrap text-[16px] leading-6 font-normal tracking-[-0.3125px] text-[#151515] laptop:text-lg laptop:leading-7 laptop:font-semibold laptop:tracking-normal',
    feedHeaderBorder: 'border-b border-[#f1f1f1] laptop:border-b-0',
    /** Offset sticky header when jumping from the PDP rating count. */
    sectionAnchorClass: 'scroll-mt-28 laptop:scroll-mt-24',
  },
  /**
   * Collection offer filter chips (filled = Figma “All” pill).
   * Fill matches demifine selected chip; taupe ring from the All mock.
   */
  offerFilterChip: {
    fill: '#ECE2DF',
    border: '#C4B8B8',
    baseClass: 'rounded-full border-2 px-4 py-2 text-[15px] font-normal leading-normal',
    selectedClass: 'border-[#C4B8B8] bg-[#ECE2DF] text-[#151515]',
    idleClass: 'border-[#D6D6D6] bg-white text-[#666]',
  },
} as const;

export type ProductThemeVariant = 'gold' | 'demifine';

/**
 * Resolve category accent tokens for PDP chrome.
 *
 * @param variant - Product category skin.
 * @returns Gold or demifine accent map.
 */
export function getProductVariantTokens(variant: ProductThemeVariant) {
  return variant === 'gold' ? productTokens.gold : productTokens.demifine;
}
