import type { GiftingStaticProduct } from '@/config/gifting/gifting.config';
import { formatPrice } from '@/lib/format-price';
import type { Product } from '@/types/product';

/**
 * Map a catalog `Product` into the gifting product-card view model.
 *
 * @param product - Transformed product from collection products API.
 * @returns Static card fields used by `GiftingProductCard`.
 */
export function mapProductToGiftingCard(product: Product): GiftingStaticProduct {
  const rating = product.avgRating ?? product.reviews?.avgRating;
  const reviewCount = product.reviewCount ?? product.reviews?.reviewCount;
  const primaryOffer = product.offers[0];
  const offerLabel = primaryOffer?.name?.trim() || primaryOffer?.description?.trim() || '';

  return {
    id: product.id,
    name: product.name,
    imageSrc: product.image,
    imageAlt: product.name,
    href: `/products/${product.handle}`,
    priceLabel: formatPrice(product.price),
    compareAtPriceLabel:
      product.compareAtPrice != null && product.compareAtPrice > product.price
        ? formatPrice(product.compareAtPrice)
        : '',
    rating: rating != null && rating > 0 ? rating.toFixed(1) : '—',
    reviewCount: reviewCount != null ? String(reviewCount) : '0',
    offerLabel,
    isBestseller: Boolean(
      product.badgeLabel?.toLowerCase().includes('best') ||
      product.productTags?.some((tag) => tag.value.toLowerCase().includes('bestseller')),
    ),
  };
}
