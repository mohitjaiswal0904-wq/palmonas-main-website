import type { Product } from "@/types/product";

/**
 * Build the product-detail-page URL for a product. Core display fields are
 * carried in the query string so the PDP can show the clicked product without a
 * backend lookup (mock-data app).
 */
export function productHref(p: Product): string {
  const params = new URLSearchParams({
    title: p.title,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    discount: p.discount,
  });
  if (p.collection) params.set("collection", p.collection);
  return `/product/${encodeURIComponent(p.id)}?${params.toString()}`;
}

/** Map a collection name onto the mock-product theme used for related rows. */
export function themeForCollection(
  collection?: Product["collection"],
): "default" | "gold" | "silver" | "demifine" {
  switch (collection) {
    case "Gold":
      return "gold";
    case "Silver":
      return "silver";
    case "Demi-fine":
      return "demifine";
    default:
      return "default";
  }
}
