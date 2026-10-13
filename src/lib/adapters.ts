/**
 * Adapters that map raw Shopify API shapes to the internal UI product type.
 * Keeping them centralised means only one place changes when the API evolves.
 */

import type { SearchProduct } from "@/types/search";
import type { CollectionProduct } from "@/types/collection";
import type { ProductDetail } from "@/types/product-detail";
import type { Product, CartItem } from "@/types/product";
import {
  applyProductCardBadges,
  isNewArrivalProduct,
} from "@/lib/productBadges";
import { formatINR } from "@/lib/format";

/** @deprecated Use `formatINR` from `@/lib/format`. */
export const fmtINR = (n: number): string => formatINR(n);

/** Strip Shopify GID prefix and return the numeric id string. */
export const numericId = (gid: string): string =>
  gid.replace(/^gid:\/\/shopify\/[^/]+\//, "");

/** Map a search-result product to the card's Product shape. */
export function searchProductToCard(p: SearchProduct): Product {
  const collection =
    p.product_category === "gold"
      ? ("Gold" as const)
      : p.product_category === "silver"
        ? ("Silver" as const)
        : p.product_category === "demifine"
          ? ("Demi-fine" as const)
          : undefined;

  return applyProductCardBadges({
    id: numericId(p.id),
    title: p.name,
    image: p.imageUrl,
    price: fmtINR(p.price),
    mrp: fmtINR(p.originalPrice),
    discount:
      p.discounts.length > 0
        ? p.discounts[0].name
        : p.originalPrice > p.price
          ? `${Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF`
          : "",
    extraOffers: Math.max(0, p.discounts.length - 1),
    rating: p.rating,
    reviews: p.reviews.review_count,
    badge: p.banner?.text,
    isNewArrival: p.banner?.text
      ? isNewArrivalProduct({ tags: [p.banner.text] })
      : false,
    metals: Array.isArray(p.color) ? p.color : [p.color],
    collection,
  });
}

/** Map a collection-endpoint product to the card's Product shape. */
export function collectionProductToCard(p: CollectionProduct): Product {
  const firstVariant = p.variants?.[0];
  const price = firstVariant
    ? parseFloat(firstVariant.price.amount)
    : 0;
  const mrp = firstVariant?.compare_at_price
    ? parseFloat(firstVariant.compare_at_price.amount)
    : price;

  return applyProductCardBadges({
    id: p.id,
    title: p.title,
    image: p.images?.[0]?.url ?? "",
    price: fmtINR(price),
    mrp: fmtINR(mrp),
    discount: mrp > price ? `${Math.round(((mrp - price) / mrp) * 100)}% OFF` : "",
    extraOffers: 0,
    rating: 4.5,
    reviews: 0,
    isNewArrival: isNewArrivalProduct({
      tags: p.tags,
      created_at: p.created_at,
    }),
    metals: firstVariant?.selected_options
      .filter((o) => o.name === "Color")
      .map((o) => o.value) ?? [],
  });
}

/** Map a full ProductDetail to a CartItem ready for the store. */
export function productDetailToCartItem(
  p: ProductDetail,
  opts: { colour?: string; size?: string; qty?: number },
): Omit<CartItem, "lineId"> {
  const price = parseFloat(p.priceRange.minVariantPrice.amount);
  const mrp = parseFloat(p.priceRange.maxVariantPrice.amount);
  return {
    id: numericId(p.id),
    title: p.title,
    image: p.images?.[0]?.url ?? "",
    price,
    mrp,
    colour: opts.colour,
    size: opts.size,
    qty: opts.qty ?? 1,
  };
}
