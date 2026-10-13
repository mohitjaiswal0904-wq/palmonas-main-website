import {
  goldPriceFilterBuckets,
  productListingConfig,
  productListingMessages,
} from '@/config/product-listing/product-listing.config';

describe('product-listing.config', () => {
  it('exposes empty-state copy for filtered listings', () => {
    expect(productListingMessages.emptyTitle).toBe(
      "Oops! We Don't Have Any Products In Matching Filter.",
    );
    expect(productListingMessages.clearFilters).toBe('Clear filters');
  });

  it('exposes a11y labels for the empty listing', () => {
    expect(productListingMessages.a11y.emptyListing).toBe(
      "Oops! We Don't Have Any Products In Matching Filter.",
    );
    expect(productListingMessages.a11y.clearFilters).toBe('Clear all selected filters');
    expect(productListingMessages.a11y.offerFilters).toBe('Offer filters');
    expect(productListingMessages.a11y.allOffers).toBe('All offers');
    expect(productListingMessages.labels.allOffers).toBe('All');
    expect(productListingMessages.loadErrorTitle).toBe("Couldn't load this collection");
    expect(productListingMessages.loadErrorCta).toBe('Try again');
  });

  it('exposes same-price toast copy for PW-623', () => {
    expect(productListingMessages.filters.samePriceToast).toBe(
      'Starting and ending price cannot be the same,',
    );
  });

  it('exposes gold price buckets matching the collection filter sheet', () => {
    expect(goldPriceFilterBuckets.map((bucket) => bucket.label)).toEqual([
      '₹ 0 - ₹ 10,000',
      '₹ 10,000 - ₹ 20,000',
      '₹ 20,000 - ₹ 30,000',
      '₹ 30,000 - ₹ 40,000',
      '₹ 40,000 - ₹ 50,000',
      '₹ 50,000 and Above',
    ]);
  });

  it('does not hardcode default price buckets (PW-626 — API-driven)', () => {
    expect(productListingConfig.priceBuckets).not.toHaveProperty('default');
  });

  it('keeps config messages on the root export', () => {
    expect(productListingConfig.messages).toBe(productListingMessages);
  });

  it('does not expose a home explore href anymore', () => {
    expect(productListingConfig).not.toHaveProperty('constants');
  });
});
