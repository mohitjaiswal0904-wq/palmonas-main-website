import rawConfig from '@/config/diwali/diwali.config.json';

interface DiwaliShopTabConfig {
  id: string;
  label: string;
  viewAllLabel: string;
  handle: string;
}

interface DiwaliConfig {
  pagePath: string;
  menuHandle: string;
  saleEndsAt: string;
  termsPath: string;
  productLimits: {
    giftBoxes: number;
    shop: number;
  };
  images: {
    headingDiya: string;
    offerArch: string;
    rupees999: string;
    flat40: string;
    hero: string;
    heroAlt: string;
    gifting: string;
    giftingAlt: string;
    giftBoxHero: string;
    giftBoxHeroAlt: string;
    silver: string;
    silverAlt: string;
    gold: string;
    goldAlt: string;
  };
  handles: {
    heroCollection: string;
    giftBoxes: string;
    silver: string;
    gold: string;
  };
  shopTabs: DiwaliShopTabConfig[];
  messages: {
    meta: { title: string; description: string };
    a11y: {
      countdownRegion: string;
      hero: string;
      loading: string;
      giftingBanner: string;
      offers: string;
      metals: string;
      giftBoxes: string;
      giftRail: string;
      shop: string;
      shopTabs: string;
      prepaid: string;
      terms: string;
    };
    countdown: {
      label: string;
      daySuffix: string;
      hourSuffix: string;
      minuteSuffix: string;
      secondSuffix: string;
    };
    giftingBanner: { eyebrow: string; title: string; cta: string };
    offers: {
      eyebrow: string;
      title: string;
      rupees999Kicker: string;
      rupees999Price: string;
      rupees999Note: string;
      imageSlot: string;
      rupees999Cta: string;
      flatKicker: string;
      flatPrice: string;
      flatNote: string;
      flatCta: string;
      bestValue: string;
      bundleTitle: string;
      bundleNote: string;
      bundleCta: string;
    };
    metals: {
      eyebrow: string;
      title: string;
      silverLabel: string;
      silverPrice: string;
      silverCta: string;
      goldLabel: string;
      goldPrice: string;
      goldCta: string;
      goldBadge: string;
    };
    giftBoxes: {
      eyebrow: string;
      title: string;
      kicker: string;
      price: string;
      cta: string;
      viewAll: string;
    };
    shop: { eyebrow: string; title: string };
    prepaid: { title: string; body: string };
    terms: { body: string; link: string };
  };
}

const diwaliConfig = rawConfig as DiwaliConfig;

/** Canonical path for the Diwali sale landing page. */
export const DIWALI_PAGE_PATH = diwaliConfig.pagePath;

/** Drawer handle that resolves to {@link DIWALI_PAGE_PATH}. */
export const DIWALI_MENU_HANDLE = diwaliConfig.menuHandle;

/** ISO timestamp when the Diwali sale countdown reaches zero (end of Diwali day, IST). */
export const DIWALI_SALE_ENDS_AT = diwaliConfig.saleEndsAt;

/** Existing FAQ route used for the sale terms link. */
export const DIWALI_TERMS_PATH = diwaliConfig.termsPath;

/** How many products to request for the gift rail and each shop tab. */
export const diwaliProductLimits = diwaliConfig.productLimits;

/** Campaign images already used elsewhere in the storefront. */
export const diwaliImages = diwaliConfig.images;

/** Collection handles for Diwali sections. */
export const diwaliHandles = diwaliConfig.handles;

/** Offer tabs for the Diwali collection block. */
export const diwaliShopTabs = diwaliConfig.shopTabs;

/** User-facing copy for the Diwali landing page. */
export const diwaliMessages = diwaliConfig.messages;
