import rawConfig from '@/config/product-listing/product-listing.config.json';

export type ProductListingConfig = typeof rawConfig;

export const productListingConfig = rawConfig as ProductListingConfig;

/** Localization-ready user-facing copy for product listing empty/filter states. */
export const productListingMessages = productListingConfig.messages;

/** Gold collection Price checkbox buckets (other categories stay API-driven). */
export const goldPriceFilterBuckets = productListingConfig.priceBuckets.gold;
