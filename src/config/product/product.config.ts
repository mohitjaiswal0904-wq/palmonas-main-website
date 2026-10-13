import rawConfig from '@/config/product/product.config.json';
import { productTokens } from '@/config/theme/product.tokens';
import type { ProductOffer } from '@/types/product';
import type { ProductReviewStarRating } from '@/types/product/reviews';

export type ProductConfig = typeof rawConfig;

export const productConfig = rawConfig as ProductConfig;

/** Localization-ready user-facing copy for the product (PDP) feature. */
export const productMessages = {
  ...productConfig.messages,
  a11y: {
    ...productConfig.messages.a11y,
    /** @param name - Image alt text, which keeps each gallery slide label unique. */
    formatOpenImageFullScreen: (name: string) =>
      productConfig.messages.a11y.openImageFullScreen.replace('{{name}}', name),
    /** @param name - Product display name for the full-screen viewer dialog. */
    formatFullScreenGallery: (name: string) =>
      productConfig.messages.a11y.fullScreenGallery.replace('{{name}}', name),
  },
  reviews: {
    ...productConfig.messages.reviews,
    /** @param count - Total review count from API stats. */
    formatBasedOnCount: (count: number) =>
      productConfig.messages.reviews.basedOnCount.replace('{{count}}', String(count)),
    /** @param count - Total review count shown in feed header. */
    formatReviewCount: (count: number) =>
      productConfig.messages.reviews.reviewCount.replace('{{count}}', String(count)),
    /** @param productName - Product display name for full reviews page title. */
    formatPageTitle: (productName: string) =>
      productConfig.messages.reviews.pageTitle.replace('{{productName}}', productName),
    /** @param stars - Star count for rating filter button. */
    formatStarRatingLabel: (stars: number) =>
      productConfig.messages.reviews.a11y.starRating.replace('{{stars}}', String(stars)),
    /** @param stars - Active star-rating filter for dropdown trigger. */
    formatRatingFilterTrigger: (stars: ProductReviewStarRating) =>
      productConfig.messages.reviews.ratingFilterTrigger.replace('{{stars}}', String(stars)),
    /** @param stars - Star rating row (1–5). @param count - Reviews at that rating. */
    formatRatingFilterLabel: (stars: number, count: number) =>
      productConfig.messages.reviews.a11y.ratingFilter
        .replace('{{stars}}', String(stars))
        .replace('{{count}}', String(count)),
    /** @param count - Review count shown next to the PDP rating. */
    formatScrollToReviews: (count: number) =>
      productConfig.messages.reviews.a11y.scrollToReviews.replace('{{count}}', String(count)),
    /** @param min - Minimum character count from write config. */
    formatMinCharactersHint: (min: number) =>
      productConfig.messages.reviews.minCharactersHint.replace('{{min}}', String(min)),
    /** @param count - Current body length. @param max - Max body length. */
    formatCharacterCount: (count: number, max: number) =>
      productConfig.messages.reviews.characterCount
        .replace('{{count}}', String(count))
        .replace('{{max}}', String(max)),
    /** @param stars - Star value for rate button a11y. */
    formatRateStarsLabel: (stars: number) =>
      productConfig.messages.reviews.a11y.rateStars.replace('{{stars}}', String(stars)),
    /** @param min - Minimum body length. */
    formatBodyTooShort: (min: number) =>
      productConfig.messages.reviews.validation.bodyTooShort.replace('{{min}}', String(min)),
    /** @param max - Maximum body length. */
    formatBodyTooLong: (max: number) =>
      productConfig.messages.reviews.validation.bodyTooLong.replace('{{max}}', String(max)),
  },
  /**
   * @param unitPrice - Formatted per-item bundle price.
   * @returns PDP offer title for a Buy-N-At deal.
   */
  formatBundleUnitTitle: (unitPrice: string) =>
    productConfig.messages.bundleUnitTitle.replace('{{unitPrice}}', unitPrice),
  /**
   * @param count - Extra items the shopper must add.
   * @param unitPrice - Formatted per-item bundle price.
   * @returns How-to-avail copy for a Buy-N-At deal.
   */
  formatBundleUnitHint: (count: number, unitPrice: string) =>
    productConfig.messages.bundleUnitHint
      .replace('{{count}}', String(count))
      .replace(
        '{{items}}',
        count === 1
          ? productConfig.messages.bundleItemSingular
          : productConfig.messages.bundleItemPlural,
      )
      .replace('{{unitPrice}}', unitPrice),
};

/** Static Diamond Guide sheet body (Figma-aligned). */
export const diamondGuideContent = productConfig.diamondGuideContent;

/** Static Size Guide sheet body shared by gold + demifine. */
export const sizeGuideContent = productConfig.sizeGuideContent;

/** PDP purchase-assurance icon assets (Shopify CDN). */
export const purchaseAssuranceIcons = productConfig.purchaseAssuranceIcons;

/** Single CMS strip that replaces the four gold trust badge cards. */
export const goldUspImage = productConfig.goldUspImage;

/** Downloaded Shopify USP badge assets for the demifine PDP strip. */
export const productUspBadges = productConfig.uspBadges;

/** Tag → USP slot rules used when the product API omits `usps`. */
export const productUspRules = productConfig.uspRules;

/** Static demifine PDP offer cards shown above the discounts area until API offers ship. */
export const demifineStaticOffers = (productConfig.demifineStaticOffers ?? []) as ProductOffer[];

/** Static demifine PDP promo content above the deals block. */
export const demifinePreDealsConfig = productConfig.demifinePreDeals;

/** Fallback PDP bundle rail titles when the API omits `title`. */
export const productBundleTitles = productConfig.messages.productBundles;

/**
 * Resolve a bundle rail heading from the API title, then config fallback.
 *
 * @param key - Bundle key from the products/bundles payload.
 * @param apiTitle - Optional title from the API.
 * @returns Visible section title.
 */
export function getProductBundleTitle(key: string, apiTitle?: string | null): string {
  const trimmed = apiTitle?.trim();
  if (trimmed) {
    return trimmed;
  }

  if (Object.prototype.hasOwnProperty.call(productBundleTitles, key)) {
    return productBundleTitles[key as keyof typeof productBundleTitles];
  }

  return key;
}

/** PDP UI color tokens from global theme config. */
export const productTheme = productTokens;

/**
 * Returns whether a product sub-feature flag is enabled in config.
 *
 * @param feature - Feature key from `product.config.json` features block.
 * @returns True when the feature is enabled.
 */
export function isProductFeatureEnabled(feature: keyof ProductConfig['features']): boolean {
  return productConfig.features[feature]?.enabled === true;
}
